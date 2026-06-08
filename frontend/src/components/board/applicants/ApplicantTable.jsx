import { formatDate, toDate } from '../../../utils/dateUtils';
import { useI18n } from '../../../hooks/useI18n';

const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return '-';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(date)} ${hours}:${minutes}`;
};

const getStatusTone = (status) => {
  if (status === 'COMPLETED') return 'bg-blue-100 text-blue-700';
  if (status === 'WAITING') return 'bg-teal-100 text-teal-700';
  if (status === 'REJECTED') return 'bg-amber-100 text-amber-800';
  if (status === 'CANCELLED') return 'bg-rose-100 text-rose-600';
  return 'bg-slate-100 text-slate-600';
};

const ApplicantTable = ({
  mode = 'waiting',
  applicants = [],
  onApprove,
  onReject,
  onMoveToWaiting,
  emptyMessage,
  isUpdating = false,
}) => {
  const { t } = useI18n();
  const empty = emptyMessage ?? t('applicant.noApplicants');

  if (applicants.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-sm text-slate-400">
        {empty}
      </div>
    );
  }

  const showActions = mode === 'waiting' || mode === 'confirmed';

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
            <th className="py-3 pr-4">No.</th>
            <th className="py-3 pr-4">{t('applicant.name')}</th>
            <th className="py-3 pr-4">{t('applicant.genderAge')}</th>
            <th className="py-3 pr-4">{t('applicant.contact')}</th>
            <th className="py-3 pr-4">{t('applicant.appliedAt')}</th>
            <th className="py-3 pr-4">{t('applicant.status')}</th>
            {showActions ? <th className="py-3 text-right">{t('applicant.manage')}</th> : null}
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant, index) => (
            <tr key={applicant.applicationId ?? index} className="border-b border-slate-100 text-slate-700">
              <td className="py-4 pr-4 text-slate-500">{index + 1}</td>
              <td className="py-4 pr-4 font-medium text-slate-900">{applicant.patientName ?? '-'}</td>
              <td className="py-4 pr-4">{applicant.genderAge ?? '-'}</td>
              <td className="py-4 pr-4">{applicant.guardianPhone ?? '-'}</td>
              <td className="py-4 pr-4">{formatDateTime(applicant.appliedAt)}</td>
              <td className="py-4 pr-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(applicant.status)}`}>
                  {applicant.statusLabel ?? applicant.status ?? '-'}
                </span>
              </td>
              {showActions ? (
                <td className="py-4 text-right">
                  {mode === 'waiting' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onApprove?.(applicant.applicationId)}
                        className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {t('applicant.approve')}
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onReject?.(applicant.applicationId)}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {t('applicant.reject')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onMoveToWaiting?.(applicant.applicationId)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        {t('applicant.moveToWaiting')}
                      </button>
                    </div>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicantTable;
