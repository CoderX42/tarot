import { useTarotStore } from '@/store/useTarotStore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReadingUI() {
  const { readingState, question, selectedCards, reset } = useTarotStore();
  const navigate = useNavigate();

  const handleBack = () => {
    reset();
    navigate('/');
  };

  return (
    <>
      <div className="flex justify-between items-start pointer-events-auto">
        <button
          onClick={handleBack}
          className="p-2 rounded-full bg-slate-900/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors backdrop-blur-md border border-slate-700/50"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {question && (
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-2 max-w-sm text-center shadow-lg">
            <p className="text-sm text-slate-400">你的问题</p>
            <p className="text-slate-200 font-medium truncate">{question}</p>
          </div>
        )}
      </div>

      <div className="pointer-events-auto flex flex-col items-center mb-8">
        {readingState === 'shuffling' && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 flex items-center space-x-3 shadow-xl shadow-purple-900/20">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-purple-100 font-medium tracking-wide">正在洗牌中，请保持专注...</span>
          </div>
        )}

        {readingState === 'selecting' && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 shadow-xl shadow-indigo-900/20 text-center space-y-2">
            <p className="text-indigo-100 font-medium tracking-wide text-lg">请凭直觉抽取 3 张牌</p>
            <p className="text-indigo-300/80 text-sm">已选择 {selectedCards.length} / 3</p>
          </div>
        )}

        {readingState === 'interpreting' && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 flex items-center space-x-3 shadow-xl shadow-purple-900/20">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-purple-100 font-medium tracking-wide">正在解读命运的启示...</span>
          </div>
        )}

        {readingState === 'reading' && readingResult && (
          <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-3xl p-6 shadow-2xl shadow-purple-900/30 transition-all pointer-events-auto">
            <h3 className="text-xl font-serif text-purple-300 mb-4 text-center">命运的启示</h3>
            <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {readingResult.reading.map((r: any, idx: number) => (
                <div key={idx} className="border-b border-slate-700/50 pb-3 last:border-0">
                  <p className="font-semibold text-purple-200 mb-1">
                    {r.position}: {r.cardName} ({r.state})
                  </p>
                  <p className="text-xs text-slate-400 mb-2">关键词: {r.keywords.join(', ')}</p>
                  <p>{r.interpretation}</p>
                </div>
              ))}
              {readingResult.advice && (
                <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <p className="text-purple-200 italic">✨ {readingResult.advice}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={handleBack}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                结束本次占卜
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}