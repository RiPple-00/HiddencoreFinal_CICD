package hiddencore.ddasum.backend.tools;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import hiddencore.ddasum.backend.config.KimMankyungPatientSeeder;

/**
 * 기만경 환자 한글 깨짐 복구 — JDBC UTF-8로 직접 갱신.
 * 실행: {@code ./gradlew fixKimEncoding}
 */
public final class FixKimMankyungEncoding {

    private static final String JDBC_URL =
            "jdbc:mysql://localhost:3306/ddasum?serverTimezone=Asia/Seoul"
                    + "&useUnicode=true&characterEncoding=UTF-8"
                    + "&connectionCollation=utf8mb4_unicode_ci";

    private FixKimMankyungEncoding() {}

    public static void main(String[] args) throws Exception {
        String user = System.getenv().getOrDefault("MYSQL_USERNAME", "root");
        String password = System.getenv().getOrDefault("MYSQL_PASSWORD", "12345");

        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection(JDBC_URL, user, password)) {
            conn.createStatement().execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
            convertTableUtf8(conn, "PATIENT");
            convertTableUtf8(conn, "LOCATION");

            try (PreparedStatement ps =
                    conn.prepareStatement(
                            """
                            UPDATE PATIENT
                            SET name = ?, address = ?, admission_status = ?, memo = ?, updated_at = NOW()
                            WHERE patient_id = ?
                            """)) {
                ps.setString(1, KimMankyungPatientSeeder.KIM_PATIENT_NAME);
                ps.setString(2, "서울특별시 종로구");
                ps.setString(3, KimMankyungPatientSeeder.DIAGNOSIS_TITLE);
                ps.setString(4, KimMankyungPatientSeeder.DIAGNOSIS_COMMENT);
                ps.setLong(5, KimMankyungPatientSeeder.KIM_PATIENT_ID);
                System.out.println("PATIENT rows updated: " + ps.executeUpdate());
            }

            try (PreparedStatement ps =
                    conn.prepareStatement(
                            "UPDATE LOCATION SET building = ? WHERE patient_id = ?")) {
                ps.setString(1, "A동");
                ps.setLong(2, KimMankyungPatientSeeder.KIM_PATIENT_ID);
                System.out.println("LOCATION rows updated: " + ps.executeUpdate());
            }

            try (ResultSet rs =
                    conn.createStatement()
                            .executeQuery(
                                    "SELECT name, HEX(name), admission_status, LEFT(memo, 20) AS memo_preview"
                                            + " FROM PATIENT WHERE patient_id = "
                                            + KimMankyungPatientSeeder.KIM_PATIENT_ID)) {
                if (rs.next()) {
                    System.out.println("name=" + rs.getString(1));
                    System.out.println("name_hex=" + rs.getString(2));
                    System.out.println("admission_status=" + rs.getString(3));
                    System.out.println("memo_preview=" + rs.getString(4));
                }
            }
        }
    }

    private static void convertTableUtf8(Connection conn, String table) {
        try {
            conn.createStatement()
                    .execute(
                            "ALTER TABLE "
                                    + table
                                    + " CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            System.out.println(table + " converted to utf8mb4");
        } catch (Exception e) {
            System.out.println(table + " charset convert skipped: " + e.getMessage());
        }
    }
}
