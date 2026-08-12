import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { User, PerformanceData } from '../types';
import { DataService } from '../services/dataService';

export function useUserData() {
  const [user, setUser] = useState<User | null>(null);
  const [performances, setPerformances] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const userData = await DataService.getUser();
      setUser(userData);

      const userPerformances = userData
        ? await DataService.getPerformanceData(userData.id)
        : [];
      setPerformances(
        userPerformances.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tab screens stay mounted, so reload on focus to pick up tests
  // recorded on the Test tab.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { user, performances, loading, setUser, reload };
}
