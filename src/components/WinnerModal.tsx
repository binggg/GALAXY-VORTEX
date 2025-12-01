import { useEffect, useState } from 'react';

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

interface WinnerModalProps {
  winners: Participant[];  // 改为数组支持多个中奖者
  prize: Prize;
  onClose: () => void;
}

// 粒子组件
function Particle({ delay, color }: { delay: number; color: string }) {
  const [style, setStyle] = useState({});
  
  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 200;
    const duration = 1.5 + Math.random() * 1;
    
    setStyle({
      '--tx': `${Math.cos(angle) * distance}px`,
      '--ty': `${Math.sin(angle) * distance}px`,
      '--duration': `${duration}s`,
      '--delay': `${delay}s`,
      backgroundColor: color,
    } as React.CSSProperties);
  }, [delay, color]);
  
  return (
    <div 
      className="absolute w-2 h-2 rounded-full animate-particle"
      style={style}
    />
  );
}

export default function WinnerModal({ winners, prize, onClose }: WinnerModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // 延迟显示动画
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  // 生成粒子
  const particles = Array.from({ length: 60 }, (_, i) => (
    <Particle key={i} delay={i * 0.02} color={prize.color} />
  ));
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(10, 10, 18, 0.9) 0%, rgba(5, 5, 8, 0.98) 100%)',
          opacity: isVisible ? 1 : 0,
        }}
      />
      
      {/* 粒子效果 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {particles}
      </div>
      
      {/* 主内容 */}
      <div 
        className="relative z-10 text-center transition-all duration-700 cursor-pointer"
        style={{
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(30px)',
          opacity: isVisible ? 1 : 0,
        }}
        onClick={onClose}
      >
        {/* 光环效果 */}
        <div 
          className="absolute inset-0 -z-10 rounded-full blur-3xl animate-pulse"
          style={{
            background: `radial-gradient(circle, ${prize.color}40 0%, transparent 70%)`,
            transform: 'scale(3)',
          }}
        />
        
        {/* 奖项图标 */}
        <div 
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center animate-bounce-slow"
          style={{
            background: `linear-gradient(135deg, ${prize.color} 0%, ${prize.color}80 100%)`,
            boxShadow: `0 0 60px ${prize.color}60`,
          }}
        >
          <i className={`fas ${prize.icon} text-4xl text-[#0A0A12]`} />
        </div>
        
        {/* 恭喜文字 */}
        <div 
          className="text-lg tracking-[0.3em] mb-4 font-light"
          style={{ color: prize.color }}
        >
          CONGRATULATIONS
        </div>
        
        {/* 奖项名称 */}
        <div 
          className="text-2xl font-bold tracking-wider mb-6"
          style={{ color: prize.color }}
        >
          {prize.name}
        </div>
        
        {/* 中奖者名字 - 支持多个 */}
        <div className="space-y-3 mb-8">
          {winners.map((winner, index) => (
            <div
              key={winner.id}
              className="text-4xl md:text-5xl font-bold tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${prize.color} 0%, #FFD700 50%, ${prize.color} 100%)`,
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 2s ease-in-out infinite',
                animationDelay: `${index * 0.1}s`,
                textShadow: `0 0 40px ${prize.color}60`,
              }}
            >
              {winner.name}
            </div>
          ))}
        </div>
        
        {/* 中奖人数提示 */}
        {winners.length > 1 && (
          <div className="text-[#E8D5B7]/60 text-sm tracking-wider mb-6">
            {winners.length} WINNERS
          </div>
        )}
        
        {/* 装饰线 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${prize.color})` }} />
          <i className="fas fa-star text-sm" style={{ color: prize.color }} />
          <div className="w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${prize.color})` }} />
        </div>
        
        {/* 关闭提示 */}
        <div className="text-[#B8C5D6]/40 text-sm tracking-wider animate-pulse">
          CLICK ANYWHERE TO CONTINUE
        </div>
      </div>
      
      {/* 样式 */}
      <style>{`
        @keyframes particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
        
        .animate-particle {
          animation: particle var(--duration) ease-out var(--delay) forwards;
        }
        
        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
