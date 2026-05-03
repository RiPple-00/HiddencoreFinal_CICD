/** API·DB enum (MALE/FEMALE/OTHER) → 화면용 */
export function genderCodeToLabel(code) {
  if (code == null || code === "") return "-";
  if (code === "MALE") return "남성";
  if (code === "FEMALE") return "여성";
  if (code === "OTHER") return "기타";
  return String(code);
}
