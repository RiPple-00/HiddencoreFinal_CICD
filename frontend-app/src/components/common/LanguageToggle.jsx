import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useI18n } from '@/hooks/useI18n';
import Text from '@/components/Text';

const LANGUAGE_OPTIONS = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
];

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSelect = (value) => {
    setLanguage(value);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => setOpen((prev) => !prev)}>
        <Text className="font-semibold text-sm text-guardian-text-primary">
          {LANGUAGE_OPTIONS.find((item) => item.value === language)?.label ?? language}
        </Text>
      </Pressable>
      {open && (
        <View style={styles.menu}>
          {LANGUAGE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={styles.option}
              onPress={() => handleSelect(option.value)}
            >
              <Text className="text-sm text-guardian-text-primary">
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  menu: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 120,
    zIndex: 1000,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
});
