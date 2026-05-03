import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ActivityPhotoCard from './ActivityPhotoCard';
import ActivityPhotoDetailModal from './ActivityPhotoDetailModal';

function ActivePhotoGrid({ photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <>
      <View style={styles.grid}>
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

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

export default ActivePhotoGrid;
