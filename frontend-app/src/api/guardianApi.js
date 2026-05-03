import axios from "axios";

// 🔥 여기가 핵심 (네 PC IP로 바꿔야함)
const API = axios.create({
  baseURL: "http://10.100.0.168:8080",
});

// 공지사항
export const getNotices = () => API.get("/api/notices");

// 식단
export const getMeals = () => API.get("/api/meals");

// 환자 정보
export const getPatient = () => API.get("/api/patient");