import pymysql

from _db_local import mysql_connect_kwargs

c = pymysql.connect(**mysql_connect_kwargs())cur = c.cursor()
cur.execute(
    """SELECT pa.post_id, pa.application_id, pa.postapplication_status, p.facility_id
       FROM POST_APPLICATION pa
       JOIN POST p ON p.post_id = pa.post_id
       ORDER BY pa.post_id"""
)
for r in cur.fetchall():
    print(r)
c.close()
