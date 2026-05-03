import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

function ActivityPhotoCard({ photo, onClick }) {
  return (
    <Pressable style={styles.card} onPress={onClick}>
      <Image source={{ uri: photo.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {photo.title}
        </Text>
        <Text style={styles.time}>{photo.time}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {photo.desc}
        </Text>
        <View style={styles.likeWrap}>
          <Text style={styles.like}>♡</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 96,
  },
  content: {
    padding: 12,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  time: {
    fontSize: 11,
    color: '#64748b',
  },
  desc: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748b',
  },
  likeWrap: {
    alignItems: 'flex-end',
  },
  like: {
    color: '#cbd5e1',
  },
});

export default ActivityPhotoCard;
