import { Image, View, SafeAreaView } from 'react-native';
import Text from "../../../components/Text";
import ActivePhotoMobileShell from '../../../components/guardian/activePhoto/ActivePhotoMobileShell';
import ActivePhotoTopBar from '../../../components/guardian/activePhoto/ActivePhotoTopBar';
import ActivePhotoInfoText from '../../../components/guardian/activePhoto/ActivePhotoInfoText';
import ActivePhotoSectionHeader from '../../../components/guardian/activePhoto/ActivePhotoSectionHeader';
import ActivePhotoGrid from '../../../components/guardian/activePhoto/ActivePhotoGrid';
import ActivePhotoBottomActions from '../../../components/guardian/activePhoto/ActivePhotoBottomActions';

const todayPhotos = [
  {
    id: 1,
    title: '미술 치료 프로그램',
    time: '오전 10:30',
    desc: '색을 활용한 미술 활동으로 정서적 안정에 도움을 드렸어요.',
    image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: '인지 활동 프로그램',
    time: '오후 2:00',
    desc: '재미있는 인지 활동으로 집중력 향상을 도왔어요.',
    image: 'https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?auto=format&fit=crop&w=600&q=80',
  },
];

const weekPhotos = [
  {
    id: 3,
    title: '영양 식사 프로그램',
    time: '4월 20일 (일) 오후 12:10',
    desc: '균형 잡힌 식사로 건강한 하루를 시작했어요.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: '회상 활동 프로그램',
    time: '4월 18일 (금) 오후 1:40',
    desc: '옛 기억을 떠올리며 즐거운 시간을 보냈어요.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  },
];

function GuardianGalleryPage({ navigation }) {
  const handleOpenMore = (range) => {
    navigation.navigate('GalleryMore', { range });
  };

  return (
    <SafeAreaView className="flex-1 bg-guardian-bg-primary">
      <View className="flex-1">
        <ActivePhotoMobileShell>
          <ActivePhotoTopBar
            title="프로그램 사진 기록"
            onBack={() => navigation.goBack()}
          />
          <ActivePhotoInfoText />

          {/* 히어로 카드 */}
          <View className="mb-5 rounded-2xl overflow-hidden bg-background-neutral">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=900&q=80' }}
              className="w-full h-40"
            />
            <View className="p-4 gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-bold text-guardian-text-primary">
                  오전 미술 치료
                </Text>
                {/* 뱃지: 보호자 보조색 배경 + 브랜드 갈색 텍스트 */}
                <Text className="text-xs text-guardian-text-primary bg-guardian-button-secondary px-2 py-[2px] rounded-full overflow-hidden">
                  활동
                </Text>
              </View>
              {/* 시간: 노란 포인트 */}
              <Text className="text-sm text-guardian-text-secondary">오전 10:30</Text>
              <Text className="text-sm leading-[22px] text-guardian-text-neutral">
                색칠 활동을 통해 집중력을 높이고 즐거운 시간을 보냈습니다. 오늘은 밝은 색을 많이 사용했어요.
              </Text>
            </View>
          </View>

          {/* 오늘 섹션 */}
          <View className="mb-5">
            <ActivePhotoSectionHeader
              title="오늘"
              moreLabel="더보기 +"
              onMore={() => handleOpenMore('today')}
            />
            <ActivePhotoGrid photos={todayPhotos} />
          </View>

          {/* 일주일 섹션 */}
          <View>
            <ActivePhotoSectionHeader
              title="일주일"
              moreLabel="더보기 +"
              onMore={() => handleOpenMore('week')}
            />
            <ActivePhotoGrid photos={weekPhotos} />
          </View>

          <ActivePhotoBottomActions />
        </ActivePhotoMobileShell>
      </View>
    </SafeAreaView>
  );
}

export default GuardianGalleryPage;