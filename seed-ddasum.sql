-- Seed data for ddasum (MySQL 8)
-- Creates:
-- - 1 facility
-- - A동 1층 (11 rooms), A동 2층 (12 rooms) with mixed capacities (1/2/4/6)
-- - Locations (beds) per room capacity
-- - Patients, assigned to some beds with gender rules
--
-- Safe to run after you TRUNCATE tables (recommended).

SET @now := NOW();

-- ------------------------------------------------------------
-- Facility
-- ------------------------------------------------------------
INSERT INTO `FACILITY` (`name`, `address`, `phone`, `created_at`, `updated_at`)
VALUES ('Hiddencore Hospital', 'Seoul', '02-000-0000', @now, @now);
SET @facility_id := LAST_INSERT_ID();

-- ------------------------------------------------------------
-- Helpers: we insert LOCATION rows room-by-room.
-- building stored as 'A' to match LocationService/WardPage query param.
-- room stored as '101', bed stored as '1'..'N'
-- room_type: GENERAL | ICU | ISOLATION
-- roomgender_type: MALE | FEMALE | CONCOCTION
-- ------------------------------------------------------------

-- A동 1층: 101~111 (11 rooms)
-- capacities: 6,4,4,2,1,4,6,4,2,4,1  (mix includes 1/2/4/6)
-- ICU/ISOLATION placed "randomly"

-- 101 (6인실, 남)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'101','1','GENERAL','MALE',6,@now,@now,0),
(@facility_id,NULL,'A',1,'101','2','GENERAL','MALE',6,@now,@now,0),
(@facility_id,NULL,'A',1,'101','3','GENERAL','MALE',6,@now,@now,0),
(@facility_id,NULL,'A',1,'101','4','GENERAL','MALE',6,@now,@now,0),
(@facility_id,NULL,'A',1,'101','5','GENERAL','MALE',6,@now,@now,0),
(@facility_id,NULL,'A',1,'101','6','GENERAL','MALE',6,@now,@now,0);

-- 102 (4인실, 여)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'102','1','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'102','2','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'102','3','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'102','4','GENERAL','FEMALE',4,@now,@now,0);

-- 103 (4인실, 혼합)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'103','1','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',1,'103','2','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',1,'103','3','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',1,'103','4','GENERAL','CONCOCTION',4,@now,@now,0);

-- 104 (2인실, ICU, 남)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'104','1','ICU','MALE',2,@now,@now,0),
(@facility_id,NULL,'A',1,'104','2','ICU','MALE',2,@now,@now,0);

-- 105 (1인실, ISOLATION, 여)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'105','1','ISOLATION','FEMALE',1,@now,@now,0);

-- 106 (4인실, 여)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'106','1','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'106','2','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'106','3','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'106','4','GENERAL','FEMALE',4,@now,@now,0);

-- 107 (6인실, 혼합)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'107','1','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',1,'107','2','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',1,'107','3','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',1,'107','4','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',1,'107','5','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',1,'107','6','GENERAL','CONCOCTION',6,@now,@now,0);

-- 108 (4인실, 남)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'108','1','GENERAL','MALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'108','2','GENERAL','MALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'108','3','GENERAL','MALE',4,@now,@now,0),
(@facility_id,NULL,'A',1,'108','4','GENERAL','MALE',4,@now,@now,0);

-- 109 (2인실, 여)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'109','1','GENERAL','FEMALE',2,@now,@now,0),
(@facility_id,NULL,'A',1,'109','2','GENERAL','FEMALE',2,@now,@now,0);

-- 110 (4인실, ISOLATION, 혼합)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'110','1','ISOLATION','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',1,'110','2','ISOLATION','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',1,'110','3','ISOLATION','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',1,'110','4','ISOLATION','CONCOCTION',4,@now,@now,0);

-- 111 (1인실, 남)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',1,'111','1','GENERAL','MALE',1,@now,@now,0);

