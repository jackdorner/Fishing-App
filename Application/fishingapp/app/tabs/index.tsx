import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService, FishEntry } from '../../services/apiService';

export default function Index() {
  const [fish, setFish] = useState<FishEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFish = async () => {
    try {
      setLoading(true);
      setError(null);
      const fishData = await apiService.getAllFish();
      setFish(fishData);
    } catch (err: any) {
      setError(err.message || 'Failed to load fish data');
      Alert.alert('Error', err.message || 'Failed to load fish data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFish();
  };

  useEffect(() => {
    loadFish();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.text}>Loading fish data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>All Fish Caught</Text>
        <Link href="/tabs/settings" asChild>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#ffd33d" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFish}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : fish.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fish-outline" size={64} color="#aaa" />
          <Text style={styles.emptyText}>No fish caught yet</Text>
          <Link href="/tabs/manageFish" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Your First Catch</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={fish}
          keyExtractor={(item, index) => `${item.id || ''}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.fishCard}>
              <View style={styles.fishHeader}>
                <Ionicons name="fish" size={24} color="#ffd33d" />
                <Text style={styles.fishSpecies}>{item.species}</Text>
              </View>
              <View style={styles.fishDetails}>
                <Text style={styles.fishInfo}>
                  <Text style={styles.label}>Length: </Text>
                  {item.length_inches} inches
                </Text>
                <Text style={styles.fishInfo}>
                  <Text style={styles.label}>Caught by: </Text>
                  {item.caught_by}
                </Text>
                <Text style={styles.fishInfo}>
                  <Text style={styles.label}>Date: </Text>
                  {formatDate(item.catch_date)}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ffd33d"]}
              tintColor="#ffd33d"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  headerText: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  fishCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  fishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fishSpecies: {
    color: '#ffd33d',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fishDetails: {
    marginLeft: 32,
  },
  fishInfo: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  label: {
    color: '#aaa',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#25292e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#25292e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    color: '#fff',
    marginTop: 12,
  },
});
