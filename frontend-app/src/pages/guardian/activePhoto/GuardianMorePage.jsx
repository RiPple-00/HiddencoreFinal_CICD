import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from "@/components/Text";
import ActivePhotoMobileShell from '../../../components/guardian/activePhoto/ActivePhotoMobileShell';
import ActivePhotoTopBar from '../../../components/guardian/activePhoto/ActivePhotoTopBar';
import ActivePhotoInfoText from '../../../components/guardian/activePhoto/ActivePhotoInfoText';
import ActivePhotoGrid from '../../../components/guardian/activePhoto/ActivePhotoGrid';

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];

const weeklyProgramTemplate = [
  { title: '미술 치료 프로그램', time: '오전 10:30' },
  { title: '인지 활동 프로그램', time: '오후 2:00' },
  { title: '음악 치료 프로그램', time: '오전 11:10' },
  { title: '회상 활동 프로그램', time: '오후 1:40' },
  { title: '영양 식사 프로그램', time: '오전 11:50' },
  { title: '실내 체조 프로그램', time: '오후 3:10' },
  { title: '산책 프로그램', time: '오전 9:40' },
];

const imagePool = [
  'https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
];

const descText = '색을 활용한 미술 활동으로 정서적 안정에 도움을 드렸어요.';

const dateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function buildPhotos() {
  const now = new Date();
  const photos = [];

  weeklyProgramTemplate.forEach((item, index) => {
    const d = new Date(now);
    d.setDate(now.getDate() - index);

    photos.push({
      id: photos.length + 1,
      title: item.title,
      time: item.time,
      desc: descText,
      image: imagePool[index % imagePool.length],
      takenAt: d,
    });

    // 화요일(2), 수요일(3)은 카드 2개가 보이도록 하나를 더 생성
    if (d.getDay() === 2 || d.getDay() === 3) {
      photos.push({
        id: photos.length + 1,
        title: `${item.title} (추가)`,
        time: '오후 4:00',
        desc: descText,
        image: imagePool[(index + 2) % imagePool.length],
        takenAt: d,
      });
    }
  });

  return photos;
}

function dayLabel(date) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.floor((startOfToday - target) / (1000 * 60 * 60 * 24));

  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  return weekdayLabels[target.getDay()];
}

function GuardianMorePage({ route, navigation }) {
  const range = route?.params?.range ?? 'today';
  const isWeek = range === 'week';

  const photos = useMemo(() => buildPhotos(), []);

  const groupedPhotos = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const startOfSevenDaysAgo = new Date(
      sevenDaysAgo.getFullYear(),
      sevenDaysAgo.getMonth(),
      sevenDaysAgo.getDate()
    );

    const filtered = photos.filter((photo) => {
      const d = photo.takenAt;
      if (!isWeek) return dayLabel(d) === '오늘';
      return d >= startOfSevenDaysAgo;
    });

    if (isWeek) {
      // 일주일 화면은 오늘 포함 7일 그룹을 항상 고정 생성
      const baseGroups = Array.from({ length: 7 }, (_, offset) => {
        const d = new Date(today);
        d.setDate(today.getDate() - offset);
        return {
          key: dateKey(d),
          label: dayLabel(d),
          photos: [],
          orderDate: d,
        };
      });

      filtered.forEach((photo) => {
        const key = dateKey(photo.takenAt);
        const targetGroup = baseGroups.find((group) => group.key === key);
        if (targetGroup) targetGroup.photos.push(photo);
      });

      return baseGroups;
    }

    return filtered.length
      ? [{ key: dateKey(today), label: '오늘', photos: filtered, orderDate: today }]
      : [];
  }, [photos, isWeek]);

  return (
    <SafeAreaView
      className="flex-1 bg-guardian-bg-primary"
      edges={["bottom", "left", "right"]}
    >
      <View className="flex-1">
        <ActivePhotoMobileShell scrollable={false}>
          <ActivePhotoTopBar
            title={isWeek ? '더보기(일주일)' : '더보기(오늘)'}
            onBack={() => navigation.goBack()}
          />
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <ActivePhotoInfoText />

            <View className="gap-5">
              {groupedPhotos.map((group) => (
                <View key={group.key}>
                  <View className="mb-3 flex-row justify-between items-center">
                    <Text className="text-[32px] font-extrabold text-guardian-text-primary" style={{ letterSpacing: -0.3 }}>
                      {group.label}
                    </Text>
                    {group.label === '오늘' && (
                      <Text className="text-sm font-bold text-guardian-text-neutral">
                        {group.photos.length}건
                      </Text>
                    )}
                  </View>
                  <ActivePhotoGrid photos={group.photos} />
                </View>
              ))}
            </View>
          </ScrollView>
        </ActivePhotoMobileShell>
      </View>
    </SafeAreaView>
  );
}

export default GuardianMorePage;