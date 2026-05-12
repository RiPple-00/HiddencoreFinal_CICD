import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import TopNavBar from '../../components/bedroom/TopNavBar';
import ApplicantStatsCards from '../../components/board/applicants/ApplicantStatsCards';
import ApplicantSection from '../../components/board/applicants/ApplicantSection';
import ApplicantTable from '../../components/board/applicants/ApplicantTable';
import postApplicationApi from '../../api/postApplicationApi';
import { programApplicantMock } from '../../mocks/programApplicantMock';

const ProgramApplicantManagementPage = () => {
  const { facilityId, postId } = useParams();
  const [managementData, setManagementData] = useState(programApplicantMock);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadManagementData = async () => {
    setIsLoading(true);
    try {
      const response = await postApplicationApi.getApplications(facilityId, postId);
      setManagementData(response.data ?? programApplicantMock);
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

  const pageDescription = useMemo(() => {
    if (programInfo?.description) return programInfo.description;
    return '프로그램의 신청 현황과 대기자 명단을 관리합니다.';
  }, [programInfo]);

  const updateStatus = async (applicationId, nextStatus) => {
    setIsUpdating(true);
    try {
      await postApplicationApi.updateApplicationStatus(facilityId, postId, applicationId, nextStatus);
      await loadManagementData();
    } catch {
      toast.error('신청 상태를 변경하지 못했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = (applicationId) => updateStatus(applicationId, 'COMPLETED');
  const handleCancel = (applicationId) => updateStatus(applicationId, 'CANCELLED');

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
                  applicants={confirmedApplicants}
                  onApprove={handleApprove}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  emptyMessage="확정된 신청자가 없습니다."
                />
              )}
            </ApplicantSection>

            <ApplicantSection
              title="대기자 명단"
              count={waitingApplicants.length}
            >
              {isLoading ? (
                <div className="py-10 text-center text-sm text-slate-400">불러오는 중...</div>
              ) : (
                <ApplicantTable
                  applicants={waitingApplicants}
                  onApprove={handleApprove}
                  onCancel={handleCancel}
                  showActions
                  isUpdating={isUpdating}
                  emptyMessage="대기 중인 신청자가 없습니다."
                />
              )}
            </ApplicantSection>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgramApplicantManagementPage;