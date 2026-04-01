import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTarotStore } from '@/store/useTarotStore';

export default function Home() {
  const navigate = useNavigate();
  const [question, setLocalQuestion] = useState('');
  const { setQuestion } = useTarotStore();

  const handleStart = () => {
    if (question.trim().length < 5) {
      alert('请输入至少5个字的问题，以便塔罗牌能更好地为您解答。');
      return;
    }
    setQuestion(question);
    navigate('/reading');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center space-y-8">
        <div className="text-center space-y-4">
          <Sparkles className="w-16 h-16 mx-auto text-purple-400 mb-6" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            3D 塔罗占卜
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            在心中默念你的问题，与神秘的塔罗牌建立连结
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-2">
            <label htmlFor="question" className="block text-sm font-medium text-slate-300">
              你心中的困惑是什么？
            </label>
            <textarea
              id="question"
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
              placeholder="例如：我最近在事业上的发展会有突破吗？"
              value={question}
              onChange={(e) => setLocalQuestion(e.target.value)}
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <span>开始洗牌</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-xs text-slate-500 text-center max-w-xs">
          请保持环境安静，深呼吸，集中注意力于你的问题上
        </div>
      </div>
    </div>
  );
}