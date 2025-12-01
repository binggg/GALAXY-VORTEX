import { useState, useCallback, useEffect } from 'react';
import { activitiesCollection, participantsCollection, winnersCollection, _ } from '../lib/cloudbase';

interface Participant {
  id: string;
  name: string;
  _id?: string;
}

interface Prize {
  id: string;
  name: string;
  level: number;
  count: number;
  color: string;
  icon: string;
}

interface WinnerRecord {
  participant: Participant;
  prize: Prize;
  timestamp: number;
}

interface Activity {
  _id?: string;
  name: string;
  prizes: Prize[];
  createdAt: number;
  updatedAt: number;
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export function useLotteryDB(activityId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(activityId || null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // 加载所有活动
  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await activitiesCollection
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      setActivities(res.data as Activity[]);
    } catch (error) {
      console.error('加载活动列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 创建新活动
  const createActivity = useCallback(async (name: string, prizes: Prize[]) => {
    try {
      setIsSyncing(true);
      const now = Date.now();
      const res = await activitiesCollection.add({
        name,
        prizes,
        createdAt: now,
        updatedAt: now,
      });
      const newId = res.id;
      setCurrentActivityId(newId);
      await loadActivities();
      return newId;
    } catch (error) {
      console.error('创建活动失败:', error);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [loadActivities]);

  // 保存参与者到数据库
  const saveParticipants = useCallback(async (participants: Participant[]) => {
    if (!currentActivityId) return;
    
    try {
      setIsSyncing(true);
      // 先删除该活动的所有参与者
      await participantsCollection
        .where({ activityId: currentActivityId })
        .remove();
      
      // 批量添加参与者
      if (participants.length > 0) {
        const docs = participants.map(p => ({
          activityId: currentActivityId,
          participantId: p.id,
          name: p.name,
          createdAt: Date.now(),
        }));
        
        // 分批添加（每批最多20条）
        for (let i = 0; i < docs.length; i += 20) {
          const batch = docs.slice(i, i + 20);
          await Promise.all(batch.map(doc => participantsCollection.add(doc)));
        }
      }
    } catch (error) {
      console.error('保存参与者失败:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [currentActivityId]);

  // 加载参与者
  const loadParticipants = useCallback(async (): Promise<Participant[]> => {
    if (!currentActivityId) return [];
    
    try {
      setIsLoading(true);
      const res = await participantsCollection
        .where({ activityId: currentActivityId })
        .limit(1000)
        .get();
      
      return res.data.map((doc: any) => ({
        id: doc.participantId,
        name: doc.name,
        _id: doc._id,
      }));
    } catch (error) {
      console.error('加载参与者失败:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentActivityId]);

  // 保存中奖记录
  const saveWinnerRecord = useCallback(async (record: WinnerRecord) => {
    if (!currentActivityId) return;
    
    try {
      await winnersCollection.add({
        activityId: currentActivityId,
        participantId: record.participant.id,
        participantName: record.participant.name,
        prizeId: record.prize.id,
        prizeName: record.prize.name,
        prizeLevel: record.prize.level,
        prizeColor: record.prize.color,
        timestamp: record.timestamp,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error('保存中奖记录失败:', error);
    }
  }, [currentActivityId]);

  // 批量保存中奖记录
  const saveWinnerRecords = useCallback(async (records: WinnerRecord[]) => {
    if (!currentActivityId || records.length === 0) return;
    
    try {
      setIsSyncing(true);
      await Promise.all(records.map(record => saveWinnerRecord(record)));
    } catch (error) {
      console.error('批量保存中奖记录失败:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [currentActivityId, saveWinnerRecord]);

  // 加载中奖记录
  const loadWinnerRecords = useCallback(async (prizes: Prize[]): Promise<WinnerRecord[]> => {
    if (!currentActivityId) return [];
    
    try {
      setIsLoading(true);
      const res = await winnersCollection
        .where({ activityId: currentActivityId })
        .orderBy('timestamp', 'asc')
        .limit(1000)
        .get();
      
      return res.data.map((doc: any) => {
        const prize = prizes.find(p => p.id === doc.prizeId) || {
          id: doc.prizeId,
          name: doc.prizeName,
          level: doc.prizeLevel,
          count: 1,
          color: doc.prizeColor,
          icon: 'fa-medal',
        };
        
        return {
          participant: {
            id: doc.participantId,
            name: doc.participantName,
          },
          prize,
          timestamp: doc.timestamp,
        };
      });
    } catch (error) {
      console.error('加载中奖记录失败:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentActivityId]);

  // 删除活动
  const deleteActivity = useCallback(async (id: string) => {
    try {
      setIsSyncing(true);
      // 删除活动
      await activitiesCollection.doc(id).remove();
      // 删除关联的参与者
      await participantsCollection.where({ activityId: id }).remove();
      // 删除关联的中奖记录
      await winnersCollection.where({ activityId: id }).remove();
      
      await loadActivities();
      if (currentActivityId === id) {
        setCurrentActivityId(null);
      }
    } catch (error) {
      console.error('删除活动失败:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [currentActivityId, loadActivities]);

  // 初始加载
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    isLoading,
    isSyncing,
    currentActivityId,
    setCurrentActivityId,
    activities,
    loadActivities,
    createActivity,
    saveParticipants,
    loadParticipants,
    saveWinnerRecords,
    loadWinnerRecords,
    deleteActivity,
  };
}
