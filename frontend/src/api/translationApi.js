import axiosInstance from "./axiosInstance";

/**
 * 텍스트 하나를 번역합니다.
 * @returns {Promise<string>} 번역된 텍스트 (실패 시 원본 반환)
 */
export async function translateOne(text, sourceLanguage = "ko", targetLanguage) {
  if (!text || !targetLanguage || sourceLanguage === targetLanguage) return text;
  try {
    const { data } = await axiosInstance.post("/v1/translations", {
      text,
      sourceLanguage,
      targetLanguages: [targetLanguage],
    });
    return data?.translations?.[targetLanguage] ?? text;
  } catch {
    return text;
  }
}

/**
 * 여러 텍스트를 한 번에 번역합니다.
 * @param {string[]} texts
 * @returns {Promise<string[]>} 입력 순서와 동일한 번역 결과 배열 (실패 시 원본 배열 반환)
 */
export async function translateBatch(texts, sourceLanguage = "ko", targetLanguage) {
  if (!texts?.length || !targetLanguage || sourceLanguage === targetLanguage) return texts;
  try {
    const { data } = await axiosInstance.post("/v1/translations/batch", {
      texts,
      sourceLanguage,
      targetLanguage,
    });
    return Array.isArray(data) ? data : texts;
  } catch {
    return texts;
  }
}

const translationApi = { translateOne, translateBatch };
export default translationApi;
