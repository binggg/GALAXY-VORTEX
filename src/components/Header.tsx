interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ 
  title = "GALAXY VORTEX", 
  subtitle = "Annual Gala Lucky Draw" 
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 pointer-events-none">
      {/* 顶部渐变遮罩 */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#050508] via-[#050508]/50 to-transparent" />
      
      <div className="relative p-8 flex items-start justify-between">
        {/* 左侧标题 - 非对称布局 */}
        <div className="pointer-events-auto relative">
          {/* 装饰线 */}
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#C9A227] via-[#E8D5B7] to-transparent" />
          <div className="absolute -left-8 top-0 w-px h-2/3 bg-[#C9A227]/30" />
          
          <h1 className="font-display text-4xl md:text-5xl text-[#C9A227] glow-gold tracking-[0.2em] leading-none">
            {title}
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-12 h-px bg-gradient-to-r from-[#C9A227] to-transparent" />
            <p className="text-[#E8D5B7] text-sm md:text-base tracking-[0.15em] font-light uppercase">
              {subtitle}
            </p>
          </div>
          
          {/* 装饰角 */}
          <div className="absolute -bottom-4 left-0 w-8 h-8 border-l border-b border-[#C9A227]/30" />
        </div>
        
        {/* 右侧操作提示 - 对角线布局 */}
        <div className="hidden md:flex flex-col items-end gap-3 pointer-events-auto mt-2">
          <div className="flex items-center gap-3 text-[#B8C5D6]/60 text-xs tracking-wider">
            <span className="uppercase">Drag to Rotate</span>
            <div className="w-6 h-6 border border-[#C9A227]/30 flex items-center justify-center">
              <i className="fas fa-arrows-alt text-[#C9A227]/60 text-[10px]"></i>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#B8C5D6]/60 text-xs tracking-wider">
            <span className="uppercase">Scroll to Zoom</span>
            <div className="w-6 h-6 border border-[#C9A227]/30 flex items-center justify-center">
              <i className="fas fa-search-plus text-[#C9A227]/60 text-[10px]"></i>
            </div>
          </div>
        </div>
      </div>
      
      {/* 装饰线条 */}
      <div className="absolute left-8 right-8 bottom-0 h-px">
        <div className="w-full h-full bg-gradient-to-r from-[#C9A227]/50 via-transparent to-transparent" />
      </div>
    </header>
  );
}