-- ------------------------------------------------------------
-- A동 2층: 201~212 (12 rooms)
-- capacities: 4,6,2,4,1,4,6,2,4,1,4,6
-- ICU/ISOLATION placed "randomly"
-- ------------------------------------------------------------

-- 201 (4인실, 혼합)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'201','1','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'201','2','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'201','3','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'201','4','GENERAL','CONCOCTION',4,@now,@now,0);

-- 202 (6인실, 여)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'202','1','GENERAL','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'202','2','GENERAL','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'202','3','GENERAL','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'202','4','GENERAL','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'202','5','GENERAL','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'202','6','GENERAL','FEMALE',6,@now,@now,0);

-- 203 (2인실, 남)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'203','1','GENERAL','MALE',2,@now,@now,0),
(@facility_id,NULL,'A',2,'203','2','GENERAL','MALE',2,@now,@now,0);

-- 204 (4인실, ICU, 혼합)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'204','1','ICU','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'204','2','ICU','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'204','3','ICU','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'204','4','ICU','CONCOCTION',4,@now,@now,0);

-- 205 (1인실, ISOLATION, 남)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'205','1','ISOLATION','MALE',1,@now,@now,0);

-- 206 (4인실, 여)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'206','1','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',2,'206','2','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',2,'206','3','GENERAL','FEMALE',4,@now,@now,0),
(@facility_id,NULL,'A',2,'206','4','GENERAL','FEMALE',4,@now,@now,0);

-- 207 (6인실, 혼합)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'207','1','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',2,'207','2','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',2,'207','3','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',2,'207','4','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',2,'207','5','GENERAL','CONCOCTION',6,@now,@now,0),
(@facility_id,NULL,'A',2,'207','6','GENERAL','CONCOCTION',6,@now,@now,0);

-- 208 (2인실, 남)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'208','1','GENERAL','MALE',2,@now,@now,0),
(@facility_id,NULL,'A',2,'208','2','GENERAL','MALE',2,@now,@now,0);

-- 209 (4인실, 혼합)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'209','1','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'209','2','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'209','3','GENERAL','CONCOCTION',4,@now,@now,0),
(@facility_id,NULL,'A',2,'209','4','GENERAL','CONCOCTION',4,@now,@now,0);

-- 210 (1인실, 여)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'210','1','GENERAL','FEMALE',1,@now,@now,0);

-- 211 (4인실, 남)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'211','1','GENERAL','MALE',4,@now,@now,0),
(@facility_id,NULL,'A',2,'211','2','GENERAL','MALE',4,@now,@now,0),
(@facility_id,NULL,'A',2,'211','3','GENERAL','MALE',4,@now,@now,0),
(@facility_id,NULL,'A',2,'211','4','GENERAL','MALE',4,@now,@now,0);

-- 212 (6인실, ISOLATION, 여)
INSERT INTO `LOCATION` (`facility_id`,`patient_id`,`building`,`floor`,`room`,`bed`,`room_type`,`roomgender_type`,`room_capacity`,`created_at`,`updated_at`,`is_occupied`)
VALUES
(@facility_id,NULL,'A',2,'212','1','ISOLATION','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'212','2','ISOLATION','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'212','3','ISOLATION','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'212','4','ISOLATION','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'212','5','ISOLATION','FEMALE',6,@now,@now,0),
(@facility_id,NULL,'A',2,'212','6','ISOLATION','FEMALE',6,@now,@now,0);

-- ------------------------------------------------------------
-- Patients: create 30 patients and assign 18 of them to beds.
-- ------------------------------------------------------------

