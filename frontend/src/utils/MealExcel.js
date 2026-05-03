import * as XLSX from "xlsx";

export async function convertMealExcel(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  return transformRows(rows);
}

function transformRows(rows) {
  if (!rows || rows.length < 2) return [];

  const [, ...body] = rows;

  return body
    .filter(row => row[0] && String(row[0]).trim() !== "")
    .map(row => ({
      date: normalizeDate(row[0]),
      calorie: Number(row[4]) || 0,
      protein: Number(row[5]) || 0,
      meals: [
        { type: "BREAKFAST", menus: splitMenu(row[1]) },
        { type: "LUNCH", menus: splitMenu(row[2]) },
        { type: "DINNER", menus: splitMenu(row[3]) },
      ]
    }));
}

function splitMenu(value) {
  if (!value) return [];

  return String(value)
    .split(/,|\n/)
    .map(v => v.trim())
    .filter(Boolean);
}

function normalizeDate(value) {
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    const yyyy = parsed.y;
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof value === "string") {
    return value
      .replace(/[./]/g, "-")
      .replace(/\s/g, "");
  }

  return "";
}