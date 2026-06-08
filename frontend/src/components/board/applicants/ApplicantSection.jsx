import { useI18n } from '../../../hooks/useI18n';

const ApplicantSection = ({ title, count, children, actionSlot = null }) => {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {typeof count === 'number' && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {count}{t('applicant.unit')}
            </span>
          )}
        </div>
        {actionSlot}
      </div>
      <div className="px-6 py-4">{children}</div>
    </section>
  );
};

export default ApplicantSection;
