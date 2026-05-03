import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import postApi from '../../api/postApi';
import {
  POST_STATUS,
  stringifyTargetRoles,
  stringifyAttachmentUrls,
  BOARD_UI_TO_POST_TYPE,
  dateOnlyToLocalDateTimeString,
} from '../../utils/boardUtils';
import { useAuth } from '../../contexts/AutoContext.jsx';
import CreateSidebar from '../../components/board/create/CreateSidebar';
import CreateForm from '../../components/board/create/CreateForm';
import NoticePanel from '../../components/board/create/panel/NoticePanel';
import ProgramPanel from '../../components/board/create/panel/ProgramPanel';

const INITIAL_PANEL = {
  NOTICE: {
    isPinned: false,
    publishType: 'IMMEDIATE',
    reservationAt: '',
    targetRoles: ['DOCTOR'],
    authorName: null,
    updatedAt: null,
  },
  PROGRAM: {
    isPinned: false,
    publishType: 'IMMEDIATE',
    reservationAt: '',
    startAt: '',
    endAt: '',
    capacity: 30,
    authorName: null,
    updatedAt: null,
  },
  GENERAL: {
    isPinned: false,
    publishType: 'IMMEDIATE',
    reservationAt: '',
    authorName: null,
    updatedAt: null,
  },
};

const resolveStatus = (publishType, isDraft) => {
  if (isDraft) return POST_STATUS.INACTIVE;
  if (publishType === 'SCHEDULED') return POST_STATUS.RESERVE;
  return POST_STATUS.ACTIVE;
};

const emptyToNull = (v) => (v === '' || v == null ? null : v);

/**
 * 게시글 작성 페이지
 * URL: /facilities/:facilityId/board/create
 */
const BoardCreatePage = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams();
  const { user } = useAuth();
  const [noticeType, setNoticeType] = useState('ADMIN');
  const [formState, setFormState] = useState({
    title: '',
    content: '',
    attachmentUrls: [],
    scheduledAt: '',    // 프로그램/시설 실제 시작
    scheduleEndAt: '',  // 프로그램/시설 실제 종료
  });

  /* 권한 설정 */
  const token = user?.accessToken ?? user?.token;
  const jwtPayload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const userRole = jwtPayload.role ?? null;
  const canWriteOfficial = userRole === 'ADMIN' || userRole === 'OFFICE';
  const [postType, setPostType] = useState(canWriteOfficial ? 'NOTICE' : 'GENERAL');

  const buildInitialPanel = (type) => ({
    ...INITIAL_PANEL[type],
    authorName: user?.username ?? null,
  });

  const [panelState, setPanelState] = useState(() => buildInitialPanel(canWriteOfficial ? 'NOTICE' : 'GENERAL'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (type) => {
    setPostType(type);
    setPanelState(buildInitialPanel(type));
  };

  const handleFormChange = (partial) => {
    setFormState((prev) => ({ ...prev, ...partial }));
  };

  const handlePanelChange = (partial) => {
    setPanelState((prev) => ({ ...prev, ...partial }));
  };

  const buildRequestData = (isDraft) => {
    const domainType = postType === 'NOTICE'
      ? noticeType  // URGENT, CLINICAL, ADMIN, FACILITY 중 선택값
      : BOARD_UI_TO_POST_TYPE[postType];
    if (!domainType) {
      throw new Error('지원하지 않는 게시판 유형입니다.');
    }

    const rawTitle = formState.title.trim();
    const rawContent = formState.content.trim();
    const title =
      isDraft && !rawTitle ? '(제목 없음)' : rawTitle;
    const content =
      isDraft && !rawContent ? '(내용 없음)' : rawContent;

    return {
      type: domainType,
      title,
      content,
      attachmentUrls: stringifyAttachmentUrls(formState.attachmentUrls),
      status: resolveStatus(panelState.publishType, isDraft),
      isPinned: panelState.isPinned,
      reservationAt:
        panelState.publishType === 'SCHEDULED'
          ? emptyToNull(panelState.reservationAt)
          : null,
      ...(postType === 'NOTICE' && {
        targetRoles: stringifyTargetRoles(panelState.targetRoles),
      }),
      ...(postType === 'PROGRAM' && {
        startAt: dateOnlyToLocalDateTimeString(panelState.startAt, false),
        endAt: dateOnlyToLocalDateTimeString(panelState.endAt, true),
        capacity: (() => {
          const n = Number(panelState.capacity);
          return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 30;
        })(),
      }),
      scheduledAt: formState.scheduledAt || null,
      scheduleEndAt: formState.scheduleEndAt || null,
    };
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('임시 저장하려면 로그인해 주세요.');
      return;
    }
    try {
      await postApi.createPost(facilityId, buildRequestData(true));
      toast.success('임시 저장되었습니다.');
      navigate(`/facilities/${facilityId}/board`);
    } catch {
      // 에러는 Axios 인터셉터에서 toast로 처리
    }
  };

  const handleSubmit = async () => {
    if (!formState.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formState.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    if (!user) {
      toast.error('임시 저장하려면 로그인해 주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      await postApi.createPost(facilityId, buildRequestData(false));
      toast.success('게시글이 등록되었습니다.');
      navigate(`/facilities/${facilityId}/board`);
    } catch {
      // 에러는 Axios 인터셉터에서 toast로 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(`/facilities/${facilityId}/board`);

  const renderPanel = () => {
    const commonProps = {
      panelState,
      onPanelChange: handlePanelChange,
      onSaveDraft: handleSaveDraft,
      onSubmit: handleSubmit,
      onCancel: handleCancel,
      isSubmitting,
    };
    if (postType === 'NOTICE') return <NoticePanel {...commonProps} />;
    if (postType === 'PROGRAM') return <ProgramPanel {...commonProps} />;
    if (postType === 'GENERAL') return null; // 패널 없음
    return null;
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto px-4 py-6">
      <CreateSidebar
        postType={postType}
        onTypeChange={handleTypeChange}
        facilityId={facilityId}
        title={formState.title}
        content={formState.content}
        canWriteOfficial={canWriteOfficial}
      />
      <CreateForm
        postType={postType}
        title={formState.title}
        content={formState.content}
        attachmentUrls={formState.attachmentUrls}
        facilityId={facilityId}
        onChange={handleFormChange}
        noticeType={noticeType}
        onNoticeTypeChange={setNoticeType}
        scheduledAt={formState.scheduledAt}
        scheduleEndAt={formState.scheduleEndAt}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
      {renderPanel()}
    </div>
  );
};

export default BoardCreatePage;
