import { Pressable, StyleSheet, Text, View } from 'react-native';

function ActivePhotoTopBar({ title, onBack }) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={8} onPress={onBack}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.bellIcon}>🔔</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    fontSize: 28,
    color: '#334155',
    width: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  bellIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'right',
    color: '#64748b',
  },
});

export default ActivePhotoTopBar;
