import api from "./index";
import { resolveFacilityId } from "../utils/facilityId";

/** 오늘 일정 목록 — GET /api/schedules/today?facilityId= */
export async function getTodaySchedules(facilityId) {
  const fid = facilityId ?? (await resolveFacilityId());
  return api.get("/api/schedules/today", { params: { facilityId: fid } });
}

/** 월별 일정 목록 — GET /api/schedules/month?facilityId=&date=&filter= */
export async function getMonthSchedules(facilityId, date, filter) {
  const fid = facilityId ?? (await resolveFacilityId());
  return api.get("/api/schedules/month", {
    params: { facilityId: fid, date, ...(filter ? { filter } : {}) },
  });
}
