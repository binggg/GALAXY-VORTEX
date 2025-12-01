import { useState, useCallback, useRef, useEffect } from 'react';
import GalaxyScene from '../components/GalaxyScene';
import ControlPanel from '../components/ControlPanel';
import WinnerModal from '../components/WinnerModal';
import Header from '../components/Header';
import { useLotteryDB } from '../hooks/useLotteryDB';

interface Participant {
  id: string;
  name: string;
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

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 默认参与者 - 宝可梦角色
const defaultParticipants: Participant[] = [
  { id: generateId(), name: '皮卡丘' },
  { id: generateId(), name: '小火龙' },
  { id: generateId(), name: '杰尼龟' },
  { id: generateId(), name: '妙蛙种子' },
  { id: generateId(), name: '伊布' },
  { id: generateId(), name: '喵喵' },
  { id: generateId(), name: '可达鸭' },
  { id: generateId(), name: '卡比兽' },
  { id: generateId(), name: '超梦' },
  { id: generateId(), name: '梦幻' },
  { id: generateId(), name: '快龙' },
  { id: generateId(), name: '暴鲤龙' },
  { id: generateId(), name: '耿鬼' },
  { id: generateId(), name: '拉普拉斯' },
  { id: generateId(), name: '九尾' },
  { id: generateId(), name: '喷火龙' },
  { id: generateId(), name: '水箭龟' },
  { id: generateId(), name: '妙蛙花' },
  { id: generateId(), name: '皮可西' },
  { id: generateId(), name: '胖丁' },
];

// 默认奖品配置
const defaultPrizes: Prize[] = [
  { id: generateId(), name: '三等奖', level: 3, count: 5, color: '#CD7F32', icon: 'fa-medal' },
  { id: generateId(), name: '二等奖', level: 2, count: 3, color: '#C0C0C0', icon: 'fa-award' },
  { id: generateId(), name: '一等奖', level: 1, count: 1, color: '#FFD700', icon: 'fa-crown' },
];

export default function LotteryPage() {
  const [participants, setParticipants] = useState<Participant[]>(defaultParticipants);
  const [isSpinning, setIsSpinning] = useState(false);
  // 改为支持多个中奖者
  const [winners, setWinners] = useState<Participant[]>([]);
  const [winnerRecords, setWinnerRecords] = useState<WinnerRecord[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  // 奖品配置
  const [prizes, setPrizes] = useState<Prize[]>(defaultPrizes);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  
  // 用于防止重复处理
  const isProcessingRef = useRef(false);

  // 云开发数据库 hook
  const {
    isSyncing,
    currentActivityId,
    setCurrentActivityId,
    createActivity,
    saveParticipants,
    loadParticipants,
    saveWinnerRecords,
    loadWinnerRecords,
  } = useLotteryDB();

  // 获取当前正在抽的奖品
  const currentPrize = prizes[currentPrizeIndex] || null;
  
  // 检查是否所有奖品都抽完了
  const allPrizesDrawn = currentPrizeIndex >= prizes.length;

  // 添加参与者
  const handleAddParticipant = useCallback((name: string) => {
    const newParticipant: Participant = {
      id: generateId(),
      name
    };
    setParticipants(prev => [...prev, newParticipant]);
  }, []);

  // 删除参与者
  const handleRemoveParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  // 批量添加
  const handleBatchAdd = useCallback((names: string[]) => {
    const newParticipants = names.map(name => ({
      id: generateId(),
      name
    }));
    setParticipants(prev => [...prev, ...newParticipants]);
  }, []);

  // 清空所有
  const handleClearAll = useCallback(() => {
    setParticipants([]);
    setWinnerRecords([]);
    setCurrentPrizeIndex(0);
  }, []);

  // 更新奖品配置
  const handleUpdatePrize = useCallback((prizeId: string, field: 'name' | 'count', value: string | number) => {
    setPrizes(prev => prev.map(p => 
      p.id === prizeId ? { ...p, [field]: value } : p
    ));
  }, []);

  // 重置抽奖进度
  const handleResetProgress = useCallback(() => {
    setCurrentPrizeIndex(0);
    setWinnerRecords([]);
    setWinners([]);
  }, []);

  // 开始抽奖 - 批量抽取当前奖项的所有名额
  const handleStartLottery = useCallback(() => {
    if (participants.length < 1 || allPrizesDrawn || !currentPrize) return;
    
    // 确保有足够的参与者
    const drawCount = Math.min(currentPrize.count, participants.length);
    if (drawCount < 1) return;
    
    setIsSpinning(true);
    setWinners([]);
    isProcessingRef.current = false;
  }, [participants.length, allPrizesDrawn, currentPrize]);

  // 抽奖完成 - 批量选择中奖者
  const handleSpinComplete = useCallback(() => {
    if (!currentPrize) return;
    
    // 计算本次抽取人数
    const drawCount = Math.min(currentPrize.count, participants.length);
    
    // 随机选择多个中奖者
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const selectedWinners = shuffled.slice(0, drawCount);
    
    setWinners(selectedWinners);
    setIsSpinning(false);
    
    // 延迟显示弹窗
    setTimeout(() => {
      setShowWinnerModal(true);
    }, 800);
  }, [participants, currentPrize]);

  // 确认并继续下一轮（只由弹窗关闭触发）
  const handleConfirmWinners = useCallback(async () => {
    // 防止重复处理
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    if (winners.length > 0 && currentPrize) {
      // 将所有中奖者加入记录
      const newRecords: WinnerRecord[] = winners.map(winner => ({
        participant: winner,
        prize: currentPrize,
        timestamp: Date.now()
      }));
      setWinnerRecords(prev => [...prev, ...newRecords]);
      
      // 保存到云端
      if (currentActivityId) {
        await saveWinnerRecords(newRecords);
      }
      
      // 从参与者中移除所有中奖者
      const winnerIds = new Set(winners.map(w => w.id));
      setParticipants(prev => prev.filter(p => !winnerIds.has(p.id)));
      
      // 进入下一个奖项
      setCurrentPrizeIndex(prev => prev + 1);
    }
    setWinners([]);
    setShowWinnerModal(false);
  }, [winners, currentPrize, currentActivityId, saveWinnerRecords]);

  // 保存到云端
  const handleSaveToCloud = useCallback(async () => {
    let activityId = currentActivityId;
    
    // 如果没有活动ID，先创建活动
    if (!activityId) {
      const newId = await createActivity('抽奖活动 ' + new Date().toLocaleDateString(), prizes);
      if (!newId) {
        alert('创建活动失败');
        return;
      }
      activityId = newId;
    }
    
    // 保存参与者
    await saveParticipants(participants);
    
    // 保存中奖记录
    if (winnerRecords.length > 0) {
      await saveWinnerRecords(winnerRecords);
    }
    
    alert('保存成功！');
  }, [currentActivityId, createActivity, prizes, saveParticipants, participants, saveWinnerRecords, winnerRecords]);

  // 从云端加载
  const handleLoadFromCloud = useCallback(async () => {
    if (!currentActivityId) {
      alert('请先保存活动到云端');
      return;
    }
    
    const loadedParticipants = await loadParticipants();
    if (loadedParticipants.length > 0) {
      setParticipants(loadedParticipants);
    }
    
    const loadedRecords = await loadWinnerRecords(prizes);
    if (loadedRecords.length > 0) {
      setWinnerRecords(loadedRecords);
      // 计算当前奖项索引
      const drawnPrizeIds = new Set(loadedRecords.map(r => r.prize.id));
      let newIndex = 0;
      for (let i = 0; i < prizes.length; i++) {
        const prizeRecords = loadedRecords.filter(r => r.prize.id === prizes[i].id);
        if (prizeRecords.length >= prizes[i].count) {
          newIndex = i + 1;
        } else if (prizeRecords.length > 0) {
          newIndex = i;
          break;
        }
      }
      setCurrentPrizeIndex(newIndex);
    }
    
    alert('加载成功！');
  }, [currentActivityId, loadParticipants, loadWinnerRecords, prizes]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050508]">
      {/* 3D 银河场景 */}
      <GalaxyScene
        participants={participants}
        isSpinning={isSpinning}
        winners={winners}
        onSpinComplete={handleSpinComplete}
      />
      
      {/* 暗角效果 */}
      <div className="vignette" />
      
      {/* 噪点纹理 */}
      <div className="noise-overlay" />
      
      {/* 顶部标题 */}
      <Header 
        title="GALAXY VORTEX"
        subtitle="Annual Gala Lucky Draw"
      />
      
      {/* 控制面板 */}
      <ControlPanel
        participants={participants}
        onAddParticipant={handleAddParticipant}
        onRemoveParticipant={handleRemoveParticipant}
        onBatchAdd={handleBatchAdd}
        onClearAll={handleClearAll}
        onStartLottery={handleStartLottery}
        isSpinning={isSpinning}
        winners={winners}
        onConfirmWinners={handleConfirmWinners}
        winnerRecords={winnerRecords}
        prizes={prizes}
        currentPrize={currentPrize}
        allPrizesDrawn={allPrizesDrawn}
        onUpdatePrize={handleUpdatePrize}
        onResetProgress={handleResetProgress}
        isSyncing={isSyncing}
        onSaveToCloud={handleSaveToCloud}
        onLoadFromCloud={handleLoadFromCloud}
      />
      
      {/* 中奖弹窗 - 支持多个中奖者 */}
      {showWinnerModal && winners.length > 0 && currentPrize && (
        <WinnerModal
          winners={winners}
          prize={currentPrize}
          onClose={handleConfirmWinners}
        />
      )}
      
      {/* 底部信息 */}
      <div className="fixed bottom-6 left-8 z-10 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
          <span className="text-[#B8C5D6]/40 text-xs tracking-wider uppercase">
            Live
          </span>
        </div>
        <div className="text-[#B8C5D6]/30 text-xs tracking-wide">
          Powered by Three.js + React + CloudBase
        </div>
      </div>
      
      {/* 装饰元素 - 左下角 */}
      <div className="fixed bottom-0 left-0 w-40 h-40 pointer-events-none">
        <div className="absolute bottom-8 left-8 w-16 h-px bg-gradient-to-r from-[#C9A227]/30 to-transparent" />
        <div className="absolute bottom-8 left-8 w-px h-16 bg-gradient-to-t from-[#C9A227]/30 to-transparent" />
      </div>
    </div>
  );
}
