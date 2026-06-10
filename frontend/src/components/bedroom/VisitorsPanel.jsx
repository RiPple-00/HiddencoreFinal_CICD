import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import visitAdminApi from "../../api/visitAdminApi";

const statusClassMap = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

function formatTime(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

function VisitorsPanel({ room, beds = [] }) {
  const { t } = useI18n();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusLabel = (status) =>
    t(`visitManagement.status.${status}`, status ?? "-");

  const patientIdsInRoom = useMemo(() => {
    return beds
      .filter((bed) => bed.patientId)
      .map((bed) => Number(bed.patientId));
  }, [beds]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await visitAdminApi.getVisitRequests();
      setVisits(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("면회 예약 조회 실패", error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const roomSuffix = t("visitors.roomSuffix", "호");

  const visibleVisits = useMemo(() => {
    return visits
      .filter((visit) => {
        const isActive =
          visit.status === "PENDING_APPROVAL" || visit.status === "APPROVED";

        if (!isActive) return false;

        if (patientIdsInRoom.length > 0 && visit.patientId) {
          return patientIdsInRoom.includes(Number(visit.patientId));
        }

        if (room && visit.patientRoom) {
          const roomPattern = roomSuffix
            ? `${room}${roomSuffix}`
            : String(room);
          return String(visit.patientRoom).includes(roomPattern);
        }

        return false;
      })
      .sort((a, b) => {
        const aDate = `${a.visitDate ?? ""} ${a.visitTime ?? ""}`;
        const bDate = `${b.visitDate ?? ""} ${b.visitTime ?? ""}`;
        return aDate.localeCompare(bDate);
      })
      .slice(0, 3);
  }, [visits, patientIdsInRoom, room, roomSuffix]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">{t("visitors.title")}</h3>

        <button
          type="button"
          onClick={fetchVisits}
          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
        >
          {t("visitors.refresh", "새로고침")}
        </button>
      </div>

      <p className="text-sm text-slate-600">{t("visitors.description")}</p>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
            {t("visitors.loading", "면회 예약을 불러오는 중입니다.")}
          </div>
        ) : visibleVisits.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
            {t("visitors.noReservation")}
          </div>
        ) : (
          visibleVisits.map((visit) => (
            <div
              key={visit.visitRequestId}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    statusClassMap[visit.status] ?? "bg-slate-100 text-slate-500"
                  }`}
                >
                  {statusLabel(visit.status)}
                </span>

                <span className="text-xs font-semibold text-slate-400">
                  {visit.visitType || t("visitors.defaultType", "면회")}
                </span>
              </div>

              <p className="text-sm font-bold text-slate-900">
                {t("visitors.guardianVisit", "{name} 보호자 방문", {
                  name: visit.patientName || t("visitors.patientFallback", "입소자"),
                })}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {visit.visitorName || "-"} · {visit.relationship || "-"}
              </p>

              <p className="mt-2 text-sm font-semibold text-blue-600">
                {visit.visitDate || "-"} {formatTime(visit.visitTime)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default VisitorsPanel;
