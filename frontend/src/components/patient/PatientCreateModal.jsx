import { useMemo, useState } from "react";
import patientApi from "../../api/patientApi";
import { useI18n } from "../../hooks/useI18n";

function createEmptyFormData() {
  return {
    name: "",
    gender: "",
    birthDate: "",
    address: "",
    bloodType: "",
    admissionDate: new Date().toISOString().split("T")[0],
    building: "",
    floor: "",
    room: "",
    bed: "",
    roomType: "",
    locationId: null,
    memo: "",
  };
}

function ChevronDown({ className = "" }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function PatientCreateModal({
  open,
  onClose,
  onSuccess,
  beds = [],
}) {
  const { t } = useI18n();

  const today = useMemo(() => new Date(), []);
  const todayY = today.getFullYear();
  const pad2 = (n) => String(n).padStart(2, "0");
  const toIsoDate = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;
  const daysInMonth = (y, m) => new Date(y, m, 0).getDate();

  const [formData, setFormData] = useState(createEmptyFormData);
  const [birthY, setBirthY] = useState(null);
  const [birthM, setBirthM] = useState(null);
  const [birthD, setBirthD] = useState(null);
  const [openBirthPicker, setOpenBirthPicker] = useState(null);

  const yearOptions = useMemo(() => {
    const minY = 1900;
    const ys = [];
    for (let y = todayY; y >= minY; y -= 1) ys.push(y);
    return ys;
  }, [todayY]);

  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const maxDay = useMemo(() => {
    if (!birthY || !birthM) return 31;
    return daysInMonth(birthY, birthM);
  }, [birthY, birthM]);
  const dayOptions = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);

  const syncBirthDate = (y, m, d) => {
    if (!y || !m || !d) {
      setFormData((prev) => ({ ...prev, birthDate: "" }));
      return;
    }
    const safeD = Math.min(Math.max(1, d), daysInMonth(y, m));
    setFormData((prev) => ({ ...prev, birthDate: toIsoDate(y, m, safeD) }));
  };

  const onPickYear = (y) => {
    setBirthY(y);
    setBirthM(null);
    setBirthD(null);
    setOpenBirthPicker(null);
    syncBirthDate(null, null, null);
  };

  const onPickMonth = (m) => {
    setBirthM(m);
    setBirthD(null);
    setOpenBirthPicker(null);
    syncBirthDate(null, null, null);
  };

  const onPickDay = (d) => {
    setBirthD(d);
    setOpenBirthPicker(null);
    syncBirthDate(birthY, birthM, d);
  };

  const monthEnabled = Boolean(birthY);
  const dayEnabled = Boolean(birthY && birthM);

  if (!open) return null;

  const resetForm = () => {
    setFormData(createEmptyFormData());
    setBirthY(null);
    setBirthM(null);
    setBirthD(null);
    setOpenBirthPicker(null);
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "building") return { ...prev, building: value, floor: "", room: "", bed: "" };
      if (name === "floor") return { ...prev, floor: value, room: "", bed: "" };
      if (name === "roomType") return { ...prev, roomType: value, room: "", bed: "" };
      if (name === "room") return { ...prev, room: value, bed: "" };
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientApi.createPatient({ ...formData });
      alert(t('patient.register.success'));
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error(t('patient.register.error'), error);
      alert(t('patient.register.error'));
    }
  };

  const yearSuffix = t('patient.register.yearSuffix');
  const monthSuffix = t('patient.register.monthSuffix');
  const daySuffix = t('patient.register.daySuffix');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">{t('patient.register.title')}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium">{t('patient.register.name')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">{t('patient.register.gender')}</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">{t('patient.register.select')}</option>
              <option value="MALE">{t('patient.gender.maleFull')}</option>
              <option value="FEMALE">{t('patient.gender.femaleFull')}</option>
              <option value="OTHER">{t('patient.gender.other')}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">{t('patient.register.birthDate')}</label>
            <div className="grid grid-cols-3 gap-2">
              {/* Year */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenBirthPicker((v) => (v === "y" ? null : "y"))}
                  className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left"
                >
                  <span className={birthY ? "text-slate-900" : "text-slate-400"}>
                    {birthY ? `${birthY}${yearSuffix}` : t('patient.register.yearPlaceholder')}
                  </span>
                  <ChevronDown className="text-slate-500" />
                </button>
                {openBirthPicker === "y" && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
                    <div className="max-h-56 overflow-y-auto">
                      {yearOptions.map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => onPickYear(y)}
                          className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                            birthY === y ? "bg-slate-100 font-semibold" : ""
                          }`}
                        >
                          {y}{yearSuffix}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Month */}
              <div className="relative">
                <button
                  type="button"
                  disabled={!monthEnabled}
                  onClick={() => setOpenBirthPicker((v) => (v === "m" ? null : "m"))}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${
                    monthEnabled ? "bg-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span className={birthM ? "text-slate-900" : "text-slate-400"}>
                    {birthM ? `${birthM}${monthSuffix}` : t('patient.register.monthPlaceholder')}
                  </span>
                  <ChevronDown className={monthEnabled ? "text-slate-500" : "text-slate-300"} />
                </button>
                {openBirthPicker === "m" && monthEnabled && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
                    <div className="max-h-56 overflow-y-auto">
                      {monthOptions.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => onPickMonth(m)}
                          className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                            birthM === m ? "bg-slate-100 font-semibold" : ""
                          }`}
                        >
                          {m}{monthSuffix}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Day */}
              <div className="relative">
                <button
                  type="button"
                  disabled={!dayEnabled}
                  onClick={() => setOpenBirthPicker((v) => (v === "d" ? null : "d"))}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${
                    dayEnabled ? "bg-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span className={birthD ? "text-slate-900" : "text-slate-400"}>
                    {birthD ? `${birthD}${daySuffix}` : t('patient.register.dayPlaceholder')}
                  </span>
                  <ChevronDown className={dayEnabled ? "text-slate-500" : "text-slate-300"} />
                </button>
                {openBirthPicker === "d" && dayEnabled && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
                    <div className="max-h-56 overflow-y-auto">
                      {dayOptions.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => onPickDay(d)}
                          className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                            birthD === d ? "bg-slate-100 font-semibold" : ""
                          }`}
                        >
                          {d}{daySuffix}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium">{t('patient.register.bloodType')}</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">{t('patient.register.select')}</option>
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">{t('patient.register.address')}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">{t('patient.register.admissionDate')}</label>
            <input
              type="date"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">{t('patient.register.memo')}</label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
              placeholder={t('patient.register.memoPlaceholder')}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border px-4 py-2"
            >
              {t('patient.register.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              {t('patient.register.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
