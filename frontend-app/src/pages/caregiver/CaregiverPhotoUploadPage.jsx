import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/Text";
import {
  updateCaregiverActivityPhoto,
  uploadCaregiverActivityPhoto,
} from "../../api/activityGalleryApi";
import { formatGalleryTime, resolveGalleryImageUrl } from "../../utils/galleryPhotoUtils";
import { appendImageFile, formatUploadError } from "../../utils/uploadFormData";

export default function CaregiverPhotoUploadPage({ navigation }) {
  const [previewUri, setPreviewUri] = useState(null);
  const [previewMime, setPreviewMime] = useState("image/jpeg");
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [result, setResult] = useState(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const pickImage = async () => {
    setErrorText("");
    setStatusText("");
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setErrorText("사진 보관함 접근 권한을 허용해 주세요.");
        Alert.alert("권한 필요", "사진 보관함 접근 권한을 허용해 주세요.");
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (picked.canceled || !picked.assets?.length) return;
      const asset = picked.assets[0];
      setPreviewUri(asset.uri);
      setPreviewMime(asset.mimeType || "image/jpeg");
      setResult(null);
      setEditing(false);
      setStatusText("사진이 선택되었습니다. 아래 버튼을 눌러 등록하세요.");
    } catch (e) {
      const msg = e?.message ?? "사진 선택에 실패했습니다.";
      setErrorText(msg);
      Alert.alert("사진 선택 실패", msg);
    }
  };

  const upload = async () => {
    if (!previewUri) {
      setErrorText("먼저 사진을 선택해 주세요.");
      Alert.alert("안내", "먼저 사진을 선택해 주세요.");
      return;
    }

    setUploading(true);
    setErrorText("");
    setResult(null);
    setEditing(false);
    setStatusText("사진을 서버로 전송하는 중…");

    try {
      const formData = new FormData();
      await appendImageFile(formData, {
        uri: previewUri,
        mimeType: previewMime,
      });

      setStatusText("얼굴 인식·활동 분석 중… (최대 1~2분)");
      const res = await uploadCaregiverActivityPhoto(formData);
      setResult(res.data);
      setEditTitle(res.data?.card?.title ?? "");
      setEditContent(res.data?.card?.content ?? "");
      setStatusText("등록이 완료되었습니다. 보호자 갤러리에서 확인할 수 있어요.");

      const detectedLine = res.data?.detectedPatientNames?.length
        ? `\n인식된 환자: ${res.data.detectedPatientNames.join(", ")}`
        : "";
      const actionLine = res.data?.actionKo
        ? `\n인식 활동: ${res.data.actionKo}`
        : "\n(AI 서버가 꺼져 있으면 기본 제목/내용으로 저장됩니다.)";

      Alert.alert(
        "등록 완료",
        (res.data?.message ?? "보호자 활동 갤러리에 사진이 등록되었습니다.")
          + detectedLine
          + actionLine
      );
    } catch (e) {
      const msg = formatUploadError(e);
      setErrorText(msg);
      setStatusText("");
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.error("[upload] failed", e?.response?.status, e?.response?.data ?? e);
      }
      Alert.alert("업로드 실패", msg);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = () => {
    const card = result?.card;
    if (!card) return;
    setEditTitle(card.title ?? "");
    setEditContent(card.content ?? "");
    setEditing(true);
  };

  const saveEdit = async () => {
    const documentId = result?.documentId ?? result?.card?.documentId;
    if (!documentId) {
      Alert.alert("안내", "수정할 게시물을 찾을 수 없습니다.");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await updateCaregiverActivityPhoto(documentId, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setResult((prev) => ({ ...prev, ...res.data, card: res.data?.card ?? prev?.card }));
      setEditing(false);
      setStatusText("게시물이 수정되었습니다.");
      Alert.alert("수정 완료", res.data?.message ?? "게시물이 수정되었습니다.");
    } catch (e) {
      Alert.alert("수정 실패", formatUploadError(e));
    } finally {
      setSavingEdit(false);
    }
  };

  const finishAndGoBack = () => {
    if (editing) {
      Alert.alert("안내", "수정 중입니다. 저장하거나 취소한 뒤 완료를 눌러 주세요.");
      return;
    }
    navigation.goBack();
  };

  const card = result?.card;
  const heroImage = card?.imageUrl
    ? resolveGalleryImageUrl(card.imageUrl)
    : previewUri;

  return (
    <SafeAreaView
      className="flex-1 bg-caregiver-bg-primary"
      edges={["bottom", "left", "right"]}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text className="text-xl font-bold text-caregiver-text-primary mb-2">
          프로그램 활동 사진
        </Text>

        <Pressable
          className="rounded-2xl border border-dashed border-caregiver-text-neutral/40 p-4 mb-4 items-center"
          onPress={pickImage}
          disabled={uploading}
        >
          {heroImage ? (
            <Image source={{ uri: heroImage }} className="w-full h-48 rounded-xl mb-2" />
          ) : (
            <Text className="text-caregiver-text-neutral py-12">탭하여 사진 선택</Text>
          )}
          <Text className="text-sm font-bold text-caregiver-text-primary">사진 선택</Text>
        </Pressable>

        <Pressable
          className={`rounded-xl py-3 items-center mb-3 ${
            uploading || !previewUri ? "bg-caregiver-button-primary/60" : "bg-caregiver-button-primary"
          }`}
          onPress={upload}
          disabled={uploading || !previewUri}
        >
          {uploading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#fff" />
              <Text className="text-white font-bold">처리 중…</Text>
            </View>
          ) : (
            <Text className="text-white font-bold">AI 분석 후 갤러리 등록</Text>
          )}
        </Pressable>

        {statusText ? (
          <View className="mb-3 rounded-xl bg-caregiver-bg-secondary px-3 py-2">
            <Text className="text-sm text-caregiver-text-primary">{statusText}</Text>
          </View>
        ) : null}

        {errorText ? (
          <View className="mb-3 rounded-xl bg-red-50 px-3 py-2 border border-red-200">
            <Text className="text-sm text-red-700">{errorText}</Text>
          </View>
        ) : null}

        {card ? (
          <View className="rounded-2xl bg-white p-4 gap-2 border border-caregiver-button-secondary">
            <Text className="text-base font-bold text-caregiver-text-primary">등록 결과</Text>
            {result.detectedPatientNames?.length ? (
              <Text className="text-sm text-caregiver-text-neutral">
                인식된 환자: {result.detectedPatientNames.join(", ")}
              </Text>
            ) : null}
            {result.actionKo ? (
              <Text className="text-sm text-caregiver-text-neutral">
                인식 활동: {result.actionKo}
                {result.confidence != null
                  ? ` (${Math.round(result.confidence * 100)}%)`
                  : ""}
              </Text>
            ) : (
              <Text className="text-sm text-caregiver-text-neutral">
                AI 분석 없이 기본 정보로 저장되었습니다.
              </Text>
            )}

            {editing ? (
              <View className="gap-2 mt-2">
                <Text className="text-sm font-bold text-caregiver-text-primary">제목</Text>
                <TextInput
                  className="rounded-lg border border-caregiver-button-secondary px-3 py-2 text-caregiver-text-primary"
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="제목"
                />
                <Text className="text-sm font-bold text-caregiver-text-primary">내용</Text>
                <TextInput
                  className="rounded-lg border border-caregiver-button-secondary px-3 py-2 text-caregiver-text-primary min-h-[88px]"
                  value={editContent}
                  onChangeText={setEditContent}
                  placeholder="내용"
                  multiline
                  textAlignVertical="top"
                />
                <View className="flex-row justify-end gap-2 mt-1">
                  <Pressable
                    className="rounded-lg border border-caregiver-button-secondary px-4 py-2"
                    onPress={() => setEditing(false)}
                    disabled={savingEdit}
                  >
                    <Text className="text-sm font-bold text-caregiver-text-primary">취소</Text>
                  </Pressable>
                  <Pressable
                    className="rounded-lg bg-caregiver-button-primary px-4 py-2"
                    onPress={saveEdit}
                    disabled={savingEdit}
                  >
                    {savingEdit ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className="text-sm font-bold text-white">저장</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <Text className="text-sm font-bold text-caregiver-text-primary mt-2">
                  제목: {card.title}
                </Text>
                <Text className="text-sm text-caregiver-text-neutral">
                  시간: {formatGalleryTime(card.uploadedAt)}
                </Text>
                <Text className="text-sm text-caregiver-text-neutral leading-5">
                  내용: {card.content}
                </Text>
                {card.imageUrl ? (
                  <Image
                    source={{ uri: resolveGalleryImageUrl(card.imageUrl) }}
                    className="w-full h-40 rounded-xl mt-2"
                  />
                ) : null}
                <View className="flex-row justify-end gap-2 mt-2">
                  <Pressable
                    className="rounded-lg border border-caregiver-button-secondary px-4 py-2"
                    onPress={startEdit}
                  >
                    <Text className="text-sm font-bold text-caregiver-text-primary">수정</Text>
                  </Pressable>
                  <Pressable
                    className="rounded-lg bg-caregiver-button-primary px-4 py-2"
                    onPress={finishAndGoBack}
                  >
                    <Text className="text-sm font-bold text-white">완료</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
