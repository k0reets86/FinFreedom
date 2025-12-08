
import React from 'react';
import { GameCard, CardType } from '../types';
import { X, DollarSign, TrendingUp, AlertOctagon } from 'lucide-react';

interface Props {
  card: GameCard | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onBuy: () => void;
  onPass: () => void;
  canBuy: boolean;
  message?: string;
  isAiTurn?: boolean;
  aiDecision?: 'BUY' | 'PASS' | null;
}

const EventModal: React.FC<Props> = ({ 
  card, 
  isOpen, 
  isLoading, 
  onClose, 
  onBuy, 
  onPass, 
  canBuy, 
  message, 
  isAiTurn = false,
  aiDecision = null 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 ring-1 ring-white/20">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 flex justify-between items-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 z-0"></div>
          <h3 className="font-bold text-lg flex items-center gap-2 relative z-10">
            {isLoading ? 'Анализ рынка...' : card?.title || 'Событие'}
          </h3>
          {!isLoading && !isAiTurn && (
             <button onClick={onClose} className="relative z-10 bg-white/10 p-1 rounded-full hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
          )}
          {isAiTurn && (
             <span className="relative z-10 text-xs font-bold px-2 py-1 bg-white/10 rounded-md text-emerald-400 border border-emerald-500/30 animate-pulse">
                ХОД БОТА
             </span>
          )}
        </div>

        {/* AI Decision Overlay Stamp */}
        {aiDecision && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className={`
                    text-4xl font-black uppercase tracking-widest border-8 rounded-xl px-6 py-4 transform -rotate-12 animate-in zoom-in duration-300 shadow-2xl backdrop-blur-sm
                    ${aiDecision === 'BUY' 
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-100/90' 
                        : 'border-red-500 text-red-600 bg-red-100/90'}
                `}>
                    {aiDecision === 'BUY' ? 'КУПЛЕНО' : 'ПРОПУСК'}
                </div>
            </div>
        )}

        {/* Body */}
        <div className="p-6 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="relative">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                  </div>
              </div>
              <p className="text-slate-500 text-sm font-medium animate-pulse">ИИ подбирает сценарий...</p>
            </div>
          ) : message ? (
             <div className="text-center py-8">
                <p className="text-xl text-slate-800 font-bold mb-8">{message}</p>
                {!isAiTurn && (
                    <button 
                    onClick={onClose}
                    className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                    >
                    Продолжить
                    </button>
                )}
             </div>
          ) : card ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className={`
                    px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                    ${card.type === CardType.DOODAD_EVENT ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}
                    `}>
                    {card.type === CardType.DOODAD_EVENT ? 'Траты' : 'Инвестиция'}
                    </span>
                    {card.type === CardType.SMALL_DEAL && <span className="text-[10px] text-slate-400 font-bold uppercase">Малая сделка</span>}
                    {card.type === CardType.BIG_DEAL && <span className="text-[10px] text-slate-400 font-bold uppercase">Крупная сделка</span>}
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">{card.description}</p>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {card.cost !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Стоимость</span>
                    <span className="font-bold text-slate-900 text-lg">${card.cost.toLocaleString()}</span>
                  </div>
                )}
                {card.cashflow !== undefined && card.cashflow !== 0 && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Поток / мес</span>
                    <span className={`font-bold text-lg ${card.cashflow > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {card.cashflow > 0 ? '+' : ''}${card.cashflow}
                    </span>
                  </div>
                )}
                {card.downPayment !== undefined && card.downPayment > 0 && (
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Первый взнос</span>
                        <span className="font-bold text-slate-900">${card.downPayment.toLocaleString()}</span>
                    </div>
                )}
                {card.tradingRangeLow !== undefined && (
                   <div className="flex flex-col col-span-2 mt-1 pt-2 border-t border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Исторический диапазон цен</span>
                        <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-600 mt-1 bg-white px-2 py-1 rounded border border-slate-200">
                            <span>${card.tradingRangeLow}</span>
                            <div className="h-1 flex-1 mx-2 bg-slate-100 rounded-full"></div>
                            <span>${card.tradingRangeHigh}</span>
                        </div>
                    </div>
                )}
              </div>

              {/* Actions */}
              {!isAiTurn ? (
                  <div className="flex gap-3">
                    {card.type === CardType.DOODAD_EVENT ? (
                      <button 
                        onClick={onBuy}
                        className="flex-1 bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                      >
                        Оплатить: ${card.cost}
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={onPass}
                          className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                          Пропустить
                        </button>
                        <button 
                          onClick={onBuy}
                          disabled={!canBuy}
                          className={`
                            flex-1 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                            ${canBuy 
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 hover:-translate-y-0.5' 
                              : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
                          `}
                        >
                          Купить
                        </button>
                      </>
                    )}
                  </div>
              ) : (
                 // AI "Thinking" State UI
                 <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-center gap-3 border border-slate-100">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Бот принимает решение</span>
                 </div>
              )}
              
              {!canBuy && !isAiTurn && card.type !== CardType.DOODAD_EVENT && (
                <p className="text-center text-xs text-rose-500 mt-3 font-bold bg-rose-50 py-1 rounded">Недостаточно средств</p>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
