export const FACILITY_ID = 2;

export const BOARD_MENUS = [
  {
    label: "전체게시판",
    value: "ALL",
    types: ["URGENT", "CLINICAL", "ADMIN", "FACILITY", "GENERAL"],
  },
  {
    label: "공지사항",
    value: "NOTICE",
    types: ["URGENT", "CLINICAL", "ADMIN", "FACILITY"],
  },
  {
    label: "자유게시판",
    value: "GENERAL",
    types: ["GENERAL"],
  },
];

export const BADGE_LABELS = {
  URGENT: "긴급",
  CLINICAL: "임상",
  ADMIN: "행정",
  FACILITY: "시설",
  GENERAL: "일반",
};

export const rowId = (post) => post?.id ?? post?.postId;

export const normalizePostList = (data) => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : [];

  return [...list].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();

    return bTime - aTime;
  });
};

export const parseAttachmentUrls = (attachmentUrls) => {
  if (!attachmentUrls) return [];

  if (Array.isArray(attachmentUrls)) {
    return attachmentUrls;
  }

  if (typeof attachmentUrls !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(attachmentUrls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const formatBoardDate = (dateText) => {
  if (!dateText) return "날짜 미정";

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "날짜 미정";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

export const formatBoardDateTime = (dateText) => {
  if (!dateText) return "날짜 미정";

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "날짜 미정";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hour}:${minute}`;
};