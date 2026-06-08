import { useI18n } from '../../../hooks/useI18n';

const formatRemainingDays = (remainingDays, closedLabel) => {
  if (remainingDays == null) return '-';
  if (remainingDays < 0) return closedLabel;
  if (remainingDays === 0) return 'D-Day';
  return `D-${remainingDays}`;
};

const formatRecruitmentStatus = (programInfo, unit) => {
  const capacity = programInfo?.totalQuota;
  const enrolled = programInfo?.currentEnrolled;
  if (capacity == null && enrolled == null) return '-';
  if (capacity == null) return `${enrolled ?? 0}${unit}`;
  return `${enrolled ?? 0} / ${capacity}`;
};

const ApplicantStatsCards = ({ programInfo }) => {
  const { t } = useI18n();
  const unit = t('applicant.unit');

  const cards = [
    {
      label: t('applicant.recruitStatus'),
      value: formatRecruitmentStatus(programInfo, unit),
      tone: 'text-slate-900',
    },
    { label: t('applicant.confirmed'), value: `${programInfo?.confirmedCount ?? 0}${unit}`, tone: 'text-blue-700' },
    { label: t('applicant.waiting'), value: `${programInfo?.waitingCount ?? 0}${unit}`, tone: 'text-teal-700' },
    { label: t('applicant.remaining'), value: formatRemainingDays(programInfo?.remainingDays, t('applicant.closed')), tone: 'text-red-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ApplicantStatsCards;
