import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_CITY = 'New York';

const WEATHER_CODE_MAP = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Heavy freezing drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧��' },
  67: { label: 'Heavy freezing rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Moderate showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '🌧️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Severe hail storm', icon: '⛈️' },
};

function formatTemperature(value) {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value)}°C`;
}

function formatTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDay(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(new Date(value));
}

function getWeatherMeta(code) {
  return WEATHER_CODE_MAP[code] || { label: 'Unknown', icon: '🌡️' };
}

export default function App() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (searchTerm = city) => {
    try {
      setLoading(true);
      setError('');

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchTerm,
        )}&count=1&language=en&format=json`,
      );

      if (!geoRes.ok) {
        throw new Error('Location lookup failed.');
      }

      const geoData = await geoRes.json();
      const place = geoData.results?.[0];

      if (!place) {
        throw new Error(`No matching city found for "${searchTerm}".`);
      }

      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`;

      const weatherRes = await fetch(apiUrl);
      if (!weatherRes.ok) {
        throw new Error('Weather data request failed.');
      }

      const data = await weatherRes.json();
      const current = data.current;
      const nextHours = data.hourly?.time?.slice(0, 6).map((time, index) => ({
        time,
        temp: data.hourly.temperature_2m[index],
        code: data.hourly.weather_code[index],
      })) || [];

      const nextDays = data.daily?.time?.slice(0, 5).map((date, index) => ({
        date,
        max: data.daily.temperature_2m_max[index],
        min: data.daily.temperature_2m_min[index],
        code: data.daily.weather_code[index],
      })) || [];

      setWeather({
        location: `${place.name}${place.country ? `, ${place.country}` : ''}`,
        current: {
          temp: current?.temperature_2m,
          feelsLike: current?.apparent_temperature,
          humidity: current?.relative_humidity_2m,
          wind: current?.wind_speed_10m,
          code: current?.weather_code,
          time: current?.time,
        },
        hourly: nextHours,
        daily: nextDays,
        sunrise: data.daily?.sunrise?.[0],
        sunset: data.daily?.sunset?.[0],
      });
      setCity(place.name);
    } catch (err) {
      setError(err.message || 'Unable to load weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(DEFAULT_CITY);
  }, []);

  const currentMeta = useMemo(
    () => getWeatherMeta(weather?.current?.code),
    [weather],
  );

  const handleSearch = () => {
    if (!query.trim()) {
      setError('Please enter a city name.');
      return;
    }
    fetchWeather(query.trim());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Weather Dashboard</Text>

          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search city"
              placeholderTextColor="#a5b4fc"
              style={styles.input}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.button} onPress={handleSearch}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#93c5fd" />
              <Text style={styles.loadingText}>Loading forecast...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : weather ? (
            <>
              <View style={styles.heroSection}>
                <Text style={styles.location}>{weather.location}</Text>
                <Text style={styles.currentTime}>{formatTime(weather.current.time)}</Text>
                <Text style={styles.conditionIcon}>{currentMeta.icon}</Text>
                <Text style={styles.temperature}>{formatTemperature(weather.current.temp)}</Text>
                <Text style={styles.condition}>{currentMeta.label}</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.label}>Feels like</Text>
                  <Text style={styles.value}>{formatTemperature(weather.current.feelsLike)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.label}>Humidity</Text>
                  <Text style={styles.value}>{weather.current.humidity ?? '—'}%</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.label}>Wind</Text>
                  <Text style={styles.value}>{weather.current.wind ?? '—'} km/h</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.label}>Sunrise</Text>
                  <Text style={styles.value}>{formatTime(weather.sunrise)}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Next 6 hours</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                  {weather.hourly.map((hour, index) => {
                    const meta = getWeatherMeta(hour.code);
                    return (
                      <View key={`${hour.time}-${index}`} style={styles.hourCard}>
                        <Text style={styles.hour}>{formatTime(hour.time)}</Text>
                        <Text style={styles.hourIcon}>{meta.icon}</Text>
                        <Text style={styles.hourTemp}>{formatTemperature(hour.temp)}</Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>5-day outlook</Text>
                {weather.daily.map((day, index) => {
                  const meta = getWeatherMeta(day.code);
                  return (
                    <View key={`${day.date}-${index}`} style={styles.dayRow}>
                      <Text style={styles.dayName}>{formatDay(day.date)}</Text>
                      <Text style={styles.dayIcon}>{meta.icon}</Text>
                      <Text style={styles.dayText}>{meta.label}</Text>
                      <Text style={styles.dayTemps}>{formatTemperature(day.max)} / {formatTemperature(day.min)}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 18,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    color: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    color: '#cbd5e1',
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    color: '#fee2e2',
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  location: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
  currentTime: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 4,
  },
  conditionIcon: {
    fontSize: 54,
    marginTop: 10,
  },
  temperature: {
    color: '#f8fafc',
    fontSize: 58,
    fontWeight: '700',
  },
  condition: {
    color: '#bfdbfe',
    fontSize: 18,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  value: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  horizontalList: {
    marginLeft: -4,
  },
  hourCard: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 12,
    marginRight: 12,
    minWidth: 90,
    alignItems: 'center',
  },
  hour: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  hourIcon: {
    fontSize: 28,
    marginVertical: 8,
  },
  hourTemp: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  dayName: {
    color: '#f8fafc',
    fontWeight: '700',
    width: 52,
  },
  dayIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  dayText: {
    flex: 1,
    color: '#dbeafe',
  },
  dayTemps: {
    color: '#f8fafc',
    fontWeight: '700',
  },
});
