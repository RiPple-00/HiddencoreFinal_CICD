import { useEffect, useState } from 'react';
import Header from "../components/common/Header";
import GuardianPanel from "../components/bedroom/GuardianPanel";
import AdminMenuPanel from "../components/bedroom/AdminMenuPanel";
// import VisitorsPanel from "../components/bedroom/VisitorsPanel";
import MealCarePage from "./MealCarePage";
import { useAuth } from '../contexts/AutoContext.jsx';
import { useI18n } from '../hooks/useI18n.jsx';
import PostList from '../components/board/PostList';
import postApi from '../api/postApi';
import { resolveStaffFacilityId } from '../utils/jwtUtils';
import WardLayoutCard from '../components/bedroom/WardLayoutCard';

function HomePage() {
  const { user } = useAuth();
  const facilityId = resolveStaffFacilityId(user);

  const { t } = useI18n();
  const [noticePosts, setNoticePosts] = useState([]);
  const [schedulePosts, setSchedulePosts] = useState([]);

  useEffect(() => {
    if (!facilityId) return;
    // 공지사항
    postApi.getPostList(facilityId, null, 0, 5)
      .then(res => setNoticePosts(res.data ?? []));
    // 프로그램 및 시설 일정 (APPLY + REVIEW + FACILITY)
    postApi.getPostList(facilityId, 'APPLY', 0, 5)
      .then(res => setSchedulePosts(res.data ?? []));
  }, [facilityId]);

  return (
    <>
      <Header activeNav="rooms" />
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex w-full max-w-[1680px] items-start gap-8 px-8 py-6">
          <main className="min-w-0 flex-1 space-y-6">
            <WardLayoutCard />

            {/* 공지사항 + 프로그램 및 시설 일정 (가로 배치) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{t('widget.programSchedule')}</h3>
                  <a href={`/facilities/${facilityId}/board?board=PROGRAM`} className="text-xs text-teal-600 hover:underline">
                    {t('widget.viewAll')}
                  </a>
                </div>
                <PostList posts={schedulePosts.slice(0, 5)} mode="widget" facilityId={facilityId} />
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{t('widget.notice')}</h3>
                  <a href={`/facilities/${facilityId}/board?board=NOTICE`} className="text-xs text-teal-600 hover:underline">
                    {t('widget.viewAll')}
                  </a>
                </div>
                <PostList posts={noticePosts.slice(0, 5)} mode="widget" facilityId={facilityId} />
              </div>
            </div>
          </main>

          <aside className="w-[360px] shrink-0 space-y-6 self-start lg:sticky lg:top-6">
            <GuardianPanel />
            <AdminMenuPanel />
            {/* <VisitorsPanel /> */}
            <MealCarePage />
          </aside>
        </div>
      </div>

    </>
  );
}

export default HomePage;