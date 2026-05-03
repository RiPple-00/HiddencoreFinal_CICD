import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

function ActivePhotoMobileShell({ children, scrollable = true }) {
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 16,
  },
  content: {
    flex: 1,
    width: '100%',
  },
});

export default ActivePhotoMobileShell;
