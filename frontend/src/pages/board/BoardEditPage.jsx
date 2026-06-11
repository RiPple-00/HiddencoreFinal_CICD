import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import postApi from '../../api/postApi';
import {
  POST_STATUS,
  stringifyTargetRoles,
  stringifyAttachmentUrls,
  dateOnlyToLocalDateTimeString,
  datetimeLocalToKstApiString,
  kstApiToDatetimeLocal,
} from '../../utils/boardUtils';
import { useAuth } from '../../contexts/AutoContext.jsx';
import Header from '../../components/common/Header';
import CreateSidebar from '../../components/board/create/CreateSidebar';
import CreateForm from '../../components/board/create/CreateForm';
import NoticePanel from '../../components/board/create/panel/NoticePanel';
import ProgramPanel from '../../components/board/create/panel/ProgramPanel';

const NOTICE_TYPES = new Set(['URGENT', 'CLINICAL', 'ADMIN', 'FACILITY']);
const PROGRAM_TYPES = new Set(['APPLY', 'REVIEW']);

const resolvePostCategory = (type) => {
  if (NOTICE_TYPES.has(type)) return 'NOTICE';
  if (PROGRAM_TYPES.has(type)) return 'PROGRAM';
  return 'GENERAL';
};

const localDateTimeToDateOnly = (ldt) => {
  if (!ldt) return '';
  return String(ldt).slice(0, 10);
};

const BoardEditPage = () => {
  const navigate = useNavigate();
  const { facilityId, postId } = useParams();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPost, setOriginalPost] = useState(null);

  const [postType, setPostType] = useState('GENERAL');
  const [noticeType, setNoticeType] = useState('ADMIN');
  const [formState, setFormState] = useState({
    title: '',
    content: '',
    attachmentUrls: [],
    scheduledAt: '',
    scheduleEndAt: '',
  });
  const [panelState, setPanelState] = useState({
    isPinned: false,
    publishType: 'IMMEDIATE',
    reservationAt: '',
    targetRoles: ['OFFICE', 'CAREGIVER'],
    startAt: '',
    endAt: '',
    capacity: 30,
    authorName: null,
    updatedAt: null,
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await postApi.getPost(facilityId, postId);
        const post = res.data;
        setOriginalPost(post);

        const category = resolvePostCategory(post.type);
        setPostType(category);
        if (NOTICE_TYPES.has(post.type)) setNoticeType(post.type);

        const attachmentUrls = post.attachmentUrls
          ? post.attachmentUrls.split(',').map((u) => u.trim()).filter(Boolean)
          : [];

        const targetRoles = post.targetRoles
          ? post.targetRoles.split(',').map((r) => r.trim()).filter(Boolean)
          : ['OFFICE', 'CAREGIVER'];

        setFormState({
          title: post.title ?? '',
          content: post.content ?? '',
          attachmentUrls,
          scheduledAt: '',
          scheduleEndAt: '',
        });

        setPanelState({
          isPinned: post.isPinned ?? false,
          publishType: post.reservationAt ? 'SCHEDULED' : 'IMMEDIATE',
          reservationAt: kstApiToDatetimeLocal(post.reservationAt),
          targetRoles,
          startAt: localDateTimeToDateOnly(post.startAt),
          endAt: localDateTimeToDateOnly(post.endAt),
          capacity: post.capacity ?? 30,
          authorName: post.authorName ?? null,
          updatedAt: post.updatedAt ?? null,
        });
      } catch {
        toast.error('게시글을 불러오지 못했습니다.');
        navigate(`/facilities/${facilityId}/board`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [facilityId, postId]);

  const handleFormChange = (partial) => {
    setFormState((prev) => ({ ...prev, ...partial }));
  };

  const handlePanelChange = (partial) => {
    setPanelState((prev) => ({ ...prev, ...partial }));
  };

  const buildRequestData = () => {
    const domainType = postType === 'NOTICE' ? noticeType : originalPost?.type;

    return {
      title: formState.title.trim(),
      content: formState.content.trim(),
      attachmentUrls: stringifyAttachmentUrls(formState.attachmentUrls),
      status: panelState.publishType === 'SCHEDULED' ? POST_STATUS.RESERVE : POST_STATUS.ACTIVE,
      isPinned: panelState.isPinned,
      reservationAt:
        panelState.publishType === 'SCHEDULED'
          ? datetimeLocalToKstApiString(panelState.reservationAt)
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
    };
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
      toast.error('수정하려면 로그인해 주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      await postApi.updatePost(facilityId, postId, buildRequestData());
      toast.success('게시글이 수정되었습니다.');
      navigate(`/facilities/${facilityId}/board/${postId}`);
    } catch {
      // 에러는 Axios 인터셉터에서 toast로 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(`/facilities/${facilityId}/board/${postId}`);

  const renderPanel = () => {
    const commonProps = {
      panelState,
      onPanelChange: handlePanelChange,
      onSaveDraft: null,
      onSubmit: handleSubmit,
      onCancel: handleCancel,
      isSubmitting,
    };
    if (postType === 'NOTICE') return <NoticePanel {...commonProps} />;
    if (postType === 'PROGRAM') return <ProgramPanel {...commonProps} />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}>
        <Header activeNav="notice" />
        <div className="flex items-center justify-center py-32 text-sm text-gray-400">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: '"Noto Sans KR", "Segoe UI", system-ui, sans-serif' }}>
      <Header activeNav="notice" />
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <CreateSidebar
          postType={postType}
          onTypeChange={() => {}}
          facilityId={facilityId}
          title={formState.title}
          content={formState.content}
          canWriteOfficial={false}
          readonlyType
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
          isSubmitting={isSubmitting}
          submitLabel="수정 완료"
        />
        {renderPanel()}
      </div>
    </div>
  );
};

export default BoardEditPage;
