import api from "./index";

const MOCK = {
  patient: {
    id: 1,
    name: "홍길동",
    status: "입원중",
    room: "302",
    admissionDate: "2026.04.01",
    expectedTotal: 1280000,
    expectedTotalAsOf: "2026.04.28",
  },
  invoices: [
    {
      id: 101,
      month: "2026.04",
      title: "2026.04 청구서",
      issued: "2026.04.25",
      due: "2026.05.05",
      amount: 890000,
      status: "미납",
      tags: ["입원비", "식대"],
      period: "2026.04.01 ~ 2026.04.25",
      dept: "원무과",
      covered: [
        { name: "입원료", amount: 420000 },
        { name: "진료비", amount: 120000 },
      ],
      nonCovered: [{ name: "비급여 검사", amount: 350000 }],
    },
    {
      id: 100,
      month: "2026.03",
      title: "2026.03 청구서",
      issued: "2026.03.25",
      due: "2026.04.05",
      amount: 520000,
      status: "완납",
      tags: ["진료비", "약제비"],
      period: "2026.03.01 ~ 2026.03.25",
      dept: "원무과",
      covered: [{ name: "진료비", amount: 300000 }],
      nonCovered: [{ name: "약제비", amount: 220000 }],
    },
  ],
  payments: [
    {
      id: 9001,
      paidAt: "2026-04-26T10:12:00",
      title: "2026.03 청구 결제",
      amount: 520000,
      status: "완료",
      category: "진료비",
      invoiceId: 100,
    },
    {
      id: 9002,
      paidAt: "2026-04-20T09:05:00",
      title: "약제비 결제",
      amount: 120000,
      status: "완료",
      category: "약제비",
      invoiceId: 100,
    },
    {
      id: 9003,
      paidAt: "2026-04-28T14:30:00",
      title: "2026.04 청구(부분납)",
      amount: 300000,
      status: "부분납",
      category: "입원비",
      invoiceId: 101,
    },
    {
      id: 9004,
      paidAt: "2026-04-28T15:00:00",
      title: "2026.04 청구(미납)",
      amount: 590000,
      status: "미납",
      category: "입원비",
      invoiceId: 101,
    },
  ],
};

function ok(data) {
  return Promise.resolve({ data: { data } });
}

const storageApi = {
  // 1. 환자 조회
  getPatients: (params) => {
    return api.get(`/storage/patients`, { params }).catch(() => ok([MOCK.patient]));
  },

  // 2. 청구서 조회
  getInvoices: (params) => {
    return api.get(`/storage/invoices`, { params }).catch(() => {
      // id 단건 조회면 1건만
      if (params?.id) {
        const inv = MOCK.invoices.find((i) => String(i.id) === String(params.id));
        return ok(inv ? [inv] : []);
      }
      return ok(MOCK.invoices);
    });
  },

  // 3. 수납 처리
  processPayment: (paymentData) => {
    const body = { ...paymentData };
    if (body.paidAt === "" || body.paidAt == null) delete body.paidAt;
    if (body.memo === "" || body.memo == null) delete body.memo;
    return api.post(`/storage/payments`, body);
  },

  // 4. 미수납 잔액 수정
  updateOutstandingBalance: (balanceData) => {
    return api.put(`/storage/outstanding-balance`, balanceData);
  },

  // 5. 수납 내역 조회
  getPaymentHistories: (params) => {
    return api.get(`/storage/payments`, { params }).catch(() => ok(MOCK.payments));
  },

  // 6. 연체 내역 조회
  getOverdueHistories: (params) => {
    return api.get(`/storage/overdue`, { params }).catch(() => {
      const overdue = MOCK.payments.filter((p) => p.status === "미납" || p.status === "부분납");
      return ok(overdue);
    });
  },

  // 7. 영수증 / 납부확인서 출력
  printReceipt: (printData) => {
    return api.post(`/storage/receipts/print`, printData).catch(() =>
      Promise.resolve({ data: { url: null } })
    );
  },

  // 8. 수납 취소
  cancelPayment: (cancelData) => {
    return api.post(`/storage/payments/cancel`, cancelData);
  },

  // 9. 알람 요청
  sendAlarm: (alarmData) => {
    return api.post(`/storage/alarms`, alarmData);
  },
};

export default storageApi;