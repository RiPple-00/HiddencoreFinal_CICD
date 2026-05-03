import { Pressable, StyleSheet, Text, View } from 'react-native';

function ActivePhotoBottomActions() {
  return (
    <View style={styles.row}>
      <Pressable style={[styles.button, styles.outlineButton]}>
        <Text style={[styles.buttonText, styles.outlineText]}>♡ 좋아요 누른 사진들</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.primaryButton]}>
        <Text style={[styles.buttonText, styles.primaryText]}>□ 전체 사진 보기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  outlineText: {
    color: '#3b82f6',
  },
  primaryText: {
    color: '#ffffff',
  },
});

export default ActivePhotoBottomActions;
