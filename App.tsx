import React, { useState, useEffect, useRef } from 'react';
import { PlayerState, CardType, GameCard, SpaceType, Asset, GameDifficulty, BoardSpace, GameLogEntry, Profession, Liability } from './types';
import { INITIAL_PLAYER_TEMPLATE, BOARD_SPACES, LIVING_EXPENSES_BASE, CHILD_EXPENSE, DIFFICULTY_SETTINGS, PLAYER_COLORS_HEX } from './constants';
import FinancialStatement from './components/FinancialStatement';
import GameBoard from './components/GameBoard';
import EventModal from './components/EventModal';
import GameSetup from './components/GameSetup';
import { generateCardWithGemini } from './services/geminiService';
import { Dices, Trophy, RotateCcw, DollarSign, Bot, Activity } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState<'SETUP' | 'GAME'>('SETUP');
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [viewingPlayerIndex, setViewingPlayerIndex] = useState(0); 
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  
  const [activeCard, setActiveCard] = useState<GameCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [turnCompleted, setTurnCompleted] = useState(false);
  
  // AI visual state
  const [aiDecision, setAiDecision] = useState<'BUY' | 'PASS' | null>(null);
  
  const aiTurnInProgress = useRef(false);

  const currentPlayer = players[currentPlayerIndex] || { ...INITIAL_PLAYER_TEMPLATE, name: '', id: '', profession: '', cash: 0, salary: 0 };
  const viewingPlayer = players[viewingPlayerIndex] || currentPlayer;

  useEffect(() => {
    if (phase === 'GAME') {
        setViewingPlayerIndex(currentPlayerIndex);
    }
  }, [currentPlayerIndex, phase]);

  // --- Logic: Game Log ---
  const addLog = (message: string, type: 'INFO' | 'SUCCESS' | 'DANGER' | 'NEUTRAL' = 'NEUTRAL') => {
      setGameLog(prev => [{
          id: Date.now().toString() + Math.random(),
          playerId: players[currentPlayerIndex]?.id,
          playerName: players[currentPlayerIndex]?.name,
          message,
          type,
          timestamp: Date.now()
      }, ...prev.slice(0, 15)]);
  };

  // --- Logic: Recalculate Finances ---
  useEffect(() => {
    if (players.length === 0) return;

    setPlayers(prevPlayers => prevPlayers.map(p => {
      const passiveIncome = p.assets.reduce((sum, a) => sum + a.cashflow, 0);
      const liabExpense = p.liabilities.reduce((sum, l) => sum + l.expense, 0);
      const childCost = p.children * CHILD_EXPENSE;
      
      // Basic taxes/expenses approximation based on salary if no explicit formula
      const taxesAndOther = p.salary * 0.2; 
      const totalExpenses = Math.floor(taxesAndOther + liabExpense + childCost);
      const payday = (p.salary + passiveIncome) - totalExpenses;

      return {
        ...p,
        passiveIncome,
        totalExpenses,
        payday
      };
    }));
  }, [JSON.stringify(players.map(p => ({ a: p.assets, l: p.liabilities, c: p.children, s: p.salary })))]);

  // --- Logic: AI Turn & Watchdog ---
  useEffect(() => {
    // 1. Trigger AI turn start
    if (phase === 'GAME' && !currentPlayer.isHuman && !aiTurnInProgress.current && !turnCompleted) {
        startAiTurn();
    }
  }, [currentPlayerIndex, phase, turnCompleted, currentPlayer.isHuman]);

  // 2. Watchdog for stuck AI turns (e.g. modal didn't close)
  useEffect(() => {
    let watchdog: ReturnType<typeof setTimeout>;
    
    // STRICT CHECK: Only run watchdog if current player is NOT human
    if (isModalOpen && !currentPlayer.isHuman) {
        watchdog = setTimeout(() => {
            console.warn("AI Turn watchdog triggered - forcing next turn");
            addLog("Бот задумался, идем дальше.", "NEUTRAL");
            closeModal();
        }, 10000); // 10 seconds max for AI to interact with modal
    }
    return () => {
        if (watchdog) clearTimeout(watchdog);
    };
  }, [isModalOpen, currentPlayerIndex, currentPlayer.isHuman]);

  const startAiTurn = async () => {
    if (aiTurnInProgress.current) return;
    aiTurnInProgress.current = true;

    try {
        // Simulate thinking before roll
        await new Promise(r => setTimeout(r, 1500));
        
        // Check if turn already completed (race condition)
        if (!turnCompleted) { 
            await handleRollDice(true); 
        }
    } catch (e) {
        console.error("AI Turn Error", e);
        closeModal();
    }
  };

  const handleStartGame = (config: { names: string[], isHuman: boolean[], difficulty: GameDifficulty, professions: Profession[] }) => {
    const settings = DIFFICULTY_SETTINGS[config.difficulty];
    
    const newPlayers: PlayerState[] = config.names.map((name, index) => {
      const prof = config.professions[index];
      
      // Convert profession liabilities to player liabilities
      const liabilities: Liability[] = [
        { id: 'mortgage', name: 'Ипотека', value: prof.liabilities.homeMortgage, expense: Math.floor(prof.liabilities.homeMortgage * 0.007) },
        { id: 'school', name: 'Учеба', value: prof.liabilities.schoolLoans, expense: Math.floor(prof.liabilities.schoolLoans * 0.005) },
        { id: 'car', name: 'Авто', value: prof.liabilities.carLoans, expense: Math.floor(prof.liabilities.carLoans * 0.02) },
        { id: 'cc', name: 'Кредитки', value: prof.liabilities.creditCards, expense: Math.floor(prof.liabilities.creditCards * 0.03) },
        { id: 'retail', name: 'Магазины', value: prof.liabilities.retailDebt, expense: Math.floor(prof.liabilities.retailDebt * 0.05) },
      ].filter(l => l.value > 0);

      return {
        ...INITIAL_PLAYER_TEMPLATE,
        id: `p_${index}`,
        name,
        isHuman: config.isHuman[index],
        profession: prof.title,
        salary: prof.salary + settings.salaryBonus,
        cash: prof.savings + settings.startCashBonus,
        assets: [],
        liabilities: liabilities
      };
    });

    setPlayers(newPlayers);
    setPhase('GAME');
    setCurrentPlayerIndex(0);
    setViewingPlayerIndex(0);
    setDiceResult(null);
    setTurnCompleted(false);
    setGameLog([]);
    addLog("Игра началась! Удачи в крысиных бегах.", "INFO");
  };

  const handleRollDice = async (isAi = false) => {
    if ((!isAi && !currentPlayer.isHuman) || (turnCompleted && !isAi)) return;

    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceResult(roll);
    setTurnCompleted(true);
    addLog(`${currentPlayer.name} выбрасывает ${roll}`, "NEUTRAL");
    
    if (isAi) await new Promise(r => setTimeout(r, 1000));

    const oldPos = currentPlayer.currentPosition;
    const newPos = (oldPos + roll) % BOARD_SPACES.length;

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
        ...updatedPlayers[currentPlayerIndex],
        currentPosition: newPos
    };
    setPlayers(updatedPlayers);

    setTimeout(() => {
        processSpace(BOARD_SPACES[newPos], updatedPlayers[currentPlayerIndex]);
    }, 600);
  };

  const processSpace = async (space: BoardSpace, player: PlayerState) => {
    const isAi = !player.isHuman;

    try {
        if (space.type === SpaceType.PAYCHECK) {
          handlePayday(player);
          if (isAi) setTimeout(closeModal, 2000);
          return;
        }

        if (space.type === SpaceType.CHARITY) {
            setModalMessage(`${player.name} жертвует на благотворительность.`);
            addLog(`${player.name} попадает на благотворительность`, "INFO");
            setIsModalOpen(true);
            if (isAi) setTimeout(closeModal, 2000);
            return;
        }
        
        if (space.type === SpaceType.DOWNSIZED) {
            setModalMessage(`${player.name} попал под сокращение! Потеря: $${player.totalExpenses}.`);
            addLog(`${player.name} теряет работу и платит $${player.totalExpenses}`, "DANGER");
            const updatedPlayers = [...players];
            updatedPlayers[currentPlayerIndex].cash -= player.totalExpenses;
            setPlayers(updatedPlayers);
            setIsModalOpen(true);
            if (isAi) setTimeout(closeModal, 2000);
            return;
        }

        if (space.type === SpaceType.BABY) {
            setModalMessage(`${player.name}: Рождение ребенка! Расходы выросли.`);
            addLog(`${player.name}: в семье пополнение!`, "NEUTRAL");
            const updatedPlayers = [...players];
            updatedPlayers[currentPlayerIndex].children += 1;
            setPlayers(updatedPlayers);
            setIsModalOpen(true);
            if (isAi) setTimeout(closeModal, 2000);
            return;
        }

        if (space.type === SpaceType.OPPORTUNITY) {
            const type = player.cash >= 6000 ? CardType.BIG_DEAL : CardType.SMALL_DEAL;
            await fetchAndShowCard(type, isAi);
            return;
        }

        if (space.type === SpaceType.MARKET) {
            await fetchAndShowCard(CardType.MARKET_EVENT, isAi);
            return;
        }

        if (space.type === SpaceType.DOODAD) {
            await fetchAndShowCard(CardType.DOODAD_EVENT, isAi);
            return;
        }
    } catch (e) {
        console.error("Error processing space", e);
        if (isAi) closeModal();
    }
  };

  const handlePayday = (player: PlayerState) => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].cash += player.payday;
    setPlayers(updatedPlayers);
    setModalMessage(`ЗАРПЛАТА! ${player.name} получает $${player.payday}`);
    addLog(`${player.name} получает зарплату $${player.payday}`, "SUCCESS");
    setIsModalOpen(true);
  };

  const fetchAndShowCard = async (type: CardType, isAi: boolean) => {
    setIsModalOpen(true);
    setIsLoadingCard(true);
    setModalMessage(undefined);
    setAiDecision(null);
    
    try {
      // 1-2 second delay for realism when playing offline or fetching
      const minDelay = new Promise(resolve => setTimeout(resolve, 800));
      const [card] = await Promise.all([generateCardWithGemini(type), minDelay]);
      
      setActiveCard(card);
      
      if (isAi) {
         // Start visual thinking process. 
         // IMPORTANT: Pass 'card' to makeAiDecision to avoid closure staleness of 'activeCard' state
         setTimeout(() => makeAiDecision(card), 2000);
      }

    } catch (error) {
      console.error("Failed to load card", error);
      setModalMessage("Ошибка загрузки карты.");
      if (isAi) setTimeout(closeModal, 1500);
    } finally {
      setIsLoadingCard(false);
    }
  };

  const makeAiDecision = async (card: GameCard) => {
      // Robust AI wrapper to prevent game freezing
      try {
        const p = players[currentPlayerIndex];
        let action: 'BUY' | 'PASS' = 'PASS';

        // Logic
        if (card.type === CardType.DOODAD_EVENT) {
            action = 'BUY'; // Forced
        } else if (card.type === CardType.SMALL_DEAL || card.type === CardType.BIG_DEAL) {
            const cost = card.downPayment || card.cost || 0;
            const cashflow = card.cashflow || 0;
            // Basic heuristic: Buy if can afford and positive cashflow
            if (p.cash >= cost && cashflow >= 0) {
                action = 'BUY';
            }
        } else if (card.type === CardType.MARKET_EVENT) {
            if (card.symbol) {
                const hasAsset = p.assets.some(a => a.symbol === card.symbol || (card.symbol === 'REAL_ESTATE_3BR' && a.name.includes('Квартира')));
                if (hasAsset) action = 'BUY'; 
            }
        }

        // 1. Show decision Visually
        setAiDecision(action);
        
        // 2. Wait for user to see the "stamp"
        await new Promise(r => setTimeout(r, 1500));

        // 3. Execute logic
        if (action === 'BUY') {
            // Check affordability again safely just in case
            if (card.type === CardType.DOODAD_EVENT || (card.downPayment || card.cost || 0) <= p.cash || card.type === CardType.MARKET_EVENT) {
                 // Pass card explicitly to handleBuy
                 handleBuy(true, card);
            } else {
                 // Fallback if logic said BUY but actually can't afford (edge case)
                 addLog(`${p.name} хотел купить, но не хватило средств.`, "NEUTRAL");
                 closeModal();
            }
        } else {
            addLog(`${p.name} пропускает "${card.title}"`, "NEUTRAL");
            closeModal();
        }
      } catch (e) {
          console.error("AI Decision Critical Error", e);
          // Failsafe
          closeModal();
      }
  };


  const handleBuy = (skipAiLog = false, cardOverride?: GameCard) => {
    // Priority: use the overridden card (for AI), otherwise current activeCard
    const targetCard = cardOverride || activeCard;

    if (!targetCard) {
        console.warn("Attempted to buy with no active card");
        if (skipAiLog) closeModal(); // Failsafe for AI
        return;
    }

    const updatedPlayers = [...players];
    const currentP = updatedPlayers[currentPlayerIndex];

    if (targetCard.type === CardType.DOODAD_EVENT) {
        currentP.cash -= (targetCard.cost || 0);
        addLog(`${currentP.name} потратил $${targetCard.cost} на ${targetCard.title}`, "DANGER");
    } else if (targetCard.type === CardType.SMALL_DEAL || targetCard.type === CardType.BIG_DEAL) {
        const cost = targetCard.downPayment || targetCard.cost || 0;
        const newAsset: Asset = {
            id: targetCard.id,
            name: targetCard.title,
            cost: targetCard.cost || 0,
            downPayment: targetCard.downPayment || 0,
            cashflow: targetCard.cashflow || 0,
            type: targetCard.type === CardType.SMALL_DEAL && !targetCard.downPayment ? 'STOCK' : 'REAL_ESTATE',
            quantity: 1,
            symbol: targetCard.symbol
        };
        currentP.cash -= cost;
        currentP.assets.push(newAsset);
        addLog(`${currentP.name} купил ${targetCard.title} за $${cost}`, "SUCCESS");
    } else if (targetCard.type === CardType.MARKET_EVENT) {
        if (targetCard.symbol) {
            const assetsToSell = currentP.assets.filter(a => a.symbol === targetCard.symbol || (targetCard.symbol === 'REAL_ESTATE_3BR' && a.name.includes('Квартира')));
            const otherAssets = currentP.assets.filter(a => !(a.symbol === targetCard.symbol || (targetCard.symbol === 'REAL_ESTATE_3BR' && a.name.includes('Квартира'))));
            
            if (assetsToSell.length > 0) {
                 let profit = 0;
                 assetsToSell.forEach(a => {
                    const mortgage = a.cost - a.downPayment;
                    const net = (targetCard.cost || 0) - mortgage;
                    profit += net;
                 });
                 currentP.cash += profit;
                 currentP.assets = otherAssets;
                 addLog(`${currentP.name} продал активы и получил $${profit}`, "SUCCESS");
            }
        }
    }

    setPlayers(updatedPlayers);
    closeModal();
  };

  const nextTurn = () => {
    setIsModalOpen(false);
    setActiveCard(null);
    setModalMessage(undefined);
    setDiceResult(null);
    setTurnCompleted(false);
    setAiDecision(null);
    aiTurnInProgress.current = false;
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  };

  const closeModal = () => {
    nextTurn();
  };

  const checkWin = () => {
      const winner = players.find(p => p.passiveIncome > p.totalExpenses);
      return winner;
  };
  const winner = checkWin();

  const handleRestart = () => {
      setPhase('SETUP');
      setPlayers([]);
      setGameLog([]);
      aiTurnInProgress.current = false;
  }

  if (phase === 'SETUP') {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md text-slate-900 shadow-sm sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between p-2 md:px-4">
            <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-black tracking-tight hidden sm:block">FinFreedom</h1>
                </div>
                
                 <button onClick={handleRestart} className="md:hidden p-2 hover:bg-slate-100 rounded-full">
                    <RotateCcw className="w-5 h-5 text-slate-400" />
                 </button>
            </div>
            
            {/* Player Tabs */}
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
               <div className="flex space-x-2">
                  {players.map((p, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setViewingPlayerIndex(idx)}
                        className={`
                            flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all border
                            ${idx === currentPlayerIndex ? 'ring-2 ring-offset-1 ring-slate-800 border-slate-800 bg-white' : ''}
                            ${idx === viewingPlayerIndex && idx !== currentPlayerIndex ? 'bg-slate-100 border-slate-300' : 'bg-white/50 border-transparent'}
                            ${idx !== currentPlayerIndex && idx !== viewingPlayerIndex ? 'opacity-60 hover:opacity-100' : ''}
                        `}
                    >
                        <div 
                            className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm
                            `}
                            style={{ backgroundColor: PLAYER_COLORS_HEX[idx] }}
                        >
                            {p.name.charAt(0)}
                        </div>
                        <div className="flex flex-col items-start leading-none min-w-[60px]">
                            <span className="text-[10px] font-bold truncate max-w-[70px]">{p.name}</span>
                            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
                                <span className="text-emerald-600 font-bold">${p.cash < 1000 ? p.cash : (p.cash/1000).toFixed(1) + 'k'}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-yellow-600">+${p.payday}</span>
                            </div>
                        </div>
                    </button>
                  ))}
               </div>

                <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

                <button onClick={handleRestart} className="hidden md:block p-2 hover:bg-slate-100 rounded-full transition-colors group" title="Меню">
                    <RotateCcw className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Game Board & Central Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1 h-full">
             <GameBoard 
                spaces={BOARD_SPACES} 
                players={players} 
                currentPlayerIndex={currentPlayerIndex}
             >
                 {/* Center Controls */}
                 <div className="flex flex-col items-center justify-center h-full gap-4 md:gap-6 w-full max-w-xs mx-auto text-center">
                    
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Ход игрока</div>
                        <h2 
                            className="text-3xl font-black truncate max-w-[200px]" 
                            style={{ color: PLAYER_COLORS_HEX[currentPlayerIndex] }}
                        >
                            {currentPlayer.name}
                        </h2>
                        {!currentPlayer.isHuman && (
                            <div className="inline-flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 mt-2 animate-pulse">
                                <Bot className="w-3 h-3" /> АВТОПИЛОТ
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 w-full">
                        <div className="bg-white rounded-2xl w-24 h-24 flex flex-col items-center justify-center shadow-lg shadow-slate-200 border border-slate-100">
                             <div className={`text-4xl font-black ${diceResult ? 'text-slate-800' : 'text-slate-300'}`}>
                                 {diceResult || '?'}
                             </div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Кубик</div>
                        </div>

                        <button
                            onClick={() => handleRollDice()}
                            disabled={isModalOpen || !!winner || turnCompleted || !currentPlayer.isHuman}
                            className={`
                                flex-1 h-24 rounded-2xl font-bold text-lg transition-all flex flex-col items-center justify-center gap-1
                                ${turnCompleted || !currentPlayer.isHuman 
                                    ? 'bg-slate-100 text-slate-400 shadow-none cursor-default border border-slate-200' 
                                    : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:to-slate-700 hover:-translate-y-1 shadow-xl shadow-slate-300'}
                            `}
                        >
                            <Dices className="w-6 h-6" />
                            <span>{turnCompleted ? 'Завершено' : 'Бросок'}</span>
                        </button>
                    </div>
                 </div>
             </GameBoard>
             
             {/* Event Log */}
             <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 p-4 h-48 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Activity className="w-3 h-3" /> Хронология игры
                </div>
                <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar flex flex-col-reverse">
                    {gameLog.length === 0 && <p className="text-xs text-slate-400 italic text-center mt-10">Событий пока нет...</p>}
                    {gameLog.map((log) => (
                        <div key={log.id} className="text-sm flex items-start gap-3 animate-in slide-in-from-left-2 duration-300">
                            <span className="text-[10px] text-slate-300 font-mono mt-1 min-w-[30px]">{new Date(log.timestamp).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}</span>
                            <div className={`
                                flex-1 px-3 py-2 rounded-lg text-xs font-medium border
                                ${log.type === 'SUCCESS' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
                                  log.type === 'DANGER' ? 'bg-rose-50 border-rose-100 text-rose-800' : 
                                  log.type === 'INFO' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-600'}
                            `}>
                                {log.message}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>

        {/* Right: Financial Statement */}
        <div className="lg:col-span-4 order-1 lg:order-2 h-full">
            <FinancialStatement 
                player={viewingPlayer} 
                isCurrentTurn={viewingPlayerIndex === currentPlayerIndex}
            />
        </div>

      </main>

      <EventModal 
        isOpen={isModalOpen}
        isLoading={isLoadingCard}
        card={activeCard}
        message={modalMessage}
        onClose={closeModal}
        onBuy={() => handleBuy()} 
        onPass={closeModal}
        canBuy={
            activeCard?.type === CardType.MARKET_EVENT 
            ? (activeCard.symbol === 'REAL_ESTATE_3BR' ? currentPlayer.assets.some(a => a.name.includes('Квартира')) : false) 
            : (activeCard?.downPayment || activeCard?.cost || 0) <= currentPlayer.cash
        }
        isAiTurn={!currentPlayer.isHuman && !modalMessage}
        aiDecision={aiDecision}
      />
      
      {/* Winner Overlay */}
      {winner && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-4 animate-in zoom-in duration-500">
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 p-6 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.5)] mb-6 animate-bounce">
                <Trophy className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-6xl font-black text-white mb-2 tracking-tighter">ПОБЕДА!</h2>
            <p className="text-2xl text-slate-300 font-light mb-10">
                <strong className="text-emerald-400 font-black text-3xl">{winner.name}</strong> обрел свободу!
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md w-full mb-10">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Пассивный доход</div>
                    <div className="text-emerald-400 font-mono text-2xl font-bold">${winner.passiveIncome}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Расходы</div>
                    <div className="text-rose-400 font-mono text-2xl font-bold">${winner.totalExpenses}</div>
                </div>
            </div>

            <button 
                onClick={handleRestart}
                className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-lg hover:bg-emerald-400 hover:text-white hover:scale-105 transition-all shadow-xl"
            >
                Новая Игра
            </button>
         </div>
     )}

    </div>
  );
}