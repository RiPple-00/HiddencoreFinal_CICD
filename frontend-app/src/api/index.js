import axios from "axios";
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "accessToken";
/**
 * Metro/Expo가 8081일 수 있어 Spring API 기본 포트는 8080(application.yml server.port)에 맞춥니다.
 * 맞지 않으면 루트에 .env 에 EXPO_PUBLIC_API_BASE_URL=http://PC_IP:포트
 */
function parseHostFromScriptURL() {
  try {
    const url = NativeModules?.SourceCode?.scriptURL;
    if (!url || typeof url !== "string") return null;
    const { hostname } = new URL(url);
    if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
      return null;
    }
    return hostname;
  } catch {
    return null;
  }
}

export function resolveApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const port = process.env.EXPO_PUBLIC_API_PORT?.trim() || "8080";

  const hostFromScript = parseHostFromScriptURL();
  if (hostFromScript) {
    return `http://${hostFromScript}:${port}`;
  }

  const dh =
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (typeof dh === "string" && dh.includes(":")) {
    return `http://${dh.split(":")[0]}:${port}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${port}`;
  }
  // 웹: 브라우저 출처와 API 호스트명을 맞춤 (localhost vs 127.0.0.1 혼용 시 CORS 방지)
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.location?.hostname
  ) {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      const pagePort =
        window.location.port ||
        (window.location.protocol === "https:" ? "443" : "80");
      // Expo 웹과 Spring이 같은 포트를 쓰면 API 요청이 번들러로 감 → API 포트는 .env로 분리
      if (String(pagePort) === String(port) && !process.env.EXPO_PUBLIC_API_BASE_URL?.trim()) {
        const fallback =
          process.env.EXPO_PUBLIC_API_FALLBACK_PORT?.trim() || "8080";
        return `http://${h}:${fallback}`;
      }
      return `http://${h}:${port}`;
    }
  }
  return `http://127.0.0.1:${port}`;
}

const baseURL = resolveApiBaseUrl();

const api = axios.create({
  baseURL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[api] baseURL =", baseURL);
}


export async function saveAccessToken(token) {
  if (!token) return;
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function clearAccessToken() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
