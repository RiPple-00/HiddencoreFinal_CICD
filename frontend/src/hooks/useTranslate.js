import { useEffect, useRef, useState } from "react";
import { useI18n } from "./useI18n";
import { translateOne, translateBatch } from "../api/translationApi";

// 모듈 수준 캐시 — 페이지 이동 후에도 재사용, 새로고침 시 초기화
// key: `${lang}|${text}` → 번역된 텍스트
const _cache = new Map();

function cacheGet(lang, text) {
  return _cache.get(`${lang}|${text}`);
}
function cacheSet(lang, text, translated) {
  _cache.set(`${lang}|${text}`, translated);
}

/**
 * 언어 변경 시 텍스트 배열을 백그라운드에서 미리 번역해 캐시에 채웁니다.
 * 이미 캐시된 항목은 건너뜁니다.
 */
export async function warmupCache(texts, language) {
  if (!texts?.length || language === 'ko') return;
  const unique = [...new Set(texts.filter(Boolean))];
  const uncached = unique.filter((t) => cacheGet(language, t) === undefined);
  if (!uncached.length) return;
  const results = await translateBatch(uncached, 'ko', language);
  uncached.forEach((t, i) => cacheSet(language, t, results[i] ?? t));
}

/**
 * 단일 텍스트 번역 훅.
 * 언어가 'ko'이면 원본을 그대로 반환합니다.
 */
export function useTranslatedText(text) {
  const { language } = useI18n();
  const [translated, setTranslated] = useState(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    setTranslated(null);

    if (!text || language === "ko") return;

    const cached = cacheGet(language, text);
    if (cached !== undefined) {
      setTranslated(cached);
      return;
    }

    translateOne(text, "ko", language).then((result) => {
      if (cancelRef.current) return;
      cacheSet(language, text, result);
      setTranslated(result);
    });

    return () => {
      cancelRef.current = true;
    };
  }, [text, language]);

  if (language === "ko") return text;
  return translated ?? text;
}

/**
 * 여러 텍스트 배치 번역 훅.
 * 반환값: `getTranslated(text)` 함수 — 번역 완료 전까지는 원본을 반환합니다.
 *
 * @example
 * const getTranslated = useTranslatedTexts(posts.map(p => p.title));
 * // JSX에서: {getTranslated(post.title)}
 */
export function useTranslatedTexts(texts) {
  const { language } = useI18n();
  const [translationMap, setTranslationMap] = useState({});
  const cancelRef = useRef(false);

  // texts 배열을 안정적인 문자열 키로 변환 (배열 참조 변경에 의한 무한 루프 방지)
  const textsKey = (texts ?? []).join("\x00");

  useEffect(() => {
    cancelRef.current = false;
    const list = (texts ?? []).filter(Boolean);

    if (!list.length || language === "ko") {
      setTranslationMap({});
      return;
    }

    // 캐시에 없는 고유 텍스트만 추출
    const unique = [...new Set(list)];
    const uncached = unique.filter((t) => cacheGet(language, t) === undefined);

    const applyCache = () => {
      const map = {};
      list.forEach((t) => {
        map[t] = cacheGet(language, t) ?? t;
      });
      setTranslationMap(map);
    };

    if (!uncached.length) {
      applyCache();
      return;
    }

    translateBatch(uncached, "ko", language).then((results) => {
      if (cancelRef.current) return;
      uncached.forEach((t, i) => cacheSet(language, t, results[i] ?? t));
      applyCache();
    });

    return () => {
      cancelRef.current = true;
    };
  }, [textsKey, language]);

  return (text) => (language === "ko" ? text : (translationMap[text] ?? text));
}
