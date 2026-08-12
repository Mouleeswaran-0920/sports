import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Camera, RotateCcw, CircleCheck as CheckCircle, Circle as XCircle, Upload } from 'lucide-react-native';
import { AIService } from '../../services/aiService';
import { DataService } from '../../services/dataService';
import { User, PerformanceData } from '../../types';

export default function TestScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'environment' | 'recording' | 'review' | 'analysis'>('environment');
  const [environmentCheck, setEnvironmentCheck] = useState<any>(null);
  const [realtimeFeedback, setRealtimeFeedback] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const loadUser = async () => {
    const userData = await DataService.getUser();
    setUser(userData);
  };

  useEffect(() => {
    if (recording) {
      const interval = setInterval(() => {
        setRealtimeFeedback(AIService.getRealtimeFeedback({}));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [recording]);

  const checkEnvironment = async () => {
    triggerHaptic();
    try {
      // Mock environment check - in production this would use camera preview
      const mockImageBase64 = 'mock_image_data';
      const result = await AIService.analyzeEnvironment(mockImageBase64);
      setEnvironmentCheck(result);
      
      const overallScore = (result.lighting + result.framing + result.background) / 3;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (overallScore >= 7) {
        Alert.alert(
          'Environment Check Complete',
          `Good environment for testing! Overall score: ${overallScore.toFixed(1)}/10`,
          [{ text: 'Start Recording', onPress: () => setCurrentStep('recording') }]
        );
      } else {
        Alert.alert(
          'Environment Needs Improvement',
          result.suggestions,
          [
            { text: 'Check Again', onPress: checkEnvironment },
            { text: 'Proceed Anyway', onPress: () => setCurrentStep('recording') }
          ]
        );
      }
    } catch (error) {
      console.error('Environment check failed:', error);
      Alert.alert('Error', 'Could not analyze environment. Proceeding to recording.');
      setCurrentStep('recording');
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    try {
      setRecording(true);
      const result = await cameraRef.current.recordAsync({
        maxDuration: 30
      });
      
      if (result?.uri) {
        setVideoUri(result.uri);
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Recording failed:', error);
      Alert.alert('Error', 'Failed to record video');
    } finally {
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    
    cameraRef.current.stopRecording();
    setRecording(false);
  };

  const retakeVideo = () => {
    triggerHaptic();
    setVideoUri(null);
    setCurrentStep('recording');
  };

  const confirmVideo = async () => {
    if (!videoUri || !user) return;
    triggerHaptic();

    setCurrentStep('analysis');
    
    try {
      const result = await AIService.analyzePerformance(videoUri, 'Fitness Test', user);
      
      // Save performance data
      const performanceData: PerformanceData = {
        id: Date.now().toString(),
        userId: user.id,
        testType: 'Fitness Assessment',
        score: result.score,
        repCount: result.repCount,
        jumpHeight: result.jumpHeight,
        runTime: parseFloat(result.runTime),
        posture: result.posture,
        technique: result.technique,
        suitability: result.suitability,
        injuryRisk: result.injuryRisk,
        createdAt: new Date().toISOString()
      };

      await DataService.savePerformanceData(performanceData);
      setAnalysisResult(result);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert(
        'Analysis Complete!',
        `Your performance score: ${result.score}%\nInjury Risk: ${result.injuryRisk}\n${result.growthPrediction}`,
        [{ text: 'View Details', onPress: () => {} }]
      );
      
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze video');
    }
  };

  const resetTest = () => {
    setVideoUri(null);
    setCurrentStep('environment');
    setEnvironmentCheck(null);
    setAnalysisResult(null);
    setRealtimeFeedback('');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera access is required for fitness testing</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentStep === 'environment' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Environment Quality Check</Text>
          <Text style={styles.stepDescription}>
            We'll check your lighting, background, and framing for optimal recording quality.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={checkEnvironment}>
            <Camera size={24} color="white" />
            <Text style={styles.buttonText}>Check Environment</Text>
          </TouchableOpacity>
          
          {environmentCheck && (
            <View style={styles.environmentResults}>
              <Text style={styles.resultTitle}>Environment Analysis:</Text>
              <Text style={styles.resultItem}>Lighting: {environmentCheck.lighting}/10</Text>
              <Text style={styles.resultItem}>Framing: {environmentCheck.framing}/10</Text>
              <Text style={styles.resultItem}>Background: {environmentCheck.background}/10</Text>
              <Text style={styles.suggestions}>{environmentCheck.suggestions}</Text>
            </View>
          )}
        </View>
      )}

      {currentStep === 'recording' && (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="video"
          >
            {realtimeFeedback && (
              <View style={styles.feedbackOverlay}>
                <Text style={styles.feedbackText}>{realtimeFeedback}</Text>
              </View>
            )}
            
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              >
                <RotateCcw size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.recordButton, recording && styles.recordingButton]}
                onPress={recording ? stopRecording : startRecording}
              >
                <Text style={styles.recordButtonText}>
                  {recording ? 'Stop' : 'Record'}
                </Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}

      {currentStep === 'review' && videoUri && (
        <View style={styles.reviewContainer}>
          <Text style={styles.stepTitle}>Review Your Recording</Text>
          <Video
            source={{ uri: videoUri }}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
          
          <View style={styles.reviewControls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={retakeVideo}>
              <XCircle size={24} color="#EF4444" />
              <Text style={[styles.buttonText, { color: '#EF4444' }]}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryButton} onPress={confirmVideo}>
              <CheckCircle size={24} color="white" />
              <Text style={styles.buttonText}>Confirm & Analyze</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentStep === 'analysis' && (
        <View style={styles.analysisContainer}>
          <Text style={styles.stepTitle}>AI Analysis in Progress...</Text>
          <Text style={styles.stepDescription}>
            Processing your performance data and generating insights.
          </Text>
          
          {analysisResult && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultTitle}>Performance Results</Text>
              <View style={styles.scoreCard}>
                <Text style={styles.overallScore}>{analysisResult.score}%</Text>
                <Text style={styles.scoreLabel}>Overall Score</Text>
              </View>
              
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analysisResult.posture}%</Text>
                  <Text style={styles.metricLabel}>Posture</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analysisResult.technique}%</Text>
                  <Text style={styles.metricLabel}>Technique</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analysisResult.repCount}</Text>
                  <Text style={styles.metricLabel}>Reps</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analysisResult.injuryRisk}</Text>
                  <Text style={styles.metricLabel}>Injury Risk</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.primaryButton} onPress={resetTest}>
                <Upload size={24} color="white" />
                <Text style={styles.buttonText}>Take Another Test</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  permissionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  environmentResults: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  resultItem: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 8,
  },
  suggestions: {
    fontSize: 14,
    color: '#60A5FA',
    marginTop: 12,
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  feedbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    padding: 15,
  },
  recordButton: {
    backgroundColor: '#EF4444',
    borderRadius: 40,
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  recordingButton: {
    backgroundColor: '#7C2D12',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: 'black',
    borderRadius: 12,
    marginBottom: 24,
  },
  reviewControls: {
    flexDirection: 'row',
    gap: 16,
  },
  analysisContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  resultsContainer: {
    marginTop: 32,
  },
  scoreCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#E2E8F0',
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  metricLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
});