import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Text, DataTable, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { fishApi } from '../api/fishApi';

const TournamentResultsScreen = () => {
  const [fishData, setFishData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFishData = async () => {
    try {
      setLoading(true);
      const data = await fishApi.getAllFish();
      setFishData(data);
    } catch (error) {
      Alert.alert('Error', `Failed to fetch tournament results: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFishData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFishData();
  };

  const handleDeleteFish = async (fish) => {
    try {
      await fishApi.deleteFish(fish);
      Alert.alert('Success', 'Fish record deleted successfully');
      fetchFishData();
    } catch (error) {
      Alert.alert('Error', `Failed to delete record: ${error.message}`);
    }
  };

  const renderFishTable = () => {
    if (fishData.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <Text variant="bodyLarge">No fish catches recorded yet.</Text>
            <Button 
              mode="contained" 
              style={styles.refreshButton}
              onPress={fetchFishData}
            >
              Refresh
            </Button>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.tableCard}>
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Angler</DataTable.Title>
              <DataTable.Title>Species</DataTable.Title>
              <DataTable.Title numeric>Length (in)</DataTable.Title>
              <DataTable.Title>Date</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>

            {fishData.map((fish, index) => (
              <DataTable.Row key={fish.id || index}>
                <DataTable.Cell>{fish.caught_by}</DataTable.Cell>
                <DataTable.Cell>{fish.species}</DataTable.Cell>
                <DataTable.Cell numeric>{fish.length_inches}</DataTable.Cell>
                <DataTable.Cell>
                  {new Date(fish.catch_date).toLocaleDateString()}
                </DataTable.Cell>
                <DataTable.Cell>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => {
                      Alert.alert(
                        'Delete Record',
                        'Are you sure you want to delete this fish record?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Delete',
                            onPress: () => handleDeleteFish(fish),
                            style: 'destructive',
                          },
                        ]
                      );
                    }}
                  />
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  // Calculate tournament statistics
  const calculateStats = () => {
    if (fishData.length === 0) return null;

    // Find longest fish
    const longestFish = [...fishData].sort((a, b) => 
      b.length_inches - a.length_inches)[0];
      
    // Count by angler
    const catchesByAngler = fishData.reduce((acc, fish) => {
      acc[fish.caught_by] = (acc[fish.caught_by] || 0) + 1;
      return acc;
    }, {});
    
    // Find angler with most catches
    const topAngler = Object.entries(catchesByAngler)
      .sort((a, b) => b[1] - a[1])[0];
    
    return { longestFish, topAngler };
  };

  const stats = calculateStats();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Title title="Tournament Results" />
        <Card.Content>
          <Text variant="bodyMedium">
            Pull down to refresh the latest results.
          </Text>
        </Card.Content>
      </Card>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#0077b6" style={styles.loader} />
      ) : (
        <>
          {stats && (
            <Card style={styles.statsCard}>
              <Card.Title title="Tournament Statistics" />
              <Card.Content>
                <Text style={styles.statText}>
                  <Text style={styles.statLabel}>Total Catches:</Text> {fishData.length}
                </Text>
                
                {stats.longestFish && (
                  <Text style={styles.statText}>
                    <Text style={styles.statLabel}>Longest Fish:</Text> {stats.longestFish.length_inches}" {stats.longestFish.species} by {stats.longestFish.caught_by}
                  </Text>
                )}
                
                {stats.topAngler && (
                  <Text style={styles.statText}>
                    <Text style={styles.statLabel}>Top Angler:</Text> {stats.topAngler[0]} ({stats.topAngler[1]} catches)
                  </Text>
                )}
              </Card.Content>
            </Card>
          )}
          
          {renderFishTable()}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#e1f5fe',
  },
  tableCard: {
    marginBottom: 16,
    elevation: 4,
  },
  loader: {
    marginTop: 40,
  },
  emptyCard: {
    marginTop: 20,
    padding: 20,
  },
  emptyCardContent: {
    alignItems: 'center',
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: '#0077b6',
  },
  statText: {
    fontSize: 16,
    marginBottom: 8,
  },
  statLabel: {
    fontWeight: 'bold',
  },
});

export default TournamentResultsScreen;