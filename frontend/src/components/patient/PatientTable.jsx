import { useMemo, useEffect, useState } from "react";

const genderLabel = (g) => {
  if (g == null) return "-";
  if (typeof g !== "string") return String(g);
  if (g === "MALE") return "남";
  if (g === "FEMALE") return "여";
  if (g === "OTHER") return "기타";
  return g;
};

/** Patient 도메인 PatientStatus enum 과 동일 */
const getStatusLabel = (status) => {
  switch (status) {
    case "STABLE":
      return "안정";
    case "MONITORING":
      return "집중관찰";
    case "DISCHARGE":
      return "퇴원예정";
    case "POSTOPERATIVE":
      return "수술후";
    case "CRITICAL":
      return "위험";
    case "DISCHARGED":
      return "퇴원완료";
    default:
      return "-";
  }
};

const getStatusClassName = (status) => {
  switch (status) {
    case "STABLE":
      return "bg-green-100 text-green-700";
    case "MONITORING":
      return "bg-orange-100 text-orange-700";
    case "DISCHARGE":
      return "bg-blue-100 text-blue-700";
    case "POSTOPERATIVE":
      return "bg-purple-100 text-purple-700";
    case "CRITICAL":
      return "bg-red-100 text-red-600";
    case "DISCHARGED":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

const ROWS_PER_PAGE = 10;

export default function PatientTable({ patients, onRowClick }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalCount = patients.length;
  const totalPages = Math.ceil(totalCount / ROWS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [patients]);

  const currentPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return patients.slice(startIndex, endIndex);
  }, [patients, currentPage]);

  const startNumber =
    totalCount === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const endNumber = Math.min(currentPage * ROWS_PER_PAGE, totalCount);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [1];

    const maxVisible = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);
    return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <table className="w-full border-collapse bg-white">
        <thead className="bg-slate-100 text-sm font-semibold text-slate-500">
          <tr>
            <th className="px-8 py-5 text-center">환자 ID</th>
            <th className="px-8 py-5 text-center">성명</th>
            <th className="px-8 py-5 text-center">성별/나이</th>
            <th className="px-8 py-5 text-center">병동/병실</th>
            <th className="px-8 py-5 text-center">입원일자</th>
            <th className="px-8 py-5 text-center">상태</th>
          </tr>
        </thead>

        <tbody>
          {totalCount === 0 ? (
            <tr>
              <td colSpan={6} className="px-8 py-12 text-center text-sm text-slate-400">
                검색 결과가 없습니다.
              </td>
            </tr>
          ) : (
            currentPatients.map((patient) => (
              <tr
                key={patient.patientId}
                onClick={() => onRowClick?.(patient)}
                className={`border-t border-slate-100 ${
                  onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                }`}
              >
                <td className="px-8 py-7 text-center font-mono text-[18px] text-slate-500">
                  {patient.patientId}
                </td>

                <td className="px-8 py-7 text-center text-[18px] font-semibold text-slate-800">
                  {patient.name}
                </td>

                <td className="px-8 py-7 text-center text-[18px] text-slate-700">
                  {genderLabel(patient.gender)} / {patient.age}
                </td>

                <td className="px-8 py-7 text-center text-[18px] text-slate-700">
                  {patient.building && patient.room
                    ? `${patient.building}-${patient.room}`
                    : "-"}
                </td>

                <td className="px-8 py-7 text-center text-[18px] font-semibold text-slate-800">
                  {patient.admissionDate || "-"}
                </td>

                <td className="px-8 py-7 text-center">
                  <span
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusClassName(
                      patient.patientStatus
                    )}`}
                  >
                    {getStatusLabel(patient.patientStatus)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalCount > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-8 py-5">
          <p className="text-sm text-slate-500">
            전체 {totalCount.toLocaleString()}명 중 {startNumber}-{endNumber} 표시 중
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              ‹
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${
                  currentPage === page
                    ? "bg-blue-700 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
