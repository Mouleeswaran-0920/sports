import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, PerformanceData, Challenge, LeaderboardEntry } from '../types';

export class DataService {
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async savePerformanceData(data: PerformanceData): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem('performances');
      const performances = existingData ? JSON.parse(existingData) : [];
      performances.push(data);
      await AsyncStorage.setItem('performances', JSON.stringify(performances));
    } catch (error) {
      console.error('Error saving performance data:', error);
    }
  }

  static async getPerformanceData(userId?: string): Promise<PerformanceData[]> {
    try {
      const data = await AsyncStorage.getItem('performances');
      const performances: PerformanceData[] = data ? JSON.parse(data) : [];
      return userId ? performances.filter(p => p.userId === userId) : performances;
    } catch (error) {
      console.error('Error getting performance data:', error);
      return [];
    }
  }

  static async getChallenges(): Promise<Challenge[]> {
    // Mock data - in production this would come from API
    return [
      {
        id: '1',
        name: 'Push-Up Challenge',
        description: 'Complete 100 push-ups in a week',
        type: 'strength',
        endDate: '2025-01-20',
        participants: 245
      },
      {
        id: '2',
        name: 'Sprint Speed Test',
        description: 'Improve your 100m sprint time',
        type: 'speed',
        endDate: '2025-01-25',
        participants: 189
      },
      {
        id: '3',
        name: 'Flexibility Focus',
        description: 'Daily stretching routine',
        type: 'flexibility',
        endDate: '2025-01-30',
        participants: 156
      }
    ];
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Mock data - in production this would come from API
    return [
      { userId: '1', name: 'Rajesh Kumar', score: 95, rank: 1 },
      { userId: '2', name: 'Priya Sharma', score: 92, rank: 2 },
      { userId: '3', name: 'Amit Patel', score: 89, rank: 3 },
      { userId: '4', name: 'Sneha Reddy', score: 87, rank: 4 },
      { userId: '5', name: 'Vikram Singh', score: 85, rank: 5 }
    ];
  }

  static async syncData(): Promise<void> {
    // Mock sync - in production this would upload to Sports Authority of India
    const performances = await this.getPerformanceData();
    const unsyncedData = performances.filter(p => !p.id.includes('synced'));
    
    for (const data of unsyncedData) {
      // Create motion signature (compressed data < 50KB)
      const motionSignature = {
        userId: data.userId,
        testType: data.testType,
        score: data.score,
        timestamp: data.createdAt,
        biometrics: {
          posture: data.posture,
          technique: data.technique
        }
      };
      
      console.log('Syncing motion signature:', motionSignature);
      // In production: upload to SAI servers
    }
  }
}