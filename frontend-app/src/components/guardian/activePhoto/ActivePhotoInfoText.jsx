import { StyleSheet, Text } from 'react-native';

function ActivePhotoInfoText() {
  return (
    <Text style={styles.infoText}>
      병원에서 진행한 프로그램 활동 모습을 확인하실 수 있어요.
    </Text>
  );
}

const styles = StyleSheet.create({
  infoText: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
    paddingHorizontal: 20,
  },
});

export default ActivePhotoInfoText;
