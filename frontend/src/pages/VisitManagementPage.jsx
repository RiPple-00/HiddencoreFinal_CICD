import { useEffect, useMemo, useState } from "react";
import Header from "../components/common/Header";
import visitAdminApi from "../api/visitAdminApi";

const statusLabelMap = {
  PENDING_APPROVAL: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  CANCELLED: "취소",
};

const statusClassMap = {
  PENDING_APPROVAL: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-blue-200 bg-blue-50 text-blue-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-500",
};

function formatDate(value) {
  if (!value) return "-";
  return value;
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

export default function VisitManagementPage() {
  const [visitRequests, setVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchVisitRequests = async () => {
    try {
      setLoading(true);
      const response = await visitAdminApi.getVisitRequests();
      setVisitRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("면회 신청 목록 조회 실패", error);
      setVisitRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitRequests();
  }, []);

  const summary = useMemo(() => {
    const list = Array.isArray(visitRequests) ? visitRequests : [];

    return {
      total: list.length,
      pending: list.filter((item) => item.status === "PENDING_APPROVAL").length,
      approved: list.filter((item) => item.status === "APPROVED").length,
      rejected: list.filter((item) => item.status === "REJECTED").length,
    };
  }, [visitRequests]);

  const filteredRequests = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    return (Array.isArray(visitRequests) ? visitRequests : []).filter((item) => {
      const matchesStatus = !statusFilter || item.status === statusFilter;

      const matchesKeyword =
        !lowerKeyword ||
        item.patientName?.toLowerCase().includes(lowerKeyword) ||
        item.visitorName?.toLowerCase().includes(lowerKeyword) ||
        item.visitorPhone?.includes(keyword.trim()) ||
        item.relationship?.toLowerCase().includes(lowerKeyword) ||
        item.visitType?.toLowerCase().includes(lowerKeyword);

      return matchesStatus && matchesKeyword;
    });
  }, [visitRequests, keyword, statusFilter]);

  const handleApprove = async (visitRequestId) => {
    const ok = window.confirm("이 면회 신청을 승인하시겠습니까?");
    if (!ok) return;

    try {
      setProcessingId(visitRequestId);
      await visitAdminApi.approveVisitRequest(visitRequestId);
      await fetchVisitRequests();
    } catch (error) {
      console.error("면회 신청 승인 실패", error);
      alert("면회 신청 승인에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (visitRequestId) => {
    setRejectTargetId(visitRequestId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (processingId) return;
    setRejectModalOpen(false);
    setRejectTargetId(null);
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectTargetId) return;

    const reason = rejectReason.trim();
    if (!reason) {
      alert("반려 사유를 입력해 주세요.");
      return;
    }

    try {
      setProcessingId(rejectTargetId);
      await visitAdminApi.rejectVisitRequest(rejectTargetId, reason);
      closeRejectModal();
      await fetchVisitRequests();
    } catch (error) {
      console.error("면회 신청 반려 실패", error);
      alert("면회 신청 반려에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}
    >
      <Header
        activeNav="visits"
        userName="김관리자 (Admin Kim)"
        userRole="SUPERUSER"
        searchPlaceholder="면회 신청 검색..."
      />

      <main className="mx-auto w-full max-w-[1440px] px-8 py-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">면회 관리</h1>
              <p className="mt-2 text-sm text-slate-500">
                보호자가 신청한 면회 예약을 조회하고 승인 또는 반려할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchVisitRequests}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              새로고침
            </button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
              <p className="text-sm font-medium text-slate-500">전체 신청</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{summary.total}</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
              <p className="text-sm font-medium text-amber-700">승인 대기</p>
              <p className="mt-3 text-3xl font-bold text-amber-700">{summary.pending}</p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5">
              <p className="text-sm font-medium text-blue-700">승인 완료</p>
              <p className="mt-3 text-3xl font-bold text-blue-700">{summary.approved}</p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
              <p className="text-sm font-medium text-red-700">반려</p>
              <p className="mt-3 text-3xl font-bold text-red-700">{summary.rejected}</p>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="입소자명, 신청자명, 연락처 검색"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">전체 상태</option>
              <option value="PENDING_APPROVAL">승인 대기</option>
              <option value="APPROVED">승인 완료</option>
              <option value="REJECTED">반려</option>
              <option value="CANCELLED">취소</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse bg-white text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">상태</th>
                  <th className="px-5 py-4 font-semibold">입소자</th>
                  <th className="px-5 py-4 font-semibold">병실</th>
                  <th className="px-5 py-4 font-semibold">신청자</th>
                  <th className="px-5 py-4 font-semibold">연락처</th>
                  <th className="px-5 py-4 font-semibold">관계</th>
                  <th className="px-5 py-4 font-semibold">면회 일시</th>
                  <th className="px-5 py-4 font-semibold">유형</th>
                  <th className="px-5 py-4 text-center font-semibold">관리</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                      면회 신청 목록을 불러오는 중...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                      면회 신청 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((item) => {
                    const isPending = item.status === "PENDING_APPROVAL";
                    const isProcessing = processingId === item.visitRequestId;

                    return (
                      <tr key={item.visitRequestId} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                              statusClassMap[item.status] ??
                              "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {statusLabelMap[item.status] ?? item.status ?? "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {item.patientName || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.patientRoom || "병실 미배정"}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {item.visitorName || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.visitorPhone || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.relationship || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {formatDate(item.visitDate)} {formatTime(item.visitTime)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.visitType || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              disabled={!isPending || isProcessing}
                              onClick={() => handleApprove(item.visitRequestId)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              승인
                            </button>

                            <button
                              type="button"
                              disabled={!isPending || isProcessing}
                              onClick={() => openRejectModal(item.visitRequestId)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              반려
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {rejectModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900">면회 신청 반려</h3>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              반려 사유를 입력해 주세요.
              <br />
              입력한 사유는 문서 내용에 함께 저장됩니다.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="예: 해당 시간대 면회 인원이 초과되었습니다."
              className="mt-5 h-28 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={Boolean(processingId)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={Boolean(processingId)}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingId ? "처리 중..." : "반려"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}