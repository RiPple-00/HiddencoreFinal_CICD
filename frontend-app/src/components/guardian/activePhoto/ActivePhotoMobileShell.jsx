import { ScrollView, View } from 'react-native';

function ActivePhotoMobileShell({ children, scrollable = true }) {
  if (!scrollable) {
    return <View className="flex-1 w-full bg-guardian-bg-secondary">{children}</View>;
  }

  return (
    <ScrollView
      className="flex-1 bg-guardian-bg-secondary"
      contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
      showsVerticalScrollIndicator
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full">{children}</View>
    </ScrollView>
  );
}

export default ActivePhotoMobileShell;