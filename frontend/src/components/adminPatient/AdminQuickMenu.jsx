import { useI18n } from '../../hooks/useI18n';

export default function AdminQuickMenu() {
  const { t } = useI18n();

  const items = [
    { labelKey: 'quickMenu.settlement', glyph: '🧾' },
    { labelKey: 'quickMenu.certificate', glyph: '📄' },
    { labelKey: 'quickMenu.membership', glyph: '🪪' },
    { labelKey: 'quickMenu.insurance', glyph: '💳' },
  ];

  return (
    <section className="rounded-2xl border border-[#e8eaef] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-900">{t('quickMenu.title')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ labelKey, glyph }) => (
          <button
            key={labelKey}
            type="button"
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#eef0f4] bg-[#f7f8fa] px-3 py-4 text-center transition hover:border-[#cfe0ff] hover:bg-[#eef4ff]"
          >
            <span className="text-2xl leading-none">{glyph}</span>
            <span className="text-xs font-bold text-slate-700">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
