import { useState } from "react";
import patientApi from "../../api/patientApi";
import RoomLayoutCard from "../bedroom/RoomLayoutCard";
import WardPage from '../../pages/WardPage'

export default function PatientCreateModal({ //create 페이지에서 모달로 변경 - simple 방식 재형꺼 합친 후 수정 예정
  open,
  onClose,
  onSuccess,
  beds = [],
}) {

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    address: "",
    bloodType: "",
    admissionDate: "",
    building: "",
    floor: "",
    room: "",
    bed: "",
    roomType: "",
    locationId: null,
    memo: "",
  });

   // 병상 배정 방식
  // none   : 병상 없이 접수
  // simple : 간편 선택 배정
  // layout : 병동 화면에서 선택
  const [assignMode, setAssignMode] = useState("none"); // none | simple | layout
 
  const [selectedBed, setSelectedBed] = useState(null);  // layout 방식에서 사용자가 클릭한 병상 정보를 저장

  if (!open) return null;  // 모달이 닫혀 있으면 렌더링하지 않음

  const resetForm = () => {  // 모달 닫을 때 입력값 전체 초기화
    setFormData({
      name: "",
      gender: "",
      birthDate: "",
      address: "",
      bloodType: "",
      admissionDate: "",
      building: "",
      floor: "",
      room: "",
      bed: "",
      roomType: "",
      locationId: null,
      memo: "",
    });
    setAssignMode("none");
    setSelectedBed(null);
  };

  const handleClose = () => {// 닫기 버튼 / 취소 버튼 눌렀을 때
    resetForm();
    onClose?.();
  };

  const handleChange = (e) => {  // input, select 공통 변경 핸들러
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "building") {// 건물이 바뀌면
      // 하위 선택값(층, 호실, 병상)을 전부 초기화
        return {
          ...prev,
          building: value,
          floor: "",
          room: "",
          bed: "",
        };
      }

      if (name === "floor") { // 위랑 똑같
        return {
          ...prev,
          floor: value,
          room: "",
          bed: "",
        };
      }

      if (name === "roomType") { // 위랑 똑같
        return {
          ...prev,
          roomType: value,
          room: "",
          bed: "",
        };
      }

      if (name === "room") { // 위랑 똑같
        return {
          ...prev,
          room: value,
          bed: "",
        };
      }

      return {// 일반 입력값 변경
        ...prev,
        [name]: value,
      };
    });
  };

 const handleAssignModeChange = (mode) => {  // 병상 배정 방식 변경
  setAssignMode(mode);

  if (mode === "none") {// 병상 없이 접수 선택 시
    // 병상 관련 정보 전부 초기화
    setSelectedBed(null);
    setFormData((prev) => ({
      ...prev,
      building: "",
      floor: "",
      room: "",
      bed: "",
      roomType: "",
      locationId: null,
    }));
    return;
  }

  if (mode === "simple") { // 똑같
    setSelectedBed(null);
    setFormData((prev) => ({
      ...prev,
      locationId: null,
    }));
    return;
  }

  if (mode === "layout") { // 똑같
    setFormData((prev) => ({
      ...prev,
      building: "",
      floor: "",
      room: "",
      bed: "",
      roomType: "",
    }));
  }
};

  const getRoomAssignedGender = (room) => {
    if (!room) return null;
    const occupiedBedsInRoom = beds.filter(
      (item) => String(item.room) === String(room) && item.occupied && item.gender,
    );
    if (occupiedBedsInRoom.length === 0) return null;
    return occupiedBedsInRoom[0].gender;
  };

  const isGenderMismatchRoom = (room, patientGender) => {
    if (!patientGender) return false;
    const roomGender = getRoomAssignedGender(room);
    return Boolean(roomGender && roomGender !== patientGender);
  };

  const handleSelectBedFromLayout = (bed) => {
    if (isGenderMismatchRoom(bed.room, formData.gender)) {
      alert("해당 병실은 현재 다른 성별 환자 병실입니다.");
      return;
    }
    setSelectedBed(bed);

    setFormData((prev) => ({
      ...prev,
      locationId: bed.locationId || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...formData };

    if (assignMode === "none") {
      payload.building = "";
      payload.room = "";
      payload.bed = "";
      payload.roomType = "";
      payload.locationId = null;
    } else if (assignMode === "simple") {
      payload.locationId = null;
    } else if (assignMode === "layout") {
      payload.building = "";
      payload.room = "";
      payload.bed = "";
      payload.roomType = "";
    }

    try {
      await patientApi.createPatient(payload);
      alert("환자 등록 완료");
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("환자 등록 실패", error);
      alert("환자 등록 실패");
    }
  };

  const filteredSimpleLocations = beds.filter((bedItem) => {
    const matchesRoomType =
      !formData.roomType || bedItem.roomType === formData.roomType;

    const matchesBuilding =
      !formData.building || bedItem.building === formData.building;

    const matchesFloor =
      !formData.floor || String(bedItem.floor) === String(formData.floor);

    return matchesRoomType && matchesBuilding && matchesFloor;
  });

  const simpleRoomOptions = Object.values(
    filteredSimpleLocations.reduce((acc, bedItem) => {
      const roomKey = String(bedItem.room);

      if (!acc[roomKey]) {
        acc[roomKey] = {
          room: roomKey,
          totalCount: 0,
          occupiedCount: 0,
        };
      }

      acc[roomKey].totalCount += 1;

      if (bedItem.occupied) {
        acc[roomKey].occupiedCount += 1;
      }

      return acc;
    }, {}),
  )
    .map((roomItem) => ({
      ...roomItem,
      roomGender: getRoomAssignedGender(roomItem.room),
    }))
    .sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));

  const simpleBedOptions = filteredSimpleLocations.filter((bedItem) => {
    if (!formData.room) return false;
    if (String(bedItem.room) !== String(formData.room)) return false;
    if (isGenderMismatchRoom(bedItem.room, formData.gender)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">환자 등록</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div>
            <label className="mb-1 block font-medium">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">성별</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">선택</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
              <option value="OTHER">기타</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">생년월일</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">혈액형</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">선택</option>
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">주소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">입원일</label>
            <input
              type="date"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">기타 정보</label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="알레르기, 특이사항 등"
            />
          </div>

          <div className="md:col-span-2 mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-3 text-base font-semibold text-slate-800">
              병상 배정 방식
            </p>

            <div className="grid grid-cols-3 gap-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="radio"
                  name="assignMode"
                  value="none"
                  checked={assignMode === "none"}
                  onChange={(e) => handleAssignModeChange(e.target.value)}
                />
                <span className="text-sm font-medium text-slate-700">
                  병상 없이 접수
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="radio"
                  name="assignMode"
                  value="simple"
                  checked={assignMode === "simple"}
                  onChange={(e) => handleAssignModeChange(e.target.value)}
                />
                <span className="text-sm font-medium text-slate-700">
                  간편 선택 배정
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="radio"
                  name="assignMode"
                  value="layout"
                  checked={assignMode === "layout"}
                  onChange={(e) => handleAssignModeChange(e.target.value)}
                />
                <span className="text-sm font-medium text-slate-700">
                  병동 화면에서 선택
                </span>
              </label>
            </div>
          </div>

          {assignMode === "simple" && (
            <div className="md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="mb-4 text-base font-semibold text-slate-800">
                간편 병상 배정
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block font-medium">병실 유형</label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">선택</option>
                    <option value="GENERAL">일반실</option>
                    <option value="ICU">중환자실</option>
                    <option value="ISOLATION">격리실</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">건물</label>
                  <select
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">선택</option>
                    <option value="A동">A동</option>
                    <option value="B동">B동</option>
                    <option value="C동">C동</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">층</label>
                  <select
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">선택</option>
                    <option value="1">1층</option>
                    <option value="2">2층</option>
                    <option value="3">3층</option>
                    <option value="4">4층</option>
                    <option value="5">5층</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">호실</label>
                  <select
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                    disabled={
                      !formData.roomType ||
                      !formData.building ||
                      !formData.floor
                    }
                  >
                    <option value="">선택</option>

                    {simpleRoomOptions.map((roomItem) => {
                      const remainCount =
                        roomItem.totalCount - roomItem.occupiedCount;
                      const isFull = remainCount === 0;
                      const isGenderMismatch = isGenderMismatchRoom(
                        roomItem.room,
                        formData.gender,
                      );

                      return (
                        <option
                          key={roomItem.room}
                          value={roomItem.room}
                          disabled={isFull || isGenderMismatch}
                        >
                          {roomItem.room}호{" "}
                          {isGenderMismatch
                            ? "(성별 불일치)"
                            : isFull
                            ? "(마감)"
                            : `(${roomItem.occupiedCount}/${roomItem.totalCount} 사용중)`}
                        </option>
                      );
                    })}
                  </select>

                  {(!formData.roomType ||
                    !formData.building ||
                    !formData.floor) && (
                    <p className="mt-1 text-sm text-slate-400">
                      병실 유형, 건물, 층을 먼저 선택하세요.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block font-medium">병상</label>
                  <select
                    name="bed"
                    value={formData.bed}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                    disabled={!formData.room}
                  >
                    <option value="">선택</option>

                    {simpleBedOptions.map((bedItem) => (
                      <option
                        key={bedItem.locationId}
                        value={bedItem.bed}
                        disabled={bedItem.occupied}
                      >
                        {bedItem.bed}번{" "}
                        {bedItem.occupied ? "(이미 배정됨)" : ""}
                      </option>
                    ))}
                  </select>

                  {!formData.room && (
                    <p className="mt-1 text-sm text-slate-400">
                      먼저 호실을 선택하세요.
                    </p>
                  )}
                </div>
              </div>

              {formData.gender && formData.room && isGenderMismatchRoom(formData.room, formData.gender) && (
                <p className="mt-3 text-sm text-red-600">
                  선택한 환자 성별과 병실 성별이 달라 해당 병실에는 배정할 수 없습니다.
                </p>
              )}
            </div>
          )}

          {assignMode === "layout" && (
            <div className="md:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="mb-4 text-base font-semibold text-slate-800">
                병동 화면에서 병상 선택
              </p>

              {selectedBed && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700">
                  선택한 병상:
                  <span className="ml-2 font-semibold text-emerald-700">
                    {selectedBed.id}
                  </span>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl bg-white p-2">
                <div className="origin-top scale-[0.88]">
                  <RoomLayoutCard
                    beds={beds}
                    onAssignClick={handleSelectBedFromLayout}
                    onBedClick={undefined}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border px-4 py-2"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
