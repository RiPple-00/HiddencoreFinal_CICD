// 주요 환자 관리

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../../api/patientApi';

const PAGE_SIZE = 3;
const KEY_PATIENT_STATUSES = new Set(['MONITORING', 'POSTOPERATIVE', 'CRITICAL']);

/** 위험도 높은 순 */
const STATUS_PRIORITY = { CRITICAL: 0, MONITORING: 1, POSTOPERATIVE: 2 };

const getStatusLabel = (status) => {
  switch (status) {
    case 'MONITORING':
      return '집중 관찰';
    case 'POSTOPERATIVE':
      return '수술후';
    case 'CRITICAL':
      return '위험';
    default:
      return status ?? '-';
  }
};

const statusBarClass = (status) => {
  switch (status) {
    case 'CRITICAL':
      return 'bg-[#e74c3c]';
    case 'MONITORING':
      return 'bg-[#f59e0b]';
    case 'POSTOPERATIVE':
      return 'bg-[#8b5cf6]';
    default:
      return 'bg-[#3b7de3]';
  }
};

function genderShort(g) {
  if (g === 'MALE') return 'M';
  if (g === 'FEMALE') return 'F';
  if (g === 'OTHER') return 'O';
  return '?';
}

function buildSummary(patient) {
  if (patient.building && patient.room) {
    return `${patient.building} / ${patient.room}호`;
  }
  return '병실 미배정';
}

function displayName(patient) {
  return `${patient.name ?? '환자'} (${genderShort(patient.gender)}/${patient.age ?? '?'})`;
}

export default function MainPatientManagement() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageIndex, setPageIndex] = useState(0);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientApi.getPatients();
      const list = Array.isArray(response.data) ? response.data : [];
      setPatients(list);
    } catch (e) {
      console.error(e);
      setPatients([]);
      setError('주요 환자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const keyPatients = useMemo(() => {
    return patients
      .filter(
        (p) =>
          KEY_PATIENT_STATUSES.has(p.patientStatus) && p.patientStatus !== 'DISCHARGED',
      )
      .sort((a, b) => {
        const pa = STATUS_PRIORITY[a.patientStatus] ?? 99;
        const pb = STATUS_PRIORITY[b.patientStatus] ?? 99;
        if (pa !== pb) return pa - pb;
        return (b.patientId ?? 0) - (a.patientId ?? 0);
      });
  }, [patients]);

  const totalPages = Math.max(1, Math.ceil(keyPatients.length / PAGE_SIZE));

  useEffect(() => {
    setPageIndex(0);
  }, [keyPatients.length]);

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages]);

  const visiblePatients = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return keyPatients.slice(start, start + PAGE_SIZE);
  }, [keyPatients, pageIndex]);

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < totalPages - 1;

  return (
    <div className="rounded-xl border border-[#dde4ee] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[32px] font-bold text-[#232f42]">주요 환자 관리</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#20a3c3]">
            {loading ? '…' : `${keyPatients.length} URGENT`}
          </span>
          {keyPatients.length > PAGE_SIZE && !loading ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={!canPrev}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e0e6ef] text-sm font-bold text-slate-600 transition hover:bg-[#f3f6fb] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="이전 환자"
              >
                ‹
              </button>
              <span className="min-w-[3rem] text-center text-xs font-semibold text-slate-500">
                {pageIndex + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                disabled={!canNext}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e0e6ef] text-sm font-bold text-slate-600 transition hover:bg-[#f3f6fb] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="다음 환자"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">불러오는 중…</p>
      ) : error ? (
        <p className="py-8 text-center text-sm font-semibold text-red-600">{error}</p>
      ) : keyPatients.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          집중 관찰·수술후·위험 상태의 환자가 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {visiblePatients.map((patient) => (
            <button
              key={patient.patientId}
              type="button"
              onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
              className="flex w-full items-center justify-between rounded-lg border border-[#e5e9f1] px-4 py-3 text-left transition hover:bg-[#f8fbff]"
            >
              <div className="flex min-w-0 flex-1 items-center">
                <div
                  className={`mr-3 h-10 w-1 shrink-0 rounded-full ${statusBarClass(patient.patientStatus)}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-xl font-bold text-slate-900">{displayName(patient)}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{buildSummary(patient)}</p>
                </div>
              </div>
              <div className="ml-3 shrink-0 text-right">
                <p className="text-[11px] font-bold uppercase text-[#7a8291]">
                  {patient.patientStatus}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#3f4b61]">
                  {getStatusLabel(patient.patientStatus)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
