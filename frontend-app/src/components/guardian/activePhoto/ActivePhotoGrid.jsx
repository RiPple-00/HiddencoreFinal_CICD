import { useState } from 'react';
import { View } from 'react-native';
import ActivityPhotoCard from './ActivityPhotoCard';
import ActivityPhotoDetailModal from './ActivityPhotoDetailModal';

function ActivePhotoGrid({ photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <>
      <View className="flex-row flex-wrap gap-3">
        {photos.map((photo) => (
          <ActivityPhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => setSelectedPhoto(photo)}
          />
        ))}
      </View>

      <ActivityPhotoDetailModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onSave={() => setSelectedPhoto(null)}
      />
    </>
  );
}

export default ActivePhotoGrid;