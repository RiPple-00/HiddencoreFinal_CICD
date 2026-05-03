import { Image, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import ActivePhotoMobileShell from '../../../components/guardian/activePhoto/ActivePhotoMobileShell';
import ActivePhotoTopBar from '../../../components/guardian/activePhoto/ActivePhotoTopBar';
import ActivePhotoInfoText from '../../../components/guardian/activePhoto/ActivePhotoInfoText';
import ActivePhotoSectionHeader from '../../../components/guardian/activePhoto/ActivePhotoSectionHeader';
import ActivePhotoGrid from '../../../components/guardian/activePhoto/ActivePhotoGrid';
import ActivePhotoBottomActions from '../../../components/guardian/activePhoto/ActivePhotoBottomActions';
import { styles } from "../../../styles/guardianMain.styles";

const todayPhotos = [
  {
    id: 1,
    title: '미술 치료 프로그램',
    time: '오전 10:30',
    desc: '색을 활용한 미술 활동으로 정서적 안정에 도움을 드렸어요.',
    image:
      'https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: '인지 활동 프로그램',
    time: '오후 2:00',
    desc: '제미있는 인지 활동으로 집중력 향상을 도왔어요.',
    image:
      'https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?auto=format&fit=crop&w=600&q=80',
  },
];

const weekPhotos = [
  {
    id: 3,
    title: '영양 식사 프로그램',
    time: '4월 20일 (일) 오후 12:10',
    desc: '균형 잡힌 식사로 건강한 하루를 시작했어요.',
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: '회상 활동 프로그램',
    time: '4월 18일 (금) 오후 1:40',
    desc: '옛 기억을 떠올리며 즐거운 시간을 보냈어요.',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  },
];

function GuardianGalleryPage({ navigation }) {
  const handleOpenMore = (range) => {
    navigation.navigate('GalleryMore', { range });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
    <ActivePhotoMobileShell>
      <ActivePhotoTopBar title="프로그램 사진 기록" onBack={() => navigation.goBack()} />
      <ActivePhotoInfoText />

      <View style={styles.heroCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=900&q=80',
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroBody}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroTitle}>오전 미술 치료</Text>
            <Text style={styles.heroBadge}>활동</Text>
          </View>
          <Text style={styles.heroTime}>오전 10:30</Text>
          <Text style={styles.heroDesc}>
            색칠 활동을 통해 집중력을 높이고 즐거운 시간을 보냈습니다. 오늘은 밝은 색을 많이
            사용했어요.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <ActivePhotoSectionHeader
          title="오늘"
          moreLabel="더보기 +"
          onMore={() => handleOpenMore('today')}
        />
        <ActivePhotoGrid photos={todayPhotos} />
      </View>

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

// const styles = StyleSheet.create({
//   heroCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden',
//     backgroundColor: '#ffffff',
//     elevation: 3,
//   },
//   heroImage: {
//     width: '100%',
//     height: 160,
//   },
//   heroBody: {
//     padding: 16,
//     gap: 8,
//   },
//   heroTitleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   heroTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1e293b',
//   },
//   heroBadge: {
//     fontSize: 12,
//     color: '#2563eb',
//     backgroundColor: '#dbeafe',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 999,
//     overflow: 'hidden',
//   },
//   heroTime: {
//     fontSize: 14,
//     color: '#2563eb',
//   },
//   heroDesc: {
//     fontSize: 14,
//     lineHeight: 22,
//     color: '#475569',
//   },
//   section: {
//     marginBottom: 20,
//   },
// });

export default GuardianGalleryPage;
