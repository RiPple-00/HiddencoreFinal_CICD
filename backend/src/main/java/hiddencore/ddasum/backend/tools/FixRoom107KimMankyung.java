package hiddencore.ddasum.backend.tools;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import hiddencore.ddasum.backend.config.DemoPatientConstants;

/**
 * A동 107호 1번 침상을 기만경(260401008)으로 맞추고 잘못 배정된 환자를 제거.
 * 실행: {@code ./gradlew fixRoom107Kim}
 */
public final class FixRoom107KimMankyung {

    private static final long JANG_PATIENT_ID = 260401007L;

    private static final String JDBC_URL =
            "jdbc:mysql://localhost:3306/ddasum?serverTimezone=Asia/Seoul"
                    + "&useUnicode=true&characterEncoding=UTF-8"
                    + "&connectionCollation=utf8mb4_unicode_ci";

    private FixRoom107KimMankyung() {}

    public static void main(String[] args) throws Exception {
        String user = System.getenv().getOrDefault("MYSQL_USERNAME", "root");
        String password = System.getenv().getOrDefault("MYSQL_PASSWORD", "12345");

        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection(JDBC_URL, user, password)) {
            conn.setAutoCommit(false);
            conn.createStatement().execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

            clearDuplicateBeds(conn);
            clearWrongPatientsFromRoom107(conn);
            assignKimToBed1(conn);
            restoreJangToRoom105(conn);

            conn.commit();
            printRoom107(conn);
        }
    }

    private static void clearDuplicateBeds(Connection conn) throws Exception {
        try (PreparedStatement ps =
                conn.prepareStatement(
                        """
                        UPDATE LOCATION dup
                        INNER JOIN (
                          SELECT MIN(location_id) AS keep_id, bed
                          FROM LOCATION
                          WHERE building = 'A동' AND floor = 1 AND room = '107'
                          GROUP BY bed
                        ) k ON dup.bed = k.bed AND dup.location_id <> k.keep_id
                        SET dup.patient_id = NULL, dup.is_occupied = 0
                        WHERE dup.building = 'A동' AND dup.floor = 1 AND dup.room = '107'
                        """)) {
            System.out.println("duplicate beds cleared: " + ps.executeUpdate());
        }
    }

    private static void clearWrongPatientsFromRoom107(Connection conn) throws Exception {
        try (PreparedStatement ps =
                conn.prepareStatement(
                        """
                        UPDATE PATIENT p
                        INNER JOIN LOCATION l ON p.location_id = l.location_id
                        SET p.location_id = NULL
                        WHERE l.building = 'A동' AND l.floor = 1 AND l.room = '107'
                          AND p.patient_id <> ?
                        """)) {
            ps.setLong(1, DemoPatientConstants.KIM_PATIENT_ID);
            System.out.println("patients unlinked from 107: " + ps.executeUpdate());
        }

        try (PreparedStatement ps =
                conn.prepareStatement(
                        """
                        UPDATE LOCATION
                        SET patient_id = NULL, is_occupied = 0
                        WHERE building = 'A동' AND floor = 1 AND room = '107'
                        """)) {
            System.out.println("107 beds emptied: " + ps.executeUpdate());
        }
    }

    private static void assignKimToBed1(Connection conn) throws Exception {
        Long bed1Id;
        try (PreparedStatement ps =
                conn.prepareStatement(
                        """
                        SELECT MIN(location_id) FROM LOCATION
                        WHERE building = 'A동' AND floor = 1 AND room = '107' AND bed = 1
                        """)) {
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next() || rs.getObject(1) == null) {
                    throw new IllegalStateException("107호 1번 침상 LOCATION 없음");
                }
                bed1Id = rs.getLong(1);
            }
        }

        try (PreparedStatement ps =
                conn.prepareStatement(
                        """
                        UPDATE LOCATION
                        SET patient_id = ?, is_occupied = 1, room_capacity = 4
                        WHERE location_id = ?
                        """)) {
            ps.setLong(1, DemoPatientConstants.KIM_PATIENT_ID);
            ps.setLong(2, bed1Id);
            System.out.println("bed1 assigned to 기만경: " + ps.executeUpdate());
        }

        try (PreparedStatement ps =
                conn.prepareStatement(
                        "UPDATE PATIENT SET location_id = ? WHERE patient_id = ?")) {
            ps.setLong(1, bed1Id);
            ps.setLong(2, DemoPatientConstants.KIM_PATIENT_ID);
            System.out.println("기만경 location_id updated: " + ps.executeUpdate());
        }
    }

    private static void restoreJangToRoom105(Connection conn) throws Exception {
        Long bed105Id;
        try (PreparedStatement ps =
                conn.prepareStatement(
                        """
                        SELECT MIN(location_id) FROM LOCATION
                        WHERE building = 'A동' AND floor = 1 AND room = '105' AND bed = 1
                        """)) {
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next() || rs.getObject(1) == null) {
                    System.out.println("105호 1번 침상 없음 — 장원준 복원 스킵");
                    return;
                }
                bed105Id = rs.getLong(1);
            }
        }

        try (PreparedStatement ps =
                conn.prepareStatement("UPDATE PATIENT SET location_id = NULL WHERE patient_id = ?")) {
            ps.setLong(1, JANG_PATIENT_ID);
            ps.executeUpdate();
        }

        try (PreparedStatement ps =
                conn.prepareStatement(
                        "UPDATE LOCATION SET patient_id = NULL, is_occupied = 0 WHERE location_id = ?")) {
            ps.setLong(1, bed105Id);
            ps.executeUpdate();
        }

        try (PreparedStatement ps =
                conn.prepareStatement(
                        "UPDATE LOCATION SET patient_id = ?, is_occupied = 1 WHERE location_id = ?")) {
            ps.setLong(1, JANG_PATIENT_ID);
            ps.setLong(2, bed105Id);
            ps.executeUpdate();
        }

        try (PreparedStatement ps =
                conn.prepareStatement(
                        "UPDATE PATIENT SET location_id = ? WHERE patient_id = ?")) {
            ps.setLong(1, bed105Id);
            ps.setLong(2, JANG_PATIENT_ID);
            System.out.println("장원준 → 105호 복원: " + ps.executeUpdate());
        }
    }

    private static void printRoom107(Connection conn) throws Exception {
        try (ResultSet rs =
                conn.createStatement()
                        .executeQuery(
                                """
                                SELECT l.location_id, l.bed, l.is_occupied, p.patient_id, p.name
                                FROM LOCATION l
                                LEFT JOIN PATIENT p ON l.patient_id = p.patient_id
                                WHERE l.building = 'A동' AND l.floor = 1 AND l.room = '107'
                                ORDER BY l.bed, l.location_id
                                """)) {
            System.out.println("--- A동 107호 ---");
            while (rs.next()) {
                System.out.printf(
                        "location=%d bed=%d occupied=%s patient=%s name=%s%n",
                        rs.getLong("location_id"),
                        rs.getInt("bed"),
                        rs.getObject("is_occupied"),
                        rs.getObject("patient_id"),
                        rs.getString("name"));
            }
        }
    }
}
