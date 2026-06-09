import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

export const ACCESS_TOKEN_KEY = "accessToken";

export async function persistAccessToken(token) {
  if (token) await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  else await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

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

function resolveMetroDevHost() {
  const hostFromScript = parseHostFromScriptURL();
  if (hostFromScript) {
    return hostFromScript;
  }

  const dh =
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (typeof dh === "string" && dh.includes(":")) {
    return dh.split(":")[0];
  }
  return null;
}

export function resolveApiBaseUrl() {
  const port = process.env.EXPO_PUBLIC_API_PORT?.trim() || "8080";
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const devHost = resolveMetroDevHost();

  // 폰(Expo Go): QR의 IP(핫스팟·Wi-Fi)를 그대로 API에 사용 — .env 고정 IP보다 우선
  if (Platform.OS !== "web" && devHost) {
    return `http://${devHost}:${port}`;
  }

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (devHost) {
    return `http://${devHost}:${port}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${port}`;
  }
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
      if (String(pagePort) === String(port) && !fromEnv) {
        const fallback =
          process.env.EXPO_PUBLIC_API_FALLBACK_PORT?.trim() || "8080";
        return `http://${h}:${fallback}`;
      }
      return `http://${h}:${port}`;
    }
    // 배포 웹(app.ddasum.shop 등): 같은 도메인 Nginx가 /api 프록시 → 상대 경로
    return "";
  }
  return `http://127.0.0.1:${port}`;
}

/** 챗봇 FastAPI(ai/chatbot) — Metro/PC IP + 포트 8001 (활동 AI 8000과 분리) */
export function resolveChatbotUrl() {
  const chatbotPort =
    process.env.EXPO_PUBLIC_CHATBOT_PORT?.trim() || "8001";
  const fromEnv = process.env.EXPO_PUBLIC_CHATBOT_URL?.trim();
  const devHost = resolveMetroDevHost();

  if (Platform.OS !== "web" && devHost) {
    return `http://${devHost}:${chatbotPort}`;
  }

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (apiBase) {
    try {
      const { hostname } = new URL(apiBase);
      if (hostname) {
        return `http://${hostname}:${chatbotPort}`;
      }
    } catch {
      /* fall through */
    }
  }

  if (devHost) {
    return `http://${devHost}:${chatbotPort}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${chatbotPort}`;
  }
  return `http://127.0.0.1:${chatbotPort}`;
}

const baseURL = resolveApiBaseUrl();

const api = axios.create({
  baseURL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  // multipart 업로드 시 boundary가 포함된 Content-Type을 브라우저/RN이 설정하도록 둠
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (config.headers?.set) {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }
  return config;
});

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[api] baseURL =", baseURL);
}

export async function saveAccessToken(token) {
  await persistAccessToken(token);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

/** JWT payload (role, facilityId 등). base64url 디코딩. */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    if (typeof atob === "undefined") return null;
    const raw = atob(base64);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearAccessToken() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

export default api;
