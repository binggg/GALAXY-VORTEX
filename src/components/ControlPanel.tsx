import { useState } from 'react';

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

interface ControlPanelProps {
  participants: Participant[];
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: string) => void;
  onBatchAdd: (names: string[]) => void;
  onClearAll: () => void;
  onStartLottery: () => void;
  isSpinning: boolean;
  winners: Participant[];
  onConfirmWinners: () => void;
  winnerRecords: WinnerRecord[];
  prizes: Prize[];
  currentPrize: Prize | null;
  allPrizesDrawn: boolean;
  onUpdatePrize: (prizeId: string, field: 'name' | 'count', value: string | number) => void;
  onResetProgress: () => void;
  isSyncing?: boolean;
  onSaveToCloud?: () => void;
  onLoadFromCloud?: () => void;
}

export default function ControlPanel({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onBatchAdd,
  onClearAll,
  onStartLottery,
  isSpinning,
  winners,
  onConfirmWinners,
  winnerRecords,
  prizes,
  currentPrize,
  allPrizesDrawn,
  onUpdatePrize,
  onResetProgress,
  isSyncing = false,
  onSaveToCloud,
  onLoadFromCloud,
}: ControlPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'participants' | 'winners' | 'prizes'>('participants');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // 检查是否包含分隔符（逗号、换行）
    if (trimmed.includes(',') || trimmed.includes('\n')) {
      const names = trimmed
        .split(/[,\n]/)
        .map(n => n.trim())
        .filter(n => n.length > 0);
      onBatchAdd(names);
    } else {
      onAddParticipant(trimmed);
    }
    setInputValue('');
  };

  // 按奖项分组中奖记录
  const groupedRecords = prizes.map(prize => ({
    prize,
    records: winnerRecords.filter(r => r.prize.id === prize.id)
  }));

  // 计算当前奖项剩余抽取数量
  const remainingForCurrentPrize = currentPrize ? currentPrize.count : 0;

  return (
    <div 
      className="fixed right-6 top-1/2 -translate-y-1/2 z-20"
      style={{ 
        width: isExpanded ? '340px' : '56px',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* 玻璃面板 */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: isExpanded 
            ? 'linear-gradient(135deg, rgba(10, 10, 18, 0.92) 0%, rgba(30, 58, 95, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(10, 10, 18, 0.95) 0%, rgba(30, 58, 95, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201, 162, 39, 0.3)',
          clipPath: isExpanded 
            ? 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)'
            : 'none',
          borderRadius: isExpanded ? '4px' : '28px',
          minHeight: isExpanded ? 'auto' : '56px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* 角落装饰 */}
        {isExpanded && (
          <>
            <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#C9A227] to-transparent" />
              <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-[#C9A227] to-transparent" />
            </div>
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
              <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-[#C9A227] to-transparent" />
              <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-[#C9A227] to-transparent" />
            </div>
          </>
        )}
        
        {/* 折叠按钮 - 收起时居中显示 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${isExpanded ? 'absolute top-4 left-4' : 'w-full h-14 flex items-center justify-center'} transition-all duration-300 z-10`}
          style={{
            background: isExpanded ? 'rgba(201, 162, 39, 0.15)' : 'transparent',
            border: isExpanded ? '1px solid rgba(201, 162, 39, 0.3)' : 'none',
            borderRadius: isExpanded ? '50%' : '0',
            width: isExpanded ? '32px' : '100%',
            height: isExpanded ? '32px' : '56px',
          }}
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-right' : 'fa-bars'} text-[#C9A227] ${isExpanded ? 'text-xs' : 'text-lg'}`} />
        </button>

        {isExpanded && (
          <div className="p-6 pt-16">
            {/* 同步状态指示器 */}
            {isSyncing && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <i className="fas fa-sync-alt fa-spin text-[#C9A227] text-xs" />
                <span className="text-[#C9A227] text-xs">同步中...</span>
              </div>
            )}

            {/* 云同步按钮 */}
            {(onSaveToCloud || onLoadFromCloud) && (
              <div className="flex gap-2 mb-4">
                {onSaveToCloud && (
                  <button
                    onClick={onSaveToCloud}
                    disabled={isSyncing}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: 'rgba(201, 162, 39, 0.1)',
                      border: '1px solid rgba(201, 162, 39, 0.3)',
                      color: '#C9A227',
                    }}
                  >
                    <i className="fas fa-cloud-upload-alt" />
                    保存到云端
                  </button>
                )}
                {onLoadFromCloud && (
                  <button
                    onClick={onLoadFromCloud}
                    disabled={isSyncing}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: 'rgba(201, 162, 39, 0.1)',
                      border: '1px solid rgba(201, 162, 39, 0.3)',
                      color: '#C9A227',
                    }}
                  >
                    <i className="fas fa-cloud-download-alt" />
                    从云端加载
                  </button>
                )}
              </div>
            )}

            {/* 奖品进度 */}
            {currentPrize && !allPrizesDrawn && (
              <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(201, 162, 39, 0.1)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${currentPrize.icon}`} style={{ color: currentPrize.color }} />
                    <span className="text-[#E8D5B7] font-medium tracking-wide">{currentPrize.name}</span>
                  </div>
                  <span className="text-[#C9A227] text-sm">
                    {remainingForCurrentPrize} 名
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(201, 162, 39, 0.2)' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: '0%',
                      background: `linear-gradient(90deg, ${currentPrize.color}, #FFD700)`,
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-[#B8C5D6]/50 tracking-wide">
                  本轮将抽取 {Math.min(remainingForCurrentPrize, participants.length)} 名中奖者
                </div>
              </div>
            )}

            {allPrizesDrawn && (
              <div className="mb-6 p-4 rounded-lg text-center" style={{ background: 'rgba(201, 162, 39, 0.15)' }}>
                <i className="fas fa-check-circle text-[#C9A227] text-2xl mb-2" />
                <div className="text-[#E8D5B7] font-medium tracking-wide">ALL PRIZES DRAWN</div>
                <div className="text-[#B8C5D6]/50 text-xs mt-1">所有奖项已抽取完毕</div>
              </div>
            )}

            {/* Tab 切换 */}
            <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(10, 10, 18, 0.5)' }}>
              {[
                { key: 'participants', label: 'POOL', icon: 'fa-users' },
                { key: 'winners', label: 'WINNERS', icon: 'fa-trophy' },
                { key: 'prizes', label: 'PRIZES', icon: 'fa-gift' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'participants' | 'winners' | 'prizes')}
                  className={`flex-1 py-2 px-2 rounded-md text-xs font-medium tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    activeTab === tab.key 
                      ? 'text-[#0A0A12]' 
                      : 'text-[#B8C5D6]/60 hover:text-[#E8D5B7]'
                  }`}
                  style={{
                    background: activeTab === tab.key 
                      ? 'linear-gradient(135deg, #C9A227 0%, #E8D5B7 100%)'
                      : 'transparent'
                  }}
                >
                  <i className={`fas ${tab.icon} text-[10px]`} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 参与者列表 Tab */}
            {activeTab === 'participants' && (
              <>
                {/* 输入表单 */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Add name (comma for batch)"
                      className="w-full px-4 py-3 rounded-lg text-sm text-[#E8D5B7] placeholder-[#B8C5D6]/30 outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(10, 10, 18, 0.6)',
                        border: '1px solid rgba(201, 162, 39, 0.2)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(201, 162, 39, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(201, 162, 39, 0.2)';
                      }}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #C9A227 0%, #8B6914 100%)',
                      }}
                    >
                      <i className="fas fa-plus text-[#0A0A12] text-xs" />
                    </button>
                  </div>
                </form>

                {/* 参与者列表 */}
                <div 
                  className="space-y-1.5 max-h-48 overflow-y-auto pr-2 mb-4"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(201, 162, 39, 0.3) transparent'
                  }}
                >
                  {participants.length === 0 ? (
                    <div className="text-center py-8 text-[#B8C5D6]/40 text-sm">
                      <i className="fas fa-user-plus text-2xl mb-2 block" />
                      No participants yet
                    </div>
                  ) : (
                    participants.map((p, index) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg group transition-all duration-200"
                        style={{
                          background: 'rgba(201, 162, 39, 0.05)',
                          border: '1px solid rgba(201, 162, 39, 0.1)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#C9A227]/50 text-xs font-mono w-5">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[#E8D5B7] text-sm">{p.name}</span>
                        </div>
                        <button
                          onClick={() => onRemoveParticipant(p.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded transition-all duration-200 hover:bg-red-500/20"
                        >
                          <i className="fas fa-times text-red-400/70 text-xs" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* 统计和清空 */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="text-[#B8C5D6]/50">
                    Total: <span className="text-[#C9A227]">{participants.length}</span>
                  </span>
                  {participants.length > 0 && (
                    <button
                      onClick={onClearAll}
                      className="text-red-400/60 hover:text-red-400 transition-colors"
                    >
                      <i className="fas fa-trash-alt mr-1" />
                      Clear all
                    </button>
                  )}
                </div>
              </>
            )}

            {/* 中奖记录 Tab */}
            {activeTab === 'winners' && (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {winnerRecords.length === 0 ? (
                  <div className="text-center py-8 text-[#B8C5D6]/40 text-sm">
                    <i className="fas fa-trophy text-2xl mb-2 block" />
                    No winners yet
                  </div>
                ) : (
                  groupedRecords.map(({ prize, records }) => (
                    records.length > 0 && (
                      <div key={prize.id} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <i className={`fas ${prize.icon}`} style={{ color: prize.color }} />
                          <span style={{ color: prize.color }} className="font-medium tracking-wide">
                            {prize.name}
                          </span>
                          <span className="text-[#B8C5D6]/40">({records.length})</span>
                        </div>
                        <div className="space-y-1 pl-4">
                          {records.map((record, idx) => (
                            <div
                              key={`${record.participant.id}-${idx}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              style={{
                                background: 'rgba(201, 162, 39, 0.08)',
                                borderLeft: `2px solid ${prize.color}`,
                              }}
                            >
                              <i className="fas fa-star text-[#FFD700] text-xs" />
                              <span className="text-[#E8D5B7] text-sm">{record.participant.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))
                )}
                
                {winnerRecords.length > 0 && (
                  <button
                    onClick={onResetProgress}
                    className="w-full py-2 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    <i className="fas fa-redo mr-1" />
                    Reset Progress
                  </button>
                )}
              </div>
            )}

            {/* 奖品配置 Tab */}
            {activeTab === 'prizes' && (
              <div className="space-y-3">
                {prizes.map((prize, index) => (
                  <div 
                    key={prize.id}
                    className="p-3 rounded-lg"
                    style={{
                      background: 'rgba(201, 162, 39, 0.08)',
                      border: `1px solid ${currentPrize?.id === prize.id ? prize.color : 'rgba(201, 162, 39, 0.15)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${prize.color}20` }}
                      >
                        <i className={`fas ${prize.icon} text-lg`} style={{ color: prize.color }} />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={prize.name}
                          onChange={(e) => onUpdatePrize(prize.id, 'name', e.target.value)}
                          className="w-full bg-transparent text-[#E8D5B7] text-sm font-medium outline-none"
                          style={{ borderBottom: '1px solid rgba(201, 162, 39, 0.2)' }}
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#B8C5D6]/50 text-xs">Count:</span>
                          <input
                            type="number"
                            min="1"
                            value={prize.count}
                            onChange={(e) => onUpdatePrize(prize.id, 'count', parseInt(e.target.value) || 1)}
                            className="w-12 bg-transparent text-[#C9A227] text-sm outline-none text-center"
                            style={{ borderBottom: '1px solid rgba(201, 162, 39, 0.2)' }}
                          />
                        </div>
                      </div>
                      {currentPrize?.id === prize.id && (
                        <div className="px-2 py-1 rounded text-xs text-[#0A0A12] font-medium" style={{ background: prize.color }}>
                          NOW
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="text-xs text-[#B8C5D6]/40 text-center pt-2">
                  Prizes are drawn from top to bottom (lowest to highest)
                </div>
              </div>
            )}

            {/* 抽奖按钮 */}
            <button
              onClick={winners.length > 0 ? onConfirmWinners : onStartLottery}
              disabled={isSpinning || (participants.length < 1 && winners.length === 0) || (allPrizesDrawn && winners.length === 0)}
              className="w-full py-4 rounded-lg font-medium tracking-widest text-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: winners.length > 0
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : isSpinning 
                    ? 'linear-gradient(135deg, #8B6914 0%, #5C4610 100%)'
                    : 'linear-gradient(135deg, #C9A227 0%, #8B6914 100%)',
                boxShadow: !isSpinning && winners.length === 0
                  ? '0 4px 20px rgba(201, 162, 39, 0.3)'
                  : 'none',
              }}
            >
              <span className="relative z-10 text-[#0A0A12]">
                {winners.length > 0 ? (
                  <>
                    <i className="fas fa-check mr-2" />
                    CONFIRM & NEXT
                  </>
                ) : isSpinning ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" />
                    DRAWING...
                  </>
                ) : allPrizesDrawn ? (
                  <>
                    <i className="fas fa-flag-checkered mr-2" />
                    COMPLETED
                  </>
                ) : (
                  <>
                    <i className="fas fa-play mr-2" />
                    START DRAW ({currentPrize?.count || 0})
                  </>
                )}
              </span>
              {!isSpinning && winners.length === 0 && !allPrizesDrawn && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #E8D5B7 0%, #C9A227 100%)',
                  }}
                />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
