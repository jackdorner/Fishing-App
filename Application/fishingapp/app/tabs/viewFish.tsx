import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, FishEntry } from '../../services/apiService';

export default function ViewFishScreen() {
  const [fishEntries, setFishEntries] = useState<FishEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFish = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.getFish();
      
      if (response && Array.isArray(response)) {
        // Map the name field to angler for clarity
        const formattedFish = response.map((fish: FishEntry) => ({
          ...fish,
          angler: fish.name,
        }));
        setFishEntries(formattedFish);
      } else {
        setFishEntries([]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch fish entries');
      Alert.alert('Error', error.message || 'Failed to fetch fish entries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFish();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFish();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd33d" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Fish Entries</Text>
        <MaterialCommunityIcons name="fish" size={30} color="#ffd33d" />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>Loading fish entries...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFish}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : fishEntries.length === 0 ? (
        <View style={styles.noEntriesContainer}>
          <Text style={styles.noEntriesText}>No fish entries found</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchFish}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.anglerCell]}>Angler</Text>
            <Text style={[styles.headerCell, styles.speciesCell]}>Species</Text>
            <Text style={[styles.headerCell, styles.lengthCell]}>Length</Text>
            <Text style={[styles.headerCell, styles.dateCell]}>Date</Text>
          </View>
          
          {/* Table Rows */}
          {fishEntries.map((fish, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.evenRow : styles.oddRow
              ]}
            >
              <Text style={[styles.cell, styles.anglerCell]} numberOfLines={1} ellipsizeMode="tail">
                {fish.name}
              </Text>
              <Text style={[styles.cell, styles.speciesCell]} numberOfLines={1} ellipsizeMode="tail">
                {fish.species}
              </Text>
              <Text style={[styles.cell, styles.lengthCell]}>
                {fish.length_in}
              </Text>
              <Text style={[styles.cell, styles.dateCell]}>
                {formatDate(fish.catch_date)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
    paddingTop: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 5,
    padding: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noEntriesContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  noEntriesText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 5,
    padding: 10,
    paddingHorizontal: 20,
  },
  refreshButtonText: {
    color: '#25292e',
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#444',
    borderBottomWidth: 2,
    borderBottomColor: '#ffd33d',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    color: '#ffd33d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  evenRow: {
    backgroundColor: '#333',
  },
  oddRow: {
    backgroundColor: '#383838',
  },
  cell: {
    color: '#fff',
    fontSize: 15,
  },
  anglerCell: {
    flex: 2,
    marginRight: 5,
  },
  speciesCell: {
    flex: 2,
    marginRight: 3,
  },
  lengthCell: {
    flex: 2,
    marginRight: 7,
    textAlign: 'center',
  },
  dateCell: {
    flex: 2.5,
  }
});