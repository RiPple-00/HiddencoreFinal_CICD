import { Platform } from "react-native";

/**
 * React Native / 웹 모두에서 multipart file 필드를 FormData에 넣습니다.
 */
export async function appendImageFile(formData, { uri, mimeType, fileName = "activity.jpg" }) {
  if (!uri) {
    throw new Error("이미지 URI가 없습니다.");
  }

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const type = mimeType || blob.type || "image/jpeg";
    const file =
      typeof File !== "undefined"
        ? new File([blob], fileName, { type })
        : blob;
    formData.append("file", file, fileName);
    return;
  }

  formData.append("file", {
    uri,
    type: mimeType || "image/jpeg",
    name: fileName,
  });
}

export function formatUploadError(error) {
  if (!error) return "알 수 없는 오류가 발생했습니다.";
  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return String(data.message);
  if (data?.detail) return String(data.detail);
  if (error.code === "ECONNABORTED") {
    return "요청 시간이 초과되었습니다. 백엔드(8080)와 AI 서버(8000) 상태를 확인해 주세요.";
  }
  if (error.message === "Network Error") {
    return "서버에 연결할 수 없습니다. PC에서 백엔드(8080)가 실행 중인지, 앱 API 주소가 맞는지 확인해 주세요.";
  }
  if (error.message) return error.message;
  return "사진 업로드에 실패했습니다.";
}
