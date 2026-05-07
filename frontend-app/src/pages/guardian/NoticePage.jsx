import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  applyProgram,
  getProgramApplications,
  getPrograms,
} from "../../api/guardianApi";
import { styles } from "../../styles/guardianProgram.styles";

export default function NoticePage() {
  const [tab, setTab] = useState("programs");
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const programResponse = await getPrograms();
      console.log("프로그램 목록 응답:", programResponse.data);

      setPrograms(
        Array.isArray(programResponse.data) ? programResponse.data : [],
      );

      try {
        const applicationResponse = await getProgramApplications();
        console.log("신청내역 응답:", applicationResponse.data);

        setApplications(
          Array.isArray(applicationResponse.data)
            ? applicationResponse.data
            : [],
        );
      } catch (applicationError) {
        console.error("신청내역 조회 실패", applicationError);
        setApplications([]);
      }
    } catch (error) {
      console.error("프로그램 목록 조회 실패", error);
      Alert.alert(
        "조회 실패",
        error?.response?.data?.message ||
          "프로그램 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateText) => {
    if (!dateText) return "날짜 미정";

    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) return "날짜 미정";

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${month}/${day}`;
  };

  const formatDateTime = (dateText) => {
    if (!dateText) return "날짜 미정";

    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) return "날짜 미정";

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${month}/${day} ${hour}:${minute}`;
  };

  const isAlreadyApplied = (postId) => {
    return applications.some((application) => application.postId === postId);
  };

  const onPressApply = (program) => {
    setSelectedProgram(program);
    setConfirmModalVisible(true);
  };

  const closeApplyModal = () => {
    if (applyingId) return;
    setConfirmModalVisible(false);
    setSelectedProgram(null);
  };

  const confirmApply = async () => {
    if (!selectedProgram) return;

    try {
      setApplyingId(selectedProgram.id);

      await applyProgram(selectedProgram.id);

      const applicationResponse = await getProgramApplications();
      setApplications(
        Array.isArray(applicationResponse.data) ? applicationResponse.data : [],
      );

      setConfirmModalVisible(false);
      setSelectedProgram(null);
      setTab("applications");
    } catch (error) {
      console.error("프로그램 신청 실패", error);
      Alert.alert(
        "신청 실패",
        error?.response?.data?.message || "프로그램 신청에 실패했습니다.",
      );
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>프로그램 신청</Text>
        <Text style={styles.pageSubtitle}>
          보호자님이 환자 대신 프로그램을 신청할 수 있어요.
        </Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === "programs" && styles.tabButtonActive,
          ]}
          onPress={() => setTab("programs")}
        >
          <Text
            style={[styles.tabText, tab === "programs" && styles.tabTextActive]}
          >
            프로그램 목록
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === "applications" && styles.tabButtonActive,
          ]}
          onPress={() => setTab("applications")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "applications" && styles.tabTextActive,
            ]}
          >
            신청내역
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0B4EA2" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} />
          }
        >
          {tab === "programs" ? (
            programs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  등록된 프로그램이 없습니다.
                </Text>
              </View>
            ) : (
              programs.map((program) => {
                const alreadyApplied = isAlreadyApplied(program.id);
                const capacity = program.capacity ?? 0;
                const currentEnrolled = program.currentEnrolled ?? 0;
                const isFull = capacity > 0 && currentEnrolled >= capacity;
                const disabled =
                  alreadyApplied ||
                  isFull ||
                  program.recruitStatus === "마감" ||
                  applyingId === program.id;

                return (
                  <View key={program.id} style={styles.programCard}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>
                          {program.recruitStatus || "모집 정보 없음"}
                        </Text>
                      </View>

                      <Text style={styles.programDate}>
                        {formatDateTime(program.startAt)}
                      </Text>
                    </View>

                    <Text style={styles.programTitle}>{program.title}</Text>

                    {!!program.content && (
                      <Text style={styles.programContent} numberOfLines={2}>
                        {program.content}
                      </Text>
                    )}

                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>
                        신청 {currentEnrolled}명
                        {capacity ? ` / 정원 ${capacity}명` : ""}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.applyButton,
                        disabled && styles.applyButtonDisabled,
                      ]}
                      disabled={disabled}
                      onPress={() => onPressApply(program)}
                    >
                      <Text
                        style={[
                          styles.applyButtonText,
                          disabled && styles.applyButtonTextDisabled,
                        ]}
                      >
                        {applyingId === program.id
                          ? "신청 중..."
                          : alreadyApplied
                            ? "신청완료"
                            : isFull
                              ? "정원마감"
                              : "신청하기"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )
          ) : applications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>신청한 프로그램이 없습니다.</Text>
            </View>
          ) : (
            applications.map((application) => (
              <View key={application.documentId} style={styles.historyCard}>
                <Text style={styles.historyTitle}>
                  {application.programTitle}
                </Text>

                <Text style={styles.historyInfo}>
                  프로그램 날짜: {formatDateTime(application.programStartAt)}
                </Text>

                <Text style={styles.historyInfo}>
                  대상 환자: {application.patientName || "-"}
                </Text>

                <View style={styles.historyBottomRow}>
                  <Text style={styles.historyStatus}>
                    상태: {application.status}
                  </Text>

                  <Text style={styles.historyDate}>
                    신청일 {formatDate(application.requestedAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeApplyModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>📝</Text>
            </View>

            <Text style={styles.modalTitle}>프로그램 신청</Text>

            <Text style={styles.modalProgramTitle}>
              {selectedProgram?.title}
            </Text>

            <Text style={styles.modalDescription}>
              {formatDate(selectedProgram?.startAt)} 프로그램을
              신청하시겠습니까?
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={closeApplyModal}
                disabled={!!applyingId}
              >
                <Text style={styles.modalCancelText}>아니오</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmApply}
                disabled={!!applyingId}
              >
                <Text style={styles.modalConfirmText}>
                  {applyingId ? "신청 중..." : "예"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
