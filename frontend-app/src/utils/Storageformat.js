/**
 * 백엔드 응답 → UI 데이터 변환 헬퍼
 */

const STATUS_KO_MAP = {
  PAID: "완납", PARTIAL: "부분납", UNPAID: "미납",
  OVERDUE: "미납", COMPLETED: "완료",
};
export function toKoStatus(status) {
  if (!status) return "";
  return STATUS_KO_MAP[status] ?? status;
}

const CATEGORY_KO_MAP = {
  ROOM: "입원료", ROOM_FEE: "입원료", ADMISSION: "입원비",
  TREATMENT: "진료비", MEAL: "식대",
  MEDICATION: "약제비", DRUG: "약제비",
};
export function toKoCategory(cat) {
  if (!cat) return "";
  return CATEGORY_KO_MAP[cat] ?? cat;
}

export function toNumber(amount) {
  if (typeof amount === "number") return amount;
  if (amount == null) return 0;
  return parseInt(String(amount).replace(/[^0-9-]/g, ""), 10) || 0;
}
export function formatWon(amount) {
  return toNumber(amount).toLocaleString("ko-KR") + "원";
}
export function formatWonSymbol(amount) {
  return "₩" + toNumber(amount).toLocaleString("ko-KR");
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

export function normalizeInvoice(raw) {
  return {
    id: raw.id ?? raw.invoiceId,
    month: raw.month ?? formatYearMonth(raw.issuedAt ?? raw.issued_at),
    title: raw.title ?? `${formatYearMonth(raw.issuedAt ?? raw.issued_at)} 청구서`,
    issued: formatDate(raw.issuedAt ?? raw.issued_at ?? raw.issued),
    due:    formatDate(raw.dueAt    ?? raw.due_at    ?? raw.due),
    amount: formatWon(raw.amount),
    amountNumber: toNumber(raw.amount),
    status: toKoStatus(raw.status),
    tags: (raw.tags ?? raw.categories ?? []).map(toKoCategory),
  };
}

export function normalizePayment(raw) {
  const dt = splitDateTime(raw.paidAt ?? raw.paid_at ?? raw.date ?? raw.createdAt);
  return {
    id: raw.id ?? raw.paymentId,
    date: dt.date,
    time: dt.time,
    title: raw.title ?? `${toKoCategory(raw.category)} 결제`,
    amount: formatWonSymbol(raw.amount),
    amountWon: formatWon(raw.amount),
    amountNumber: toNumber(raw.amount),
    status: toKoStatus(raw.status),
    tag: toKoCategory(raw.category ?? raw.tag),
    invoiceId: raw.invoiceId ?? raw.invoice_id ?? raw.relatedInvoiceId,
    raw,
  };
}

export function normalizePatient(raw) {
  return {
    id: raw.id ?? raw.patientId,
    name: raw.name,
    status: raw.status ?? (raw.admitted ? "입원중" : ""),
    room: raw.room ?? raw.roomNo ?? raw.room_no,
    admissionDate: formatDate(raw.admissionDate ?? raw.admission_date),
    expectedTotal: toNumber(raw.expectedTotal ?? raw.expected_total ?? raw.outstandingAmount),
    expectedTotalAsOf: formatDate(raw.expectedTotalAsOf ?? raw.as_of ?? raw.updatedAt),
  };
}