import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import Text from "@/components/Text";
import { useI18n } from "@/hooks/useI18n";
import { decodeJwtPayload, getAccessToken } from "@/api";
import { getGuardianProgramList } from "@/api/guardian/programListApi";
import {
  applyGuardianProgram,
  cancelGuardianProgramApplication,
  getGuardianProgramApplications,
} from "@/api/guardian/programApplicationApi";
import GuardianProgramApplyModal from "@/components/guardian/program/GuardianProgramApplyModal";
import GuardianProgramApplicationsTab from "@/components/guardian/program/GuardianProgramApplicationsTab";
import GuardianProgramCancelModal from "@/components/guardian/program/GuardianProgramCancelModal";
import GuardianProgramHeader from "@/components/guardian/program/GuardianProgramHeader";
import GuardianProgramListTab from "@/components/guardian/program/GuardianProgramListTab";
import GuardianProgramTabBar from "@/components/guardian/program/GuardianProgramTabBar";
import GuardianProgramTokenWarning from "@/components/guardian/program/GuardianProgramTokenWarning";
import { styles } from "@/styles/guardianProgram.styles";
import { G } from "@/styles/guardianTheme";
import { userFacingAlert } from "@/utils/guardianProgramUtils";

export default function GuardianProgramApplicationPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState("programs");
  const [programs, setPrograms] = useState([]);
  const [programFilter, setProgramFilter] = useState("전체");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchProgramList = useCallback(async () => {
    const programResponse = await getGuardianProgramList();
    console.log("프로그램 목록 응답:", programResponse.data);
    setPrograms(
      Array.isArray(programResponse.data) ? programResponse.data : [],
    );
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const applicationResponse = await getGuardianProgramApplications();
      console.log("신청내역 응답:", applicationResponse.data);
      setApplications(
        Array.isArray(applicationResponse.data) ? applicationResponse.data : [],
      );
    } catch (applicationError) {
      console.error("신청내역 조회 실패", applicationError);
      setApplications([]);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      try {
        await fetchProgramList();
      } catch (error) {
        console.error("프로그램 목록 조회 실패", error);
        userFacingAlert(
          t("program.error_fetch"),
          error?.response?.data?.message || t("program.error_fetch_msg"),
        );
      }
      await fetchApplications();
    } finally {
      setLoading(false);
    }
  }, [fetchProgramList, fetchApplications]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      try {
        await fetchProgramList();
      } catch (error) {
        console.error("프로그램 목록 조회 실패", error);
        userFacingAlert(
          t("program.error_fetch"),
          error?.response?.data?.message || t("program.error_fetch_msg"),
        );
      }
      await fetchApplications();
    } finally {
      setRefreshing(false);
    }
  }, [fetchProgramList, fetchApplications]);

  const onPressApply = (program) => {
    if (isNonGuardianToken) {
      userFacingAlert(t("program.info"), t("program.info_guardian_only"));
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
      userFacingAlert(t("program.info"), t("program.info_guardian_only"));
      return;
    }

    try {
      const rawId = selectedProgram.id ?? selectedProgram.postId;
      const postId = Number(rawId);
      if (rawId == null || !Number.isFinite(postId)) {
        userFacingAlert(t("program.error_apply"), t("program.error_apply_invalid"));
        return;
      }
      setApplyingId(postId);

      const applyRes = await applyGuardianProgram(postId);
      const created = applyRes?.data;

      try {
        const applicationResponse = await getGuardianProgramApplications();
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
        t("program.error_apply"),
        error?.response?.data?.message || t("program.error_apply_msg"),
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

    await cancelApplicationFlow(selectedApplication.documentId);

    setCancelModalVisible(false);
    setSelectedApplication(null);
  };

  const cancelApplicationFlow = async (documentId) => {
    try {
      setCancelingId(documentId);

      await cancelGuardianProgramApplication(documentId);

      setApplications((prev) =>
        prev.filter((application) => application.documentId !== documentId),
      );

      const programResponse = await getGuardianProgramList();
      setPrograms(Array.isArray(programResponse.data) ? programResponse.data : []);
    } catch (error) {
      console.error("프로그램 신청 취소 실패", error);
      userFacingAlert(
        t("program.error_cancel"),
        error?.response?.data?.message || t("program.error_cancel_msg"),
      );
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <>
      <GuardianProgramHeader />

      {isNonGuardianToken ? <GuardianProgramTokenWarning /> : null}

      <GuardianProgramTabBar tab={tab} onChangeTab={setTab} />

      {loading ? (
        <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={G.textSecondary} />
          <Text style={styles.loadingText}>{t("program.loading")}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {tab === "programs" ? (
            <GuardianProgramListTab
              programs={programs}
              programFilter={programFilter}
              onProgramFilterChange={setProgramFilter}
              isNonGuardianToken={isNonGuardianToken}
              applyingId={applyingId}
              applications={applications}
              onPressApply={onPressApply}
            />
          ) : (
            <GuardianProgramApplicationsTab
              applications={applications}
              cancelingId={cancelingId}
              onPressCancelApplication={onPressCancelApplication}
            />
          )}
        </ScrollView>
      )}

      <GuardianProgramApplyModal
        visible={confirmModalVisible}
        selectedProgram={selectedProgram}
        applyingId={applyingId}
        onConfirm={confirmApply}
        onCancel={closeApplyModal}
      />

      <GuardianProgramCancelModal
        visible={cancelModalVisible}
        selectedApplication={selectedApplication}
        cancelingId={cancelingId}
        onConfirm={confirmCancelApplication}
        onCancel={closeCancelModal}
      />
    </>
  );
}
