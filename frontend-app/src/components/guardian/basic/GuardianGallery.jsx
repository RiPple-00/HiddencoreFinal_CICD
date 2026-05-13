import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Text from "@/components/Text";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=50",
  "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=1200&q=50",
  "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=50",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=50",
];

export default function GuardianGallery({ navigation }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [rowWidth, setRowWidth] = useState(0);
  const scrollRef = useRef(null);

  const fallbackWidth = Dimensions.get("window").width;
  const effectiveWidth = rowWidth || fallbackWidth;
  const galleryWidth = Math.max(0, effectiveWidth);

  useEffect(() => {
    if (!galleryWidth) return;
    const interval = setInterval(() => {
      const nextIndex =
        currentImage === GALLERY_IMAGES.length - 1 ? 0 : currentImage + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * galleryWidth,
        animated: true,
      });
      setCurrentImage(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentImage, galleryWidth]);

  return (
    <View className="mx-5 mt-5">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("ActivePhotoGallery")}
      >
        <Text className="text-base font-extrabold text-guardian-text-primary mb-3">
          활동 갤러리
        </Text>
      </TouchableOpacity>
      <View
        onLayout={(e) =>
          setRowWidth(e?.nativeEvent?.layout?.width ?? 0)
        }
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("ActivePhotoGallery")}
        >
          <View className="bg-background-neutral rounded-2xl overflow-hidden">
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const x = event.nativeEvent.contentOffset.x;
                setCurrentImage(Math.round(x / galleryWidth));
              }}
              scrollEventThrottle={16}
            >
              {GALLERY_IMAGES.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{ width: galleryWidth, height: 200 }}
                />
              ))}
            </ScrollView>
            <View className="absolute bottom-3 right-3 bg-black/40 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">
                {currentImage + 1} / {GALLERY_IMAGES.length}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
