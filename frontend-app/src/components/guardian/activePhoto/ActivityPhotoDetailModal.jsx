import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=900&q=80';

const FALLBACK_TITLE = '제목 없음';
const FALLBACK_DESC = '내용이 없습니다.';
const FALLBACK_TIME = '시간 정보 없음';

function getFirstFileUrl(fileUrls) {
  if (!fileUrls || typeof fileUrls !== 'string') return '';
  const [firstUrl] = fileUrls
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  return firstUrl ?? '';
}

function normalizePhoto(photo) {
  if (!photo) return null;

  const imageUrl =
    photo.imageUrl ??
    photo.image ??
    photo.fileUrl ??
    getFirstFileUrl(photo.fileUrls) ??
    FALLBACK_IMAGE;

  const title = photo.title?.trim() || FALLBACK_TITLE;
  const desc = photo.content?.trim() || photo.desc?.trim() || FALLBACK_DESC;
  const time = photo.time?.trim() || photo.createdAt?.trim() || FALLBACK_TIME;

  return {
    imageUrl,
    title,
    desc,
    time,
    raw: photo,
  };
}

function ActivityPhotoDetailModal({ photo, onClose, onSave }) {
  const normalizedPhoto = normalizePhoto(photo);

  return (
    <Modal
      visible={Boolean(normalizedPhoto)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Pressable style={styles.saveButton} onPress={() => onSave?.(normalizedPhoto?.raw)}>
              <Text style={styles.saveButtonText}>저장</Text>
            </Pressable>
            <Text style={styles.more}>•••</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          {normalizedPhoto && (
            <>
              <Image source={{ uri: normalizedPhoto.imageUrl }} style={styles.image} />
              <View style={styles.body}>
                <Text style={styles.title}>제목 : {normalizedPhoto.title}</Text>
                <Text style={styles.time}>◷ {normalizedPhoto.time}</Text>
                <Text style={styles.label}>내용 :</Text>
                <Text style={styles.desc}>{normalizedPhoto.desc}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  topRow: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  more: {
    color: '#94a3b8',
  },
  close: {
    fontSize: 30,
    lineHeight: 30,
    color: '#94a3b8',
  },
  image: {
    marginBottom: 16,
    width: '100%',
    height: 256,
    borderRadius: 16,
  },
  body: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#334155',
  },
  time: {
    color: '#64748b',
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  desc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
});

export default ActivityPhotoDetailModal;
