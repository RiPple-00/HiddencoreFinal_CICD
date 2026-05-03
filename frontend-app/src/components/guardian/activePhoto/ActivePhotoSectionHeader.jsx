import { Pressable, StyleSheet, Text, View } from 'react-native';

function ActivePhotoSectionHeader({ title, moreLabel, onMore }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onMore ? (
        <Pressable onPress={onMore}>
          <Text style={styles.more}>{moreLabel}</Text>
        </Pressable>
      ) : (
        <Text style={styles.placeholder}>{moreLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#1e293b',
  },
  more: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  placeholder: {
    fontSize: 14,
    fontWeight: '600',
    color: 'transparent',
  },
});

export default ActivePhotoSectionHeader;
