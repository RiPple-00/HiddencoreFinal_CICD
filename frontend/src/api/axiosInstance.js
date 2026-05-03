import axios from "axios";

// 공통 axios 설정
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api", // 백엔드 API의 기본 URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키를 포함하여 요청을 보냄
});

// 인증 토큰 붙이기
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // 토큰을 로컬 스토리지에서 가져옴
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
  }
    return config;
});

export default axiosInstance;
