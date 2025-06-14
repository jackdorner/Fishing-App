import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';

// Update interface to match the actual contest structure coming from API
interface Contest {
  contest_name: string;
  first: { name: string; place: number; value: number };
  second: { name: string; place: number; value: number };
  third: { name: string; place: number; value: number };
  fourth: { name: string; place: number; value: number };
  fifth: { name: string; place: number; value: number };
}

export default function HomeScreen() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContests = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const contestsData = await apiService.getContests();
      console.log('Fetched contests:', contestsData); // Debugging line
      
      if (contestsData && Array.isArray(contestsData)) {
        setContests(contestsData);
      } else {
        setContests([]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch contests');
      Alert.alert('Error', error.message || 'Failed to fetch contests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContests();
  };

  const renderPlaceItem = (placeObj: { name: string; place: number; value: number }) => {
    if (!placeObj) return null;
    
    const place = placeObj.place;
    const name = placeObj.name;
    const value = placeObj.value;
    
    const placeText = place === 1 ? '1st' : 
                      place === 2 ? '2nd' : 
                      place === 3 ? '3rd' : `${place}th`;
    
    return (
      <View style={styles.placeRow} key={`${name}-${place}-${value}`}>
        <Text style={styles.placeNumber}>{placeText}</Text>
        <Text style={styles.placeName}>{name}</Text>
        <Text style={styles.placeValue}>{value}</Text>
      </View>
    );
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
        <Text style={styles.headerText}>Fishing Contests</Text>
        <MaterialCommunityIcons name="fish" size={30} color="#ffd33d" />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>Loading contests...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchContests}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : contests.length === 0 ? (
        <View style={styles.noContestsContainer}>
          <Text style={styles.noContestsText}>No contests found</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchContests}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {contests.map((contest, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.contestHeader}>
                <Text style={styles.contestName}>{contest.contest_name}</Text>
              </View>
              
              <View style={styles.placesContainer}>
                {renderPlaceItem(contest.first)}
                {renderPlaceItem(contest.second)}
                {renderPlaceItem(contest.third)}
                {renderPlaceItem(contest.fourth)}
                {renderPlaceItem(contest.fifth)}
              </View>
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
  card: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
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
  noContestsContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  noContestsText: {
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
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contestName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contestDate: {
    color: '#aaa',
    fontSize: 14,
  },
  placesContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#555',
    paddingTop: 8,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  placeNumber: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 40,
  },
  placeName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  placeValue: {
    color: '#aaa',
    fontSize: 16,
    marginLeft: 10,
  }
});