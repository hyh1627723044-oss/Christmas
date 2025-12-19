
import React, { useState, useCallback, useEffect } from 'react';
import { GoldenParticleScene } from './components/GoldenParticleScene';
import { ShapeType, ChristmasBlessing } from './types';
import { generateBlessing } from './services/geminiService';
import { Sparkles, RefreshCw, Trophy, Info, Star, ShieldCheck, Settings, X, ChevronUp } from 'lucide-react';

// 定义每个形状出现的权重 (总和不需要为100，逻辑会自动计算比例)
const SHAPE_WEIGHTS: Record<ShapeType, number> = {
  [ShapeType.DIAMOND]: 5,    // 非洲之心：5% 极稀有
  [ShapeType.MAGAZINE]: 25,  // 纪念杂志：25% 
  [ShapeType.TREE]: 30,      // 圣诞树：30%
  [ShapeType.BELL]: 20,      // 铃铛：20%
  [ShapeType.FIREWORK]: 20,  // 烟花：20%
};

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.TREE);
  const [blessing, setBlessing] = useState<ChristmasBlessing | null>(null);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isRareDrop, setIsRareDrop] = useState(false);
  const [isTestMenuOpen, setIsTestMenuOpen] = useState(false);

  // 加权随机算法
  const getRandomShape = useCallback((excludeShape: ShapeType): ShapeType => {
    const entries = Object.entries(SHAPE_WEIGHTS) as [ShapeType, number][];
    // 为了让用户觉得每次都有变化，过滤掉当前形状
    const availableEntries = entries.filter(([shape]) => shape !== excludeShape);
    const totalWeight = availableEntries.reduce((sum, [_, weight]) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    for (const [shape, weight] of availableEntries) {
      if (random < weight) return shape;
      random -= weight;
    }
    return availableEntries[0][0];
  }, []);

  const triggerShapeTransition = useCallback(async (nextShape: ShapeType) => {
    if (loading) return;
    setLoading(true);
    
    const isDiamond = nextShape === ShapeType.DIAMOND;
    setCurrentShape(nextShape);
    setIsRareDrop(isDiamond);
    
    const newBlessing = await generateBlessing(nextShape);
    setBlessing(newBlessing);
    setLoading(false);
  }, [loading]);

  const handleNextShape = useCallback(() => {
    const nextShape = getRandomShape(currentShape);
    triggerShapeTransition(nextShape);
  }, [currentShape, getRandomShape, triggerShapeTransition]);

  const handleDirectSelect = (shape: ShapeType) => {
    triggerShapeTransition(shape);
    setIsTestMenuOpen(false);
  };

  useEffect(() => {
    const init = async () => {
      const b = await generateBlessing(ShapeType.TREE);
      setBlessing(b);
    };
    init();
  }, []);

  return (
    <div className={`relative w-full h-screen overflow-hidden text-white font-sans transition-colors duration-1000 ${isRareDrop ? 'bg-yellow-900/10' : 'bg-[#050505]'}`}>
      <GoldenParticleScene currentShape={currentShape} onInteract={handleNextShape} />

      {/* 顶部装饰线：如果是钻石则显示金色发光 */}
      <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-1000 ${isRareDrop ? 'bg-yellow-500 shadow-[0_0_20px_#eab308]' : 'bg-white/5'}`} />

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        <header className="flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-100 animate-pulse">
                DELTA XMAS
              </h1>
              {isRareDrop && (
                <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-black rounded animate-bounce">RARE</span>
              )}
            </div>
            <p className="text-yellow-500/60 text-[10px] md:text-xs font-bold tracking-[0.3em] mt-1 uppercase">
              Secure the African Heart Reward
            </p>
          </div>
          <button 
            onClick={() => setShowIntro(true)}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md"
          >
            <Info className="w-6 h-6 text-yellow-500" />
          </button>
        </header>

        <div className="flex flex-col items-center md:items-start gap-8 pointer-events-auto">
          {blessing && (
            <div className={`max-w-md backdrop-blur-2xl border p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-1000 animate-in fade-in slide-in-from-bottom-8 ${isRareDrop ? 'bg-yellow-500/10 border-yellow-500/40 ring-1 ring-yellow-500/20' : 'bg-black/60 border-white/10'}`}>
              <div className="flex items-center gap-2 mb-4">
                {currentShape === ShapeType.DIAMOND ? (
                    <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                ) : currentShape === ShapeType.MAGAZINE ? (
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                ) : (
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                )}
                <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${isRareDrop ? 'text-yellow-400' : 'text-yellow-500/60'}`}>
                  {currentShape === ShapeType.DIAMOND ? 'Legendary Reward Dropped' : 'Standard Mission Reward'}
                </span>
              </div>
              <h2 className="text-3xl font-black mb-3 text-white tracking-tight leading-none">{blessing.title}</h2>
              <p className="text-white/80 leading-relaxed font-medium italic text-lg">
                "{blessing.message}"
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleNextShape}
              disabled={loading}
              className={`group relative flex items-center gap-4 px-10 py-5 rounded-full font-black text-sm tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-2xl ${isRareDrop ? 'bg-yellow-500 text-black hover:bg-white' : 'bg-white text-black hover:bg-yellow-400'}`}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              {loading ? 'ANALYZING INTEL...' : 'IDENTIFY NEXT REWARD'}
            </button>
          </div>
        </div>

        <footer className="flex justify-between items-end text-[10px] md:text-xs text-white/20 tracking-[0.3em] uppercase font-black">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            OPERATOR // ACTIVE_STATUS
          </div>
          <div className="flex gap-6 pointer-events-auto">
            <span className="text-yellow-500/40">Drop Rate: Diamond (5%)</span>
            <div className="relative">
              {isTestMenuOpen && (
                <div className="absolute bottom-full right-0 mb-4 flex flex-col gap-2 min-w-[160px] animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {Object.values(ShapeType).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => handleDirectSelect(shape)}
                      className={`px-4 py-3 rounded-xl border text-left text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-between group ${currentShape === shape ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black/80 text-white/60 border-white/10 hover:border-yellow-500/50 hover:text-white'}`}
                    >
                      {shape}
                      {currentShape === shape && <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
                    </button>
                  ))}
                </div>
              )}
              <button 
                onClick={() => setIsTestMenuOpen(!isTestMenuOpen)}
                className={`flex items-center gap-2 transition-all font-black uppercase tracking-widest py-1 px-3 rounded-lg border ${isTestMenuOpen ? 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10' : 'text-white/20 hover:text-yellow-500 border-transparent'}`}
              >
                {isTestMenuOpen ? <X className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                DEBUG MENU
              </button>
            </div>
          </div>
        </footer>
      </div>

      {showIntro && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-700">
          <div className="max-w-xl w-full bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] shadow-2xl text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-yellow-600 to-yellow-200 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Trophy className="w-12 h-12 text-black -rotate-12" />
            </div>
            <h2 className="text-4xl font-black mb-4 text-white uppercase tracking-tighter">Delta Xmas Mission</h2>
            <p className="text-white/40 mb-10 leading-relaxed text-lg font-medium">
              欢迎，干员。这是一场基于概率的节日物资识别任务。你有 <span className="text-yellow-500 font-bold">5%</span> 的机会识别出终极奖励 <span className="text-yellow-500 underline decoration-double">非洲之心</span>。
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl hover:shadow-yellow-500/20"
            >
              Start Identification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
