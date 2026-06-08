"""시설 2 프로그램 신청 데모용 — 환자·신청 데이터 보강."""
import pymysql
from datetime import datetime, timedelta

from _db_local import mysql_connect_kwargs

conn = pymysql.connect(**mysql_connect_kwargs())
cur = conn.cursor()

cur.execute("SELECT facility_id FROM FACILITY WHERE facility_id = 2")
if not cur.fetchone():
    print("facility 2 missing")
    conn.close()
    raise SystemExit(1)

cur.execute("SELECT COUNT(*) FROM PATIENT WHERE facility_id = 2")
if cur.fetchone()[0] >= 10:
    print("facility 2 already has enough patients")
else:
    cur.execute(
        """SELECT name, gender, birth_date, admission_status, status
           FROM PATIENT WHERE facility_id = 1 ORDER BY patient_id LIMIT 15"""
    )
    rows = cur.fetchall()
    now = datetime.now()
    for i, (name, gender, birth, adm_status, status) in enumerate(rows):
        new_id = 260402000 + i + 1
        cur.execute("SELECT 1 FROM PATIENT WHERE patient_id=%s", (new_id,))
        if cur.fetchone():
            continue
        cur.execute(
            """INSERT INTO PATIENT (
                patient_id, facility_id, name, gender, birth_date, admission_date,
                admission_status, status, created_at, updated_at
            ) VALUES (%s, 2, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (new_id, f"{name}(2관)", gender, birth, now.date(), adm_status, status, now, now),
        )
    print("inserted patients for facility 2")

cur.execute("SELECT user_id FROM USERS WHERE users_role='GUARDIAN' LIMIT 1")
guardian = cur.fetchone()
if guardian:
    gid = guardian[0]
    cur.execute("SELECT patient_id FROM PATIENT WHERE facility_id = 2")
    for (pid,) in cur.fetchall():
        cur.execute(
            "SELECT 1 FROM GUARDIAN_PATIENT WHERE guardian_user_id=%s AND patient_id=%s",
            (gid, pid),
        )
        if not cur.fetchone():
            cur.execute(
                """INSERT INTO GUARDIAN_PATIENT (guardian_user_id, patient_id, is_primary, created_at)
                   VALUES (%s, %s, 0, NOW())""",
                (gid, pid),
            )

conn.commit()
conn.close()
print("done patients")
