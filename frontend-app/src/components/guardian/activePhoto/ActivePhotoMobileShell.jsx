import { SafeAreaView, ScrollView, View } from 'react-native';

function ActivePhotoMobileShell({ children, scrollable = true }) {
  const content = (
    <View className="flex-1 w-full">{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-guardian-bg-secondary">
      {scrollable ? (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
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

export default ActivePhotoMobileShell;