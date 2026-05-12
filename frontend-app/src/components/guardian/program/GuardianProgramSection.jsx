import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    applyProgram,
    cancelProgramApplication,
    getProgramApplications,
    getPrograms,
} from "../../../api/guardianApi";
import { decodeJwtPayload, getAccessToken } from "../../../api";
import { styles } from "../../../styles/guardianProgram.styles";

function userFacingAlert(title, message) {
    const body = message || "";
    if (Platform.OS === "web" && typeof window !== "undefined" && typeof window.alert === "function") {
        window.alert(body ? `${title}\n\n${body}` : title);
        return;
    }
    Alert.alert(title, body || undefined);
}

export default function GuardianProgramSection() {
    const [tab, setTab] = useState("programs");
    const [programs, setPrograms] = useState([]);
    const [programFilter, setProgramFilter] = useState("전체");
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [applyingId, setApplyingId] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [cancelingId, setCancelingId] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [jwtRole, setJwtRole] = useState(null);

    const isNonGuardianToken = jwtRole != null && jwtRole !== "GUARDIAN";

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const token = await getAccessToken();
                const payload = decodeJwtPayload(token);
                if (!cancelled) setJwtRole(payload?.role ?? null);
            } catch {
                if (!cancelled) setJwtRole(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

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
            userFacingAlert(
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

    const formatPeriod = (startText, endText) => {
        const start = formatDateTime(startText);
        const end = formatDateTime(endText);

        if (start === "날짜 미정" && end === "날짜 미정") {
            return "일정 미등록";
        }

        if (end === "날짜 미정") {
            return start;
        }

        return `${start} ~ ${end}`;
    };

    const getStatusBadgeStyle = (status) => {
        if (status === "모집 중") {
            return [styles.statusBadge, styles.statusBadgeActive];
        }

        if (status === "모집 예정") {
            return [styles.statusBadge, styles.statusBadgeUpcoming];
        }

        if (status === "마감") {
            return [styles.statusBadge, styles.statusBadgeClosed];
        }

        return [styles.statusBadge, styles.statusBadgeDefault];
    };

    const getStatusBadgeTextStyle = (status) => {
        if (status === "모집 중") {
            return [styles.statusBadgeText, styles.statusBadgeTextActive];
        }

        if (status === "모집 예정") {
            return [styles.statusBadgeText, styles.statusBadgeTextUpcoming];
        }

        if (status === "마감") {
            return [styles.statusBadgeText, styles.statusBadgeTextClosed];
        }

        return [styles.statusBadgeText, styles.statusBadgeTextDefault];
    };

    const getApplyButtonText = ({
        alreadyApplied,
        isFull,
        recruitStatus,
        applying,
        canApply,
    }) => {
        if (applying) return "신청 중...";
        if (alreadyApplied) return "신청완료";
        if (isFull) return "정원마감";
        if (!canApply) {
            if (recruitStatus === "마감") return "마감";
            return "신청불가";
        }
        return "신청하기";
    };
    const programFilters = ["전체", "모집 중", "모집 예정", "마감"];

    const filteredPrograms =
        programFilter === "전체"
            ? programs
            : programs.filter((program) => program.recruitStatus === programFilter);


    const isAlreadyApplied = (postId) =>
        applications.some((a) => {
            const ap = a.postId != null ? Number(a.postId) : NaN;
            const pp = postId != null ? Number(postId) : NaN;
            return (
                !Number.isNaN(ap) &&
                !Number.isNaN(pp) &&
                ap === pp &&
                (a.status === "PENDING_APPROVAL" || a.status === "APPROVED")
            );
        });

    const onPressApply = (program) => {
        if (isNonGuardianToken) {
            userFacingAlert(
                "안내",
                "프로그램 신청은 보호자 로그인에서만 할 수 있습니다. 로그인 화면으로 돌아가 보호자 탭으로 로그인해 주세요.",
            );
            return;
        }
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

        if (isNonGuardianToken) {
            userFacingAlert(
                "안내",
                "프로그램 신청은 보호자 로그인에서만 할 수 있습니다. 로그인 화면으로 돌아가 보호자 탭으로 로그인해 주세요.",
            );
            return;
        }

        try {
            const rawId = selectedProgram.id ?? selectedProgram.postId;
            const postId = Number(rawId);
            if (rawId == null || !Number.isFinite(postId)) {
                userFacingAlert("신청 실패", "게시글 정보가 올바르지 않습니다.");
                return;
            }
            setApplyingId(postId);

            const applyRes = await applyProgram(postId);
            const created = applyRes?.data;

            try {
                const applicationResponse = await getProgramApplications();
                setApplications(
                    Array.isArray(applicationResponse.data) ? applicationResponse.data : [],
                );
            } catch (refreshErr) {
                console.error("신청내역 갱신 실패", refreshErr);
                if (created?.documentId != null) {
                    setApplications((prev) => {
                        const rest = prev.filter((x) => x.documentId !== created.documentId);
                        return [created, ...rest];
                    });
                }
            }

            setConfirmModalVisible(false);
            setSelectedProgram(null);
            setTab("applications");
        } catch (error) {
            console.error("프로그램 신청 실패", error);
            userFacingAlert(
                "신청 실패",
                error?.response?.data?.message || "프로그램 신청에 실패했습니다.",
            );
        } finally {
            setApplyingId(null);
        }
    };

    const onPressCancelApplication = (application) => {
        setSelectedApplication(application);
        setCancelModalVisible(true);
    };

    const closeCancelModal = () => {
        if (cancelingId) return;
        setCancelModalVisible(false);
        setSelectedApplication(null);
    };

    const confirmCancelApplication = async () => {
        if (!selectedApplication) return;

        await cancelApplication(selectedApplication.documentId);

        setCancelModalVisible(false);
        setSelectedApplication(null);
    };

    const cancelApplication = async (documentId) => {
        try {
            setCancelingId(documentId);

            await cancelProgramApplication(documentId);

            setApplications((prev) =>
                prev.filter((application) => application.documentId !== documentId)
            );

            const programResponse = await getPrograms();
            setPrograms(Array.isArray(programResponse.data) ? programResponse.data : []);
        } catch (error) {
            console.error("프로그램 신청 취소 실패", error);
            userFacingAlert(
                "취소 실패",
                error?.response?.data?.message || "프로그램 신청 취소에 실패했습니다."
            );
        } finally {
            setCancelingId(null);
        }
    };


    return (
        <>
            <View style={styles.programSectionHeader}>
                <Text style={styles.programSectionTitle}>프로그램 신청</Text>
                <Text style={styles.programSectionSubtitle}>
                    보호자님이 환자 대신 프로그램을 신청할 수 있어요.
                </Text>
            </View>

            {isNonGuardianToken ? (
                <View style={styles.tokenWarningBox}>
                    <Text style={styles.tokenWarningText}>
                        직원(요양사 등) 계정으로 로그인된 상태입니다. 프로그램 신청은 로그인 화면에서「보호자」탭을
                        선택한 뒤 보호자 아이디로 로그인해 주세요.
                    </Text>
                </View>
            ) : null}

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
                        <>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.filterScroll}
                                contentContainerStyle={styles.filterRow}
                            >
                                {programFilters.map((filter) => (
                                    <TouchableOpacity
                                        key={filter}
                                        style={[
                                            styles.filterButton,
                                            programFilter === filter && styles.filterButtonActive,
                                        ]}
                                        onPress={() => setProgramFilter(filter)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterButtonText,
                                                programFilter === filter && styles.filterButtonTextActive,
                                            ]}
                                        >
                                            {filter}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {filteredPrograms.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <Text style={styles.emptyText}>
                                        {programFilter === "전체"
                                            ? "등록된 프로그램이 없습니다."
                                            : `${programFilter} 프로그램이 없습니다.`}
                                    </Text>
                                </View>
                            ) : (
                                filteredPrograms.map((program) => {
                                    const pid = program.id ?? program.postId;
                                    const pidNum = Number(pid);
                                    const alreadyApplied = isAlreadyApplied(pid);
                                    const capacity = program.capacity ?? 0;
                                    const currentEnrolled = program.currentEnrolled ?? 0;
                                    const isFull = capacity > 0 && currentEnrolled >= capacity;
                                    const canApply =
                                        program.recruitStatus === "모집 중" ||
                                        program.recruitStatus === "모집 예정";

                                    const disabled =
                                        isNonGuardianToken ||
                                        !canApply ||
                                        alreadyApplied ||
                                        isFull ||
                                        applyingId === pidNum;

                                    return (
                                        <View key={pid} style={styles.programCard}>
                                            <View style={styles.cardTopRow}>
                                                <View style={getStatusBadgeStyle(program.recruitStatus)}>
                                                    <Text
                                                        style={getStatusBadgeTextStyle(program.recruitStatus)}
                                                    >
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

                                            <View style={styles.detailBox}>
                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>프로그램 일시</Text>
                                                    <Text style={styles.detailValue}>
                                                        {formatPeriod(program.startAt, program.endAt)}
                                                    </Text>
                                                </View>

                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>신청 조건</Text>
                                                    <Text style={styles.detailValue}>
                                                        모집 예정·모집 중인 프로그램만 신청 가능
                                                    </Text>
                                                </View>
                                            </View>

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
                                                    {getApplyButtonText({
                                                        alreadyApplied,
                                                        isFull,
                                                        recruitStatus: program.recruitStatus,
                                                        applying: applyingId === pidNum,
                                                        canApply,
                                                    })}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })
                            )}
                        </>
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
                                        상태: {application.statusLabel || application.status || "-"}
                                    </Text>

                                    <Text style={styles.historyDate}>
                                        신청일 {formatDate(application.requestedAt)}
                                    </Text>
                                </View>

                                {application.status === "PENDING_APPROVAL" && (
                                    <TouchableOpacity
                                        style={[
                                            styles.cancelButton,
                                            cancelingId === application.documentId && styles.cancelButtonDisabled,
                                        ]}
                                        disabled={cancelingId === application.documentId}
                                        onPress={() => onPressCancelApplication(application)}
                                    >
                                        <Text
                                            style={[
                                                styles.cancelButtonText,
                                                cancelingId === application.documentId && styles.cancelButtonTextDisabled,
                                            ]}
                                        >
                                            {cancelingId === application.documentId ? "취소 중..." : "신청 취소"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
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
                            {formatPeriod(selectedProgram?.startAt, selectedProgram?.endAt)}{" "}
                            프로그램을 신청하시겠습니까?
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
            <Modal
                visible={cancelModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeCancelModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <View style={styles.modalIconCircle}>
                            <Text style={styles.modalIcon}>⚠️</Text>
                        </View>

                        <Text style={styles.modalTitle}>신청 취소</Text>

                        <Text style={styles.modalProgramTitle}>
                            {selectedApplication?.programTitle}
                        </Text>

                        <Text style={styles.modalDescription}>
                            해당 프로그램 신청을 취소하시겠습니까?
                        </Text>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={closeCancelModal}
                                disabled={!!cancelingId}
                            >
                                <Text style={styles.modalCancelText}>아니오</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalDangerButton]}
                                onPress={confirmCancelApplication}
                                disabled={!!cancelingId}
                            >
                                <Text style={styles.modalConfirmText}>
                                    {cancelingId ? "취소 중..." : "예"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </>
    );
}