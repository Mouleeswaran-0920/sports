import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { User, PerformanceData } from '../../types';
import { DataService } from '../../services/dataService';
import { CreditCard as Edit, Save, ChartBar as BarChart, Trophy, Shield, QrCode } from 'lucide-react-native';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [performances, setPerformances] = useState<PerformanceData[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const loadUserData = async () => {
    const userData = await DataService.getUser();
    setUser(userData);
    setEditedUser(userData);
    
    if (userData) {
      const performanceData = await DataService.getPerformanceData();
      const userPerformances = performanceData.filter(p => p.userId === userData.id);
      setPerformances(userPerformances);
    }
  };

  const handleSave = async () => {
    if (!editedUser) return;
    
    await DataService.saveUser(editedUser);
    setUser(editedUser);
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const generatePerformanceReport = () => {
    triggerHaptic();
    if (performances.length === 0) {
      Alert.alert('No Data', 'Complete some fitness tests to generate a performance report.');
      return;
    }
    
    Alert.alert(
      'Performance Report',
      'Your digital performance card with QR code has been generated. This can be shared with coaches and sports authorities.',
      [{ text: 'OK' }]
    );
  };

  const getPerformanceStats = () => {
    if (performances.length === 0) return null;
    
    const avgScore = performances.reduce((sum, p) => sum + p.score, 0) / performances.length;
    const bestScore = Math.max(...performances.map(p => p.score));
    const totalTests = performances.length;
    
    return { avgScore: Math.round(avgScore), bestScore, totalTests };
  };

  const stats = getPerformanceStats();

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const headerPaddingTop = Math.max(insets.top + 16, 50);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userMeta}>
              {user.age} years • {user.gender} • {user.region || 'India'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? (
            <Save size={20} color="white" />
          ) : (
            <Edit size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <BarChart size={32} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.avgScore}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
          
          <View style={styles.statCard}>
            <Trophy size={32} color="#10B981" />
            <Text style={styles.statValue}>{stats.bestScore}%</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
          
          <View style={styles.statCard}>
            <Shield size={32} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.totalTests}</Text>
            <Text style={styles.statLabel}>Tests Completed</Text>
          </View>
        </View>
      )}

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={editedUser?.name || ''}
                onChangeText={(text) => 
                  setEditedUser(prev => prev ? { ...prev, name: text } : null)
                }
              />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser?.age.toString() || ''}
                  onChangeText={(text) => 
                    setEditedUser(prev => prev ? { ...prev, age: parseInt(text) || 0 } : null)
                  }
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser?.height?.toString() || ''}
                  onChangeText={(text) => 
                    setEditedUser(prev => prev ? { ...prev, height: parseInt(text) || undefined } : null)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser?.weight?.toString() || ''}
                  onChangeText={(text) => 
                    setEditedUser(prev => prev ? { ...prev, weight: parseInt(text) || undefined } : null)
                  }
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Region</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser?.region || ''}
                  onChangeText={(text) => 
                    setEditedUser(prev => prev ? { ...prev, region: text } : null)
                  }
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sport Interest</Text>
              <TextInput
                style={styles.input}
                value={editedUser?.sportInterest || ''}
                onChangeText={(text) => 
                  setEditedUser(prev => prev ? { ...prev, sportInterest: text } : null)
                }
              />
            </View>
          </View>
        ) : (
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Height:</Text>
              <Text style={styles.detailValue}>{user.height || 'Not set'} cm</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight:</Text>
              <Text style={styles.detailValue}>{user.weight || 'Not set'} kg</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sport Interest:</Text>
              <Text style={styles.detailValue}>{user.sportInterest || 'Not specified'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Experience:</Text>
              <Text style={styles.detailValue}>{user.experience || 'Not specified'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member Since:</Text>
              <Text style={styles.detailValue}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={generatePerformanceReport}
        >
          <QrCode size={24} color="#3B82F6" />
          <Text style={styles.actionButtonText}>Generate Performance Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => Alert.alert('Feature', 'Export data functionality coming soon!')}
        >
          <BarChart size={24} color="#64748B" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Export Performance Data
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.supportSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Text style={styles.supportText}>
          This app is designed to support Sports Authority of India's talent identification programs. 
          Your performance data helps identify athletic potential and provides personalized training recommendations.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  profileSection: {
    backgroundColor: 'white',
    margin: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  profileDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  secondaryButtonText: {
    color: '#64748B',
  },
  supportSection: {
    margin: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  supportText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});