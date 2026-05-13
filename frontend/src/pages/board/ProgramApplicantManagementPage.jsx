import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import TopNavBar from '../../components/bedroom/TopNavBar';
import ApplicantStatsCards from '../../components/board/applicants/ApplicantStatsCards';
import ApplicantSection from '../../components/board/applicants/ApplicantSection';
import ApplicantTable from '../../components/board/applicants/ApplicantTable';
import postApplicationApi from '../../api/postApplicationApi';
import { programApplicantMock } from '../../mocks/programApplicantMock';

const ProgramApplicantManagementPage = () => {
  const navigate = useNavigate();
  const { facilityId, postId } = useParams();
  const [managementData, setManagementData] = useState(programApplicantMock);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadManagementData = async () => {
    setIsLoading(true);
    try {
      const response = await postApplicationApi.getApplications(facilityId, postId);
      const data = response.data ?? programApplicantMock;
      setManagementData({
        ...programApplicantMock,
        ...data,
        rejectedApplicants: data.rejectedApplicants ?? [],
      });
    } catch {
      setManagementData(programApplicantMock);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManagementData();
  }, [facilityId, postId]);

  const programInfo = managementData?.programInfo ?? programApplicantMock.programInfo;
  const confirmedApplicants = managementData?.confirmedApplicants ?? [];
  const waitingApplicants = managementData?.waitingApplicants ?? [];
  const rejectedApplicants = managementData?.rejectedApplicants ?? [];

  const pageDescription = useMemo(() => {
    if (programInfo?.description) return programInfo.description;
    return '프로그램의 신청 현황과 대기자 명단을 관리합니다.';
  }, [programInfo]);

  const updateStatus = async (applicationId, nextStatus) => {
    setIsUpdating(true);
    try {
      await postApplicationApi.updateApplicationStatus(facilityId, postId, applicationId, nextStatus);
      await loadManagementData();
      toast.success('상태가 반영되었습니다.');
    } catch (e) {
      const msg = e?.response?.data?.message ?? '신청 상태를 변경하지 못했습니다.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = (applicationId) => updateStatus(applicationId, 'COMPLETED');
  const handleCancel = (applicationId) => updateStatus(applicationId, 'CANCELLED');
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(`/facilities/${facilityId}/board`);
  };
  const handleReject = (applicationId) => updateStatus(applicationId, 'REJECTED');
  const handleMoveToWaiting = (applicationId) => updateStatus(applicationId, 'WAITING');

  return (
    <>
      <TopNavBar activeNav="notice" />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
          <div className="mb-6">
            <p className="text-sm text-slate-400">게시판 &gt; 프로그램 신청 관리</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {programInfo?.title ?? '프로그램 신청자 관리'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{pageDescription}</p>
          </div>

          <div className="space-y-6">
            <ApplicantStatsCards programInfo={programInfo} />

            <ApplicantSection
              title="정원 내 확정 명단"
              count={confirmedApplicants.length}
            >
              {isLoading ? (
                <div className="py-10 text-center text-sm text-slate-400">불러오는 중...</div>
              ) : (
                <ApplicantTable
                  mode="confirmed"
                  applicants={confirmedApplicants}
                  onMoveToWaiting={handleMoveToWaiting}
                  isUpdating={isUpdating}
                  emptyMessage="확정된 신청자가 없습니다."
                />
              )}
            </ApplicantSection>

            <ApplicantSection
              title="대기자 명단 (승인 대기)"
              count={waitingApplicants.length}
            >
              {isLoading ? (
                <div className="py-10 text-center text-sm text-slate-400">불러오는 중...</div>
              ) : (
                <ApplicantTable
                  mode="waiting"
                  applicants={waitingApplicants}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isUpdating={isUpdating}
                  emptyMessage="대기 중인 신청자가 없습니다."
                />
              )}
            </ApplicantSection>

            <ApplicantSection title="반려 명단" count={rejectedApplicants.length}>
              {isLoading ? (
                <div className="py-10 text-center text-sm text-slate-400">불러오는 중...</div>
              ) : (
                <ApplicantTable
                  mode="rejected"
                  applicants={rejectedApplicants}
                  emptyMessage="반려 처리된 신청이 없습니다."
                />
              )}
            </ApplicantSection>
          </div>

          <div className="mt-8 flex justify-start">
            <button
              type="button"
              onClick={handleGoBack}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              뒤로 가기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgramApplicantManagementPage;
