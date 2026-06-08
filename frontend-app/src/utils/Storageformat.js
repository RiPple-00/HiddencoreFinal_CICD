/**
 * 백엔드 응답 → UI 데이터 변환 헬퍼
 */

const LOCALE_MAP = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
};

export function toNumber(amount) {
  if (typeof amount === "number") return amount;
  if (amount == null) return 0;
  return parseInt(String(amount).replace(/[^0-9-]/g, ""), 10) || 0;
}

export function formatCurrency(amount, language = "ko") {
  const number = toNumber(amount);
  const locale = LOCALE_MAP[language] ?? LOCALE_MAP.ko;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(number);
  } catch {
    return `${number.toLocaleString(locale)} KRW`;
  }
}

export function formatWon(amount, language = "ko") {
  const number = toNumber(amount);
  if (language === "ko") {
    return `${number.toLocaleString("ko-KR")}원`;
  }
  return formatCurrency(number, language);
}

export function formatWonSymbol(amount, language = "ko") {
  const number = toNumber(amount);
  if (language === "ko") {
    return `₩${number.toLocaleString("ko-KR")}`;
  }
  return formatCurrency(number, language);
}

function translateWithFallback(translate, path, fallback) {
  if (typeof translate !== "function") return fallback;
  const translated = translate(path, fallback);
  return translated === undefined || translated === null ? fallback : translated;
}
export function splitDateTime(input) {
  if (!input) return { date: "", time: "" };
  const s = String(input).replace("T", " ").replace(/-/g, ".").replace("Z", "");
  const [date = "", timeRaw = ""] = s.split(" ");
  return { date, time: timeRaw.split(".")[0] };
}
export function formatDate(input) {
  return splitDateTime(input).date;
}
export function formatYearMonth(input) {
  const d = formatDate(input);
  return d.split(".").slice(0, 2).join(".");
}

export function normalizeInvoice(raw, translate = () => undefined, language = "ko") {
  const translateLabel = (path, fallback) => translateWithFallback(translate, path, fallback);
  const tags = (raw.tags ?? raw.categories ?? []).map((tag) =>
    translateLabel(`storage.category.${tag}`, tag ?? ""),
  );
  return {
    id: raw.id ?? raw.invoiceId,
    month: raw.month ?? formatYearMonth(raw.issuedAt ?? raw.issued_at),
    title:
      raw.title ??
      `${formatYearMonth(raw.issuedAt ?? raw.issued_at)} ${translateLabel(
        "storage.invoice_action",
        "청구서",
      )}`,
    issued: formatDate(raw.issuedAt ?? raw.issued_at ?? raw.issued),
    due: formatDate(raw.dueAt ?? raw.due_at ?? raw.due),
    amount: formatWon(raw.amount, language),
    amountNumber: toNumber(raw.amount),
    status: translateLabel(`storage.status.${raw.status}`, raw.status ?? ""),
    statusCode: raw.status ?? "",
    tags,
    tagKeys: raw.tags ?? raw.categories ?? [],
  };
}

export function normalizePayment(raw, translate = () => undefined, language = "ko") {
  const translateLabel = (path, fallback) => translateWithFallback(translate, path, fallback);
  const categoryKey = raw.category ?? raw.tag ?? "";
  const categoryLabel = translateLabel(`storage.category.${categoryKey}`, categoryKey);
  const dt = splitDateTime(raw.paidAt ?? raw.paid_at ?? raw.date ?? raw.createdAt);
  return {
    id: raw.id ?? raw.paymentId,
    date: dt.date,
    time: dt.time,
    title:
      raw.title ?? `${categoryLabel} ${translateLabel("storage.payment_action", "결제")}`,
    amount: formatWonSymbol(raw.amount, language),
    amountWon: formatWon(raw.amount, language),
    amountNumber: toNumber(raw.amount),
    status: translateLabel(`storage.status.${raw.status}`, raw.status ?? ""),
    statusCode: raw.status ?? "",
    tag: translateLabel(`storage.category.${categoryKey}`, categoryLabel),
    tagKey: categoryKey,
    invoiceId: raw.invoiceId ?? raw.invoice_id ?? raw.relatedInvoiceId,
    raw,
  };
}

export function normalizePatient(raw, translate = () => undefined) {
  const translateLabel = (path, fallback) => translateWithFallback(translate, path, fallback);
  return {
    id: raw.id ?? raw.patientId,
    name: raw.name,
    status:
      raw.status ?? (raw.admitted ? translateLabel("storage.patient.status.admitted", "입원중") : ""),
    room: raw.room ?? raw.roomNo ?? raw.room_no,
    admissionDate: formatDate(raw.admissionDate ?? raw.admission_date),
    expectedTotal: toNumber(raw.expectedTotal ?? raw.expected_total ?? raw.outstandingAmount),
    expectedTotalAsOf: formatDate(raw.expectedTotalAsOf ?? raw.as_of ?? raw.updatedAt),
  };
}