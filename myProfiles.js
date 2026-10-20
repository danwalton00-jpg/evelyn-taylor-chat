import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'mpfc_my_profiles_v1';

export async function loadMyProfiles() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMyProfiles(profiles) {
  if (!Array.isArray(profiles)) {
    throw new Error('Profiles must be stored as an array.');
  }

  if (profiles.length > 3) {
    throw new Error('You can save up to 3 profiles.');
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(profiles));
}
