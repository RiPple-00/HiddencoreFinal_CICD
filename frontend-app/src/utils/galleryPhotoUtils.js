import { resolveApiBaseUrl } from "../api";

export function resolveGalleryImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = resolveApiBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatGalleryTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((startToday - startTarget) / (1000 * 60 * 60 * 24));

  const timePart = d.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) return timePart;
  if (diffDays === 1) return `어제 ${timePart}`;

  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}월 ${day}일 (${weekday}) ${timePart}`;
}

export function mapGalleryCardToPhoto(card) {
  if (!card) return null;
  return {
    id: card.documentId,
    documentId: card.documentId,
    title: card.title,
    content: card.content,
    desc: card.content,
    time: formatGalleryTime(card.uploadedAt),
    image: resolveGalleryImageUrl(card.imageUrl),
    imageUrl: resolveGalleryImageUrl(card.imageUrl),
    uploadedAt: card.uploadedAt,
    takenAt: card.uploadedAt ? new Date(card.uploadedAt) : new Date(),
  };
}

export function mapGallerySlots(slots) {
  if (!Array.isArray(slots)) return [];
  return slots.map((card, index) => {
    if (!card) return null;
    const photo = mapGalleryCardToPhoto(card);
    return photo ? { ...photo, slotIndex: index + 1 } : null;
  });
}

export const GALLERY_PHOTOS_PER_PAGE = 6;

export function mapGalleryPhotos(slots) {
  if (!Array.isArray(slots)) return [];
  return slots.map((card, index) => {
    if (!card) return null;
    const photo = mapGalleryCardToPhoto(card);
    return photo ? { ...photo, slotIndex: index + 1 } : null;
  });
}

/** @deprecated mapGalleryPhotos 사용 */
export function mapGallerySlotsForGrid(slots) {
  return mapGalleryPhotos(slots);
}
