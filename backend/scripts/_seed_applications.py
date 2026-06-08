"""Seed POST_APPLICATION + DOCUMENT for program applicant management demo."""
from datetime import datetime, timedelta

import pymysql

from _db_local import mysql_connect_kwargs

conn = pymysql.connect(**mysql_connect_kwargs())
cur = conn.cursor()

cur.execute("SELECT facility_id FROM FACILITY ORDER BY facility_id")
facility_ids = [r[0] for r in cur.fetchall()]

patients_by_facility = {}
for fid in facility_ids:
    cur.execute(
        "SELECT patient_id FROM PATIENT WHERE facility_id=%s ORDER BY patient_id",
        (fid,),
    )
    patients_by_facility[fid] = [r[0] for r in cur.fetchall()]

cur.execute(
    "SELECT user_id FROM USERS WHERE users_role='GUARDIAN' ORDER BY user_id LIMIT 1"
)
guardian_row = cur.fetchone()
fallback_guardian = guardian_row[0] if guardian_row else None

cur.execute(
    """SELECT gp.patient_id, gp.guardian_user_id
       FROM GUARDIAN_PATIENT gp"""
)
guardian_by_patient = {r[0]: r[1] for r in cur.fetchall()}

cur.execute(
    """SELECT post_id, facility_id, title, capacity, current_enrolled
       FROM POST WHERE post_type='APPLY'"""
)
posts = cur.fetchall()

now = datetime.now()


def count_apps(post_id):
    cur.execute("SELECT COUNT(*) FROM POST_APPLICATION WHERE post_id=%s", (post_id,))
    return cur.fetchone()[0]


def count_status(post_id, status):
    cur.execute(
        "SELECT COUNT(*) FROM POST_APPLICATION WHERE post_id=%s AND postapplication_status=%s",
        (post_id, status),
    )
    return cur.fetchone()[0]


def insert_app(facility_id, post_id, title, patient_id, status, doc_status, days_ago):
    guardian_id = guardian_by_patient.get(patient_id, fallback_guardian)
    applied = now - timedelta(days=days_ago, hours=days_ago)
    cur.execute(
        """INSERT INTO DOCUMENT (
            patient_id, facility_id, post_id, document_type, title, content,
            requester_user_id, document_status, requested_at, approved_at, created_at, updated_at
        ) VALUES (%s,%s,%s,'PROGRAM_APPLICATION',%s,%s,%s,%s,%s,%s,NOW(),NOW())""",
        (
            patient_id,
            facility_id,
            post_id,
            title,
            "프로그램 참여 신청 (데모)",
            guardian_id or fallback_guardian,
            doc_status,
            applied,
            applied if doc_status == "APPROVED" else None,
        ),
    )
    doc_id = cur.lastrowid
    cur.execute(
        """INSERT INTO POST_APPLICATION (
            post_id, guardian_user_id, patient_id, document_id,
            postapplication_status, applied_at
        ) VALUES (%s,%s,%s,%s,%s,%s)""",
        (post_id, guardian_id, patient_id, doc_id, status, applied),
    )


for post_id, facility_id, title, _cap, enrolled in posts:
    patients = patients_by_facility.get(facility_id) or []
    if not patients:
        continue
    existing = count_apps(post_id)
    target = max(5, enrolled or 0)
    if existing >= target:
        print(f"post {post_id}: skip (already {existing})")
        continue

    confirmed_t = max(1, round(target * 0.55))
    waiting_t = max(1, round(target * 0.30))
    rejected_t = max(0, target - confirmed_t - waiting_t)

    used = set()
    cur.execute("SELECT patient_id FROM POST_APPLICATION WHERE post_id=%s", (post_id,))
    used.update(r[0] for r in cur.fetchall())

    pi = 0
    day = 1

    for status, doc_status, need_target in [
        ("COMPLETED", "APPROVED", confirmed_t),
        ("WAITING", "PENDING_APPROVAL", waiting_t),
        ("REJECTED", "REJECTED", rejected_t),
    ]:
        added = 0
        have = count_status(post_id, status)
        while have + added < need_target:
            if pi >= len(patients) * 3:
                break
            pid = patients[pi % len(patients)]
            pi += 1
            if pid in used:
                continue
            used.add(pid)
            insert_app(facility_id, post_id, title, pid, status, doc_status, day)
            day += 1
            added += 1

    cur.execute(
        """SELECT COUNT(*) FROM POST_APPLICATION
           WHERE post_id=%s AND postapplication_status='COMPLETED'""",
        (post_id,),
    )
    confirmed = cur.fetchone()[0]
    display = enrolled if enrolled and enrolled > confirmed else confirmed
    cur.execute(
        "UPDATE POST SET current_enrolled=%s WHERE post_id=%s",
        (display, post_id),
    )
    print(f"post {post_id}: apps={count_apps(post_id)} confirmed={confirmed}")

conn.commit()
conn.close()
print("done")