-- Create patients (unassigned first)
INSERT INTO `PATIENT`
(`facility_id`,`location_id`,`name`,`gender`,`birth_date`,`address`,`admission_date`,`discharge_date`,`blood_type`,`height`,`weight`,`admission_status`,`diet_type`,`memo`,`status`,`created_at`,`updated_at`)
VALUES
(@facility_id,NULL,'김민수','MALE','1987-03-12','서울','2026-04-01',NULL,'A_POSITIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'이서연','FEMALE','1994-10-08','서울','2026-04-02',NULL,'O_POSITIVE',NULL,NULL,NULL,NULL,'seed','MONITORING',@now,@now),
(@facility_id,NULL,'박지훈','MALE','1979-01-22','서울','2026-04-02',NULL,'B_POSITIVE',NULL,NULL,NULL,NULL,'seed','DISCHARGE',@now,@now),
(@facility_id,NULL,'최지민','FEMALE','1988-07-14','서울','2026-04-03',NULL,'AB_POSITIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'정도윤','MALE','1990-11-30','서울','2026-04-03',NULL,'A_NEGATIVE',NULL,NULL,NULL,NULL,'seed','CRITICAL',@now,@now),
(@facility_id,NULL,'강하윤','FEMALE','1985-05-18','서울','2026-04-04',NULL,'B_NEGATIVE',NULL,NULL,NULL,NULL,'seed','POSTOPERATIVE',@now,@now),
(@facility_id,NULL,'조예준','MALE','1975-09-03','서울','2026-04-04',NULL,'O_NEGATIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'윤수아','FEMALE','1998-02-27','서울','2026-04-05',NULL,'AB_NEGATIVE',NULL,NULL,NULL,NULL,'seed','MONITORING',@now,@now),
(@facility_id,NULL,'장현우','MALE','1982-12-19','서울','2026-04-05',NULL,'A_POSITIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'임지아','FEMALE','1977-06-09','서울','2026-04-06',NULL,'O_POSITIVE',NULL,NULL,NULL,NULL,'seed','DISCHARGE',@now,@now),
(@facility_id,NULL,'김도현','MALE','1992-08-11','서울','2026-04-06',NULL,'B_POSITIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'이예린','FEMALE','1989-04-21','서울','2026-04-07',NULL,'AB_POSITIVE',NULL,NULL,NULL,NULL,'seed','MONITORING',@now,@now),
(@facility_id,NULL,'박준호','MALE','1996-01-05','서울','2026-04-07',NULL,'A_POSITIVE',NULL,NULL,NULL,NULL,'seed','POSTOPERATIVE',@now,@now),
(@facility_id,NULL,'최수진','FEMALE','1983-09-17','서울','2026-04-08',NULL,'O_NEGATIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'정우진','MALE','1972-02-13','서울','2026-04-08',NULL,'B_NEGATIVE',NULL,NULL,NULL,NULL,'seed','CRITICAL',@now,@now),
(@facility_id,NULL,'강나연','FEMALE','1991-11-02','서울','2026-04-09',NULL,'AB_NEGATIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'조성민','MALE','1980-03-28','서울','2026-04-09',NULL,'A_NEGATIVE',NULL,NULL,NULL,NULL,'seed','MONITORING',@now,@now),
(@facility_id,NULL,'윤지은','FEMALE','1999-07-23','서울','2026-04-10',NULL,'O_POSITIVE',NULL,NULL,NULL,NULL,'seed','DISCHARGE',@now,@now),
(@facility_id,NULL,'장승호','MALE','1986-05-06','서울','2026-04-10',NULL,'B_POSITIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'임유나','FEMALE','1978-12-01','서울','2026-04-11',NULL,'AB_POSITIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'김태훈','MALE','1993-09-09','서울','2026-04-11',NULL,'A_POSITIVE',NULL,NULL,NULL,NULL,'seed','MONITORING',@now,@now),
(@facility_id,NULL,'이채원','FEMALE','1984-01-26','서울','2026-04-12',NULL,'O_NEGATIVE',NULL,NULL,NULL,NULL,'seed','POSTOPERATIVE',@now,@now),
(@facility_id,NULL,'박민재','MALE','1976-06-15','서울','2026-04-12',NULL,'B_NEGATIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'최아름','FEMALE','1995-10-10','서울','2026-04-13',NULL,'AB_NEGATIVE',NULL,NULL,NULL,NULL,'seed','CRITICAL',@now,@now),
(@facility_id,NULL,'정지훈','MALE','1981-02-02','서울','2026-04-13',NULL,'A_NEGATIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'강서연','FEMALE','1974-08-29','서울','2026-04-14',NULL,'O_POSITIVE',NULL,NULL,NULL,NULL,'seed','MONITORING',@now,@now),
(@facility_id,NULL,'조민수','MALE','1997-04-04','서울','2026-04-14',NULL,'B_POSITIVE',NULL,NULL,NULL,NULL,'seed','DISCHARGE',@now,@now),
(@facility_id,NULL,'윤지민','FEMALE','1987-07-07','서울','2026-04-15',NULL,'AB_POSITIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'장하준','MALE','1979-11-11','서울','2026-04-15',NULL,'A_POSITIVE',NULL,NULL,NULL,NULL,'seed','STABLE',@now,@now),
(@facility_id,NULL,'임서현','FEMALE','1990-05-20','서울','2026-04-15',NULL,'O_NEGATIVE',NULL,NULL,NULL,NULL,'seed','POSTOPERATIVE',@now,@now);

-- Assignments: pick free beds and match room gender rules.
-- We'll assign patient_id 1..18 to specific beds.

-- Helper: get location_id into variables for updates
SELECT location_id INTO @L101_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='101' AND bed='1' LIMIT 1;
SELECT location_id INTO @L101_2 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='101' AND bed='2' LIMIT 1;
SELECT location_id INTO @L102_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='102' AND bed='1' LIMIT 1;
SELECT location_id INTO @L103_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='103' AND bed='1' LIMIT 1;
SELECT location_id INTO @L104_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='104' AND bed='1' LIMIT 1;
SELECT location_id INTO @L105_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='105' AND bed='1' LIMIT 1;
SELECT location_id INTO @L106_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='106' AND bed='1' LIMIT 1;
SELECT location_id INTO @L107_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='107' AND bed='1' LIMIT 1;
SELECT location_id INTO @L108_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='108' AND bed='1' LIMIT 1;
SELECT location_id INTO @L109_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='109' AND bed='1' LIMIT 1;
SELECT location_id INTO @L110_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='110' AND bed='1' LIMIT 1;
SELECT location_id INTO @L111_1 FROM `LOCATION` WHERE building='A' AND floor=1 AND room='111' AND bed='1' LIMIT 1;

SELECT location_id INTO @L201_1 FROM `LOCATION` WHERE building='A' AND floor=2 AND room='201' AND bed='1' LIMIT 1;
SELECT location_id INTO @L202_1 FROM `LOCATION` WHERE building='A' AND floor=2 AND room='202' AND bed='1' LIMIT 1;
SELECT location_id INTO @L203_1 FROM `LOCATION` WHERE building='A' AND floor=2 AND room='203' AND bed='1' LIMIT 1;
SELECT location_id INTO @L204_1 FROM `LOCATION` WHERE building='A' AND floor=2 AND room='204' AND bed='1' LIMIT 1;
SELECT location_id INTO @L205_1 FROM `LOCATION` WHERE building='A' AND floor=2 AND room='205' AND bed='1' LIMIT 1;
SELECT location_id INTO @L206_1 FROM `LOCATION` WHERE building='A' AND floor=2 AND room='206' AND bed='1' LIMIT 1;

-- Update both sides: PATIENT.location_id and LOCATION.patient_id + is_occupied
UPDATE `PATIENT` SET location_id=@L101_1 WHERE patient_id=1;
UPDATE `LOCATION` SET patient_id=1, is_occupied=1 WHERE location_id=@L101_1;

UPDATE `PATIENT` SET location_id=@L101_2 WHERE patient_id=3;
UPDATE `LOCATION` SET patient_id=3, is_occupied=1 WHERE location_id=@L101_2;

UPDATE `PATIENT` SET location_id=@L102_1 WHERE patient_id=2;
UPDATE `LOCATION` SET patient_id=2, is_occupied=1 WHERE location_id=@L102_1;

UPDATE `PATIENT` SET location_id=@L103_1 WHERE patient_id=4;
UPDATE `LOCATION` SET patient_id=4, is_occupied=1 WHERE location_id=@L103_1;

UPDATE `PATIENT` SET location_id=@L104_1 WHERE patient_id=5;
UPDATE `LOCATION` SET patient_id=5, is_occupied=1 WHERE location_id=@L104_1;

UPDATE `PATIENT` SET location_id=@L105_1 WHERE patient_id=6;
UPDATE `LOCATION` SET patient_id=6, is_occupied=1 WHERE location_id=@L105_1;

UPDATE `PATIENT` SET location_id=@L106_1 WHERE patient_id=8;
UPDATE `LOCATION` SET patient_id=8, is_occupied=1 WHERE location_id=@L106_1;

UPDATE `PATIENT` SET location_id=@L107_1 WHERE patient_id=7;
UPDATE `LOCATION` SET patient_id=7, is_occupied=1 WHERE location_id=@L107_1;

UPDATE `PATIENT` SET location_id=@L108_1 WHERE patient_id=9;
UPDATE `LOCATION` SET patient_id=9, is_occupied=1 WHERE location_id=@L108_1;

UPDATE `PATIENT` SET location_id=@L109_1 WHERE patient_id=10;
UPDATE `LOCATION` SET patient_id=10, is_occupied=1 WHERE location_id=@L109_1;

UPDATE `PATIENT` SET location_id=@L110_1 WHERE patient_id=11;
UPDATE `LOCATION` SET patient_id=11, is_occupied=1 WHERE location_id=@L110_1;

UPDATE `PATIENT` SET location_id=@L111_1 WHERE patient_id=13;
UPDATE `LOCATION` SET patient_id=13, is_occupied=1 WHERE location_id=@L111_1;

UPDATE `PATIENT` SET location_id=@L201_1 WHERE patient_id=12;
UPDATE `LOCATION` SET patient_id=12, is_occupied=1 WHERE location_id=@L201_1;

UPDATE `PATIENT` SET location_id=@L202_1 WHERE patient_id=14;
UPDATE `LOCATION` SET patient_id=14, is_occupied=1 WHERE location_id=@L202_1;

UPDATE `PATIENT` SET location_id=@L203_1 WHERE patient_id=15;
UPDATE `LOCATION` SET patient_id=15, is_occupied=1 WHERE location_id=@L203_1;

UPDATE `PATIENT` SET location_id=@L204_1 WHERE patient_id=16;
UPDATE `LOCATION` SET patient_id=16, is_occupied=1 WHERE location_id=@L204_1;

UPDATE `PATIENT` SET location_id=@L205_1 WHERE patient_id=17;
UPDATE `LOCATION` SET patient_id=17, is_occupied=1 WHERE location_id=@L205_1;

UPDATE `PATIENT` SET location_id=@L206_1 WHERE patient_id=18;
UPDATE `LOCATION` SET patient_id=18, is_occupied=1 WHERE location_id=@L206_1;

-- ------------------------------------------------------------
-- Quick sanity checks
-- ------------------------------------------------------------
SELECT 'facility' AS t, COUNT(*) AS n FROM `FACILITY`;
SELECT 'locations' AS t, COUNT(*) AS n FROM `LOCATION` WHERE building='A' AND floor IN (1,2);
SELECT 'patients' AS t, COUNT(*) AS n FROM `PATIENT`;
SELECT 'assigned_patients' AS t, COUNT(*) AS n FROM `PATIENT` WHERE location_id IS NOT NULL;
