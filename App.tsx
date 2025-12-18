
import React, { useState, useCallback, useEffect } from 'react';
import { GoldenParticleScene } from './components/GoldenParticleScene';
import { ShapeType, ChristmasBlessing } from './types';
import { generateBlessing } from './services/geminiService';
import { Sparkles, RefreshCw, Volume2, Info, Send } from 'lucide-react';

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.TREE);
  const [blessing, setBlessing] = useState<ChristmasBlessing | null>(null);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const shapes = Object.values(ShapeType);

  const handleNextShape = useCallback(async () => {
    setLoading(true);
    const currentIndex = shapes.indexOf(currentShape);
    const nextIndex = (currentIndex + 1) % shapes.length;
    const nextShape = shapes[nextIndex];
    
    setCurrentShape(nextShape);
    
    const newBlessing = await generateBlessing(nextShape);
    setBlessing(newBlessing);
    setLoading(false);
  }, [currentShape]);

  // Initial blessing
  useEffect(() => {
    const init = async () => {
      const b = await generateBlessing(ShapeType.TREE);
      setBlessing(b);
    };
    init();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden text-white font-sans selection:bg-yellow-500/30">
      {/* 3D Scene */}
      <GoldenParticleScene currentShape={currentShape} onInteract={handleNextShape} />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        
        {/* Top Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 animate-pulse">
              GOLDEN XMAS
            </h1>
            <p className="text-yellow-500/80 text-sm md:text-base font-medium tracking-widest mt-1">
              MAGICAL PARTICLE EXPERIENCE
            </p>
          </div>
          <button 
            onClick={() => setShowIntro(true)}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md"
          >
            <Info className="w-6 h-6 text-yellow-500" />
          </button>
        </header>

        {/* Center/Bottom Content */}
        <div className="flex flex-col items-center md:items-start gap-8 pointer-events-auto">
          {blessing && (
            <div className="max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-xs uppercase tracking-widest text-yellow-500/60 font-bold">New Blessing</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-yellow-100">{blessing.title}</h2>
              <p className="text-white/70 leading-relaxed italic">
                "{blessing.message}"
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleNextShape}
              disabled={loading}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full font-bold text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {loading ? 'TRANSFORMING...' : 'CHANGE SHAPE'}
            </button>
            
            <div className="hidden md:flex items-center gap-3 text-white/40 text-sm font-medium">
              <Volume2 className="w-4 h-4" />
              <span>Ambient Sound Enabled</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-end text-[10px] md:text-xs text-white/30 tracking-[0.2em] uppercase font-bold">
          <div>&copy; 2024 AI HOLIDAY MAGIC</div>
          <div className="flex gap-4">
            <span>Click on particles to transform</span>
            <span className="text-yellow-500/50">Gemini Powered</span>
          </div>
        </footer>
      </div>

      {/* Intro Modal */}
      {showIntro && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="max-w-lg w-full bg-[#111] border border-white/10 p-8 rounded-[2rem] shadow-2xl text-center">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tight">Welcome to the Golden Tree</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              Explore a world where light takes form. Touch the golden particles to watch them disperse and reform into magical holiday symbols. Each transformation brings a unique AI-crafted blessing.
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors"
            >
              Start Experience
            </button>
          </div>
        </div>
      )}

      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full"></div>
      </div>
    </div>
  );
};

export default App;
