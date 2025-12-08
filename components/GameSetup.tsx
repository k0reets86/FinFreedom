
import React, { useState, useEffect } from 'react';
import { Users, Play, BookOpen, User, Bot, CheckCircle2, RefreshCw, Briefcase } from 'lucide-react';
import { GameDifficulty, Profession } from '../types';
import { BOT_NAMES, PROFESSIONS } from '../constants';

interface Props {
  onStartGame: (config: { names: string[], isHuman: boolean[], difficulty: GameDifficulty, professions: Profession[] }) => void;
}

const GameSetup: React.FC<Props> = ({ onStartGame }) => {
  const [phase, setPhase] = useState<'CONFIG' | 'REVEAL'>('CONFIG');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<{name: string, isHuman: boolean}[]>(
    Array(6).fill(null).map((_, i) => ({ 
      name: i === 0 ? 'Игрок 1' : '', 
      isHuman: i === 0 
    }))
  );
  const [difficulty, setDifficulty] = useState<GameDifficulty>(GameDifficulty.MEDIUM);
  const [showRules, setShowRules] = useState(false);
  const [assignedProfessions, setAssignedProfessions] = useState<Profession[]>([]);

  // Initial bot naming
  useEffect(() => {
     setPlayers(prev => prev.map((p, i) => {
         if (!p.isHuman && !p.name) {
             return { ...p, name: BOT_NAMES[i % BOT_NAMES.length] };
         }
         return p;
     }));
  }, []);

  const handleCountChange = (count: number) => {
    setPlayerCount(count);
  };

  const updatePlayer = (index: number, field: 'name' | 'isHuman', value: any) => {
    const newPlayers = [...players];
    
    if (field === 'isHuman') {
         newPlayers[index] = { ...newPlayers[index], isHuman: value };
         // Auto-name if switching to bot and name is empty or generic
         if (!value) {
             newPlayers[index].name = BOT_NAMES[index % BOT_NAMES.length];
         } else if (newPlayers[index].name === BOT_NAMES[index % BOT_NAMES.length]) {
             newPlayers[index].name = `Игрок ${index + 1}`;
         }
    } else {
        newPlayers[index] = { ...newPlayers[index], name: value };
    }
    
    setPlayers(newPlayers);
  };

  const startRevealPhase = () => {
    // Shuffle and assign professions
    const shuffled = [...PROFESSIONS].sort(() => 0.5 - Math.random());
    setAssignedProfessions(players.slice(0, playerCount).map((_, i) => shuffled[i % shuffled.length]));
    setPhase('REVEAL');
  };

  const handleFinalStart = () => {
    const activePlayers = players.slice(0, playerCount);
    const finalNames = activePlayers.map((p, i) => {
        return p.name.trim() || (p.isHuman ? `Игрок ${i + 1}` : BOT_NAMES[i % BOT_NAMES.length]);
    });
    const finalIsHuman = activePlayers.map(p => p.isHuman);
    
    onStartGame({
        names: finalNames,
        isHuman: finalIsHuman,
        difficulty,
        professions: assignedProfessions
    });
  };

  if (phase === 'REVEAL') {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
             <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                 <h2 className="text-3xl md:text-5xl font-black text-white mb-2">Ваши Роли</h2>
                 <p className="text-slate-400">Судьба распределила карты. Кто вы в этом мире?</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mb-10 px-4">
                 {players.slice(0, playerCount).map((p, i) => {
                     const prof = assignedProfessions[i];
                     const colorClass = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-cyan-500'][i];

                     return (
                         <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300 animate-in zoom-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 150}ms` }}>
                             <div className={`h-2 ${colorClass}`}></div>
                             <div className="p-6">
                                 <div className="flex items-center gap-3 mb-4">
                                     <div className={`w-10 h-10 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-lg`}>
                                         {p.name.charAt(0)}
                                     </div>
                                     <div>
                                         <div className="text-xs text-slate-400 font-bold uppercase">{p.isHuman ? 'Игрок' : 'Бот'}</div>
                                         <div className="font-bold text-slate-800">{p.name || `Игрок ${i+1}`}</div>
                                     </div>
                                 </div>
                                 
                                 <div className="border-t border-slate-100 pt-4 text-center">
                                     <div className="inline-block p-3 rounded-full bg-slate-100 mb-3 text-slate-600">
                                         <Briefcase className="w-8 h-8" />
                                     </div>
                                     <h3 className="text-2xl font-black text-slate-800 mb-1">{prof.title}</h3>
                                     <div className="text-emerald-600 font-mono font-bold text-lg mb-4">
                                         +${prof.salary.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">/мес</span>
                                     </div>

                                     <div className="grid grid-cols-2 gap-2 text-xs text-left bg-slate-50 p-3 rounded-lg">
                                         <div className="text-slate-500">Сбережения:</div>
                                         <div className="font-bold text-slate-800 text-right">${prof.savings.toLocaleString()}</div>
                                         <div className="text-slate-500">Ипотека:</div>
                                         <div className="font-bold text-slate-800 text-right">${prof.liabilities.homeMortgage.toLocaleString()}</div>
                                         <div className="text-slate-500">Кредиты:</div>
                                         <div className="font-bold text-slate-800 text-right">${(prof.liabilities.schoolLoans + prof.liabilities.carLoans + prof.liabilities.creditCards).toLocaleString()}</div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )
                 })}
             </div>

             <button 
                onClick={handleFinalStart}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-4 rounded-full font-black text-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all transform hover:scale-105 flex items-center gap-2 animate-bounce"
             >
                 <Play className="w-6 h-6 fill-current" />
                 ПОГНАЛИ!
             </button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4 font-sans">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden border border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in duration-500">
        
        {/* Left Panel - Hero & Rules */}
        <div className="md:w-5/12 bg-slate-900/80 backdrop-blur-xl p-8 text-white flex flex-col justify-between border-r border-white/5">
          <div>
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-2xl font-bold">F</span>
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight leading-none">FinFreedom</h1>
                    <p className="text-emerald-400 text-sm font-medium tracking-wide opacity-80">ПУТЬ К БОГАТСТВУ</p>
                </div>
             </div>
             
             <p className="text-slate-300 leading-relaxed mb-8 text-sm">
                Добро пожаловать в симулятор финансовой независимости. 
                Ваша задача — вырваться из "крысиных бегов", создав пассивный доход, превышающий расходы.
             </p>

             <button 
                onClick={() => setShowRules(!showRules)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all p-4 rounded-xl text-left"
             >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-400"/> Правила игры</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{showRules ? 'Скрыть' : 'Читать'}</span>
                </div>
                {showRules && (
                    <div className="text-xs text-slate-400 space-y-2 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-white/5 mt-2">
                        <p>1. <strong>Доход:</strong> Покупайте активы (бизнес, акции, недвижимость).</p>
                        <p>2. <strong>Победа:</strong> Когда Пассивный доход > Общих расходов.</p>
                        <p>3. <strong>Риск:</strong> Избегайте лишних трат и банкротства.</p>
                    </div>
                )}
             </button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end">
             <div className="text-xs text-slate-500">
                <p>AI Powered • v3.1</p>
             </div>
          </div>
        </div>

        {/* Right Panel - Configuration */}
        <div className="md:w-7/12 bg-white/90 backdrop-blur-2xl p-8 flex flex-col h-[700px] md:h-auto overflow-y-auto">
           <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-600" />
                Настройка игры
           </h2>

           {/* Difficulty Selector */}
           <div className="mb-8">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Уровень сложности</label>
               <div className="grid grid-cols-3 gap-3">
                   {([
                       { id: GameDifficulty.EASY, label: 'Легкий', sub: 'Бонус $2000' },
                       { id: GameDifficulty.MEDIUM, label: 'Норма', sub: 'Стандарт' },
                       { id: GameDifficulty.HARD, label: 'Сложный', sub: 'Штрафы' }
                   ] as const).map((d) => (
                       <button
                           key={d.id}
                           onClick={() => setDifficulty(d.id)}
                           className={`
                                relative p-3 rounded-xl border text-left transition-all group
                                ${difficulty === d.id 
                                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' 
                                    : 'border-slate-200 hover:border-slate-300 bg-white'}
                           `}
                       >
                           {difficulty === d.id && <div className="absolute top-2 right-2 text-emerald-500"><CheckCircle2 className="w-4 h-4"/></div>}
                           <div className={`font-bold text-sm ${difficulty === d.id ? 'text-emerald-900' : 'text-slate-700'}`}>{d.label}</div>
                           <div className="text-[10px] text-slate-400">{d.sub}</div>
                       </button>
                   ))}
               </div>
           </div>

           {/* Player Count */}
           <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Количество игроков</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                        <button
                            key={num}
                            onClick={() => handleCountChange(num)}
                            className={`
                                flex-1 h-10 rounded-lg font-bold text-sm transition-all
                                ${playerCount === num 
                                    ? 'bg-slate-800 text-white shadow-lg scale-105' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                            `}
                        >
                            {num}
                        </button>
                    ))}
                </div>
           </div>

           {/* Players List - Scrollable area */}
           <div className="flex-1 overflow-y-auto pr-1 -mr-2 mb-6 space-y-3 custom-scrollbar min-h-[200px]">
                {players.slice(0, playerCount).map((p, idx) => (
                    <div key={idx} className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-300 transition-colors shadow-sm">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md
                            ${['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-cyan-500'][idx]}
                        `}>
                            {idx + 1}
                        </div>
                        
                        <div className="flex-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                                {p.isHuman ? 'Имя игрока' : 'Имя бота'}
                            </label>
                            <input 
                                type="text" 
                                value={p.name}
                                onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                                className="w-full text-sm font-bold text-slate-800 focus:outline-none bg-transparent placeholder-slate-300"
                                placeholder="Введите имя..."
                            />
                        </div>

                        <button 
                            onClick={() => updatePlayer(idx, 'isHuman', !p.isHuman)}
                            className={`
                                px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all
                                ${p.isHuman 
                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                    : 'bg-slate-800 text-emerald-400 shadow-lg shadow-emerald-500/10'}
                            `}
                        >
                            {p.isHuman ? <User className="w-3 h-3"/> : <Bot className="w-3 h-3"/>}
                            {p.isHuman ? 'Человек' : 'Бот'}
                        </button>
                    </div>
                ))}
           </div>

           <button 
                onClick={startRevealPhase}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
           >
               <Play className="w-5 h-5 fill-current" />
               Раздать Роли
           </button>

        </div>
      </div>
    </div>
  );
};

export default GameSetup;
