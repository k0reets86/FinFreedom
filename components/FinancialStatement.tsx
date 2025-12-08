
import React from 'react';
import { PlayerState } from '../types';
import { TrendingUp, TrendingDown, Briefcase, Eye } from 'lucide-react';

interface Props {
  player: PlayerState;
  isCurrentTurn: boolean;
}

const FinancialStatement: React.FC<Props> = ({ player, isCurrentTurn }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 h-full overflow-hidden flex flex-col transition-all duration-300 ${!isCurrentTurn ? 'ring-2 ring-slate-200 bg-slate-50' : ''}`}>
      
      {/* Header Panel */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col gap-2">
         <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md bg-slate-800`}>
                    {player.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 leading-tight">
                        {player.name}
                        {!isCurrentTurn && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Eye className="w-3 h-3"/> Просмотр</span>}
                    </h2>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Briefcase className="w-3 h-3" />
                        {player.profession}
                    </div>
                </div>
            </div>
            
            <div className="text-right">
                <span className="block text-[10px] uppercase font-bold text-slate-400">На руках</span>
                <span className="text-2xl font-mono font-bold text-emerald-600 tracking-tight">
                    ${player.cash.toLocaleString()}
                </span>
            </div>
         </div>
         
         {/* Progress Bar */}
         <div className="mt-2 bg-slate-200 h-2 rounded-full overflow-hidden w-full relative group">
             <div 
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min((player.passiveIncome / player.totalExpenses) * 100, 100)}%` }}
             ></div>
             <div className="absolute top-0 right-0 h-full w-[1px] bg-red-400 z-10" style={{ left: '100%' }}></div>
         </div>
         <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase">
            <span>Пассивный доход</span>
            <span>{Math.round((player.passiveIncome / player.totalExpenses) * 100)}% свободы</span>
         </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {/* Income Statement Block */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 mb-2 text-emerald-700 font-bold text-xs uppercase tracking-wide">
                <TrendingUp className="w-3 h-3" /> Доходы
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Зарплата</span>
                    <span className="font-mono text-slate-700">${player.salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Пассивный</span>
                    <span className="font-mono text-emerald-700 font-bold">${player.passiveIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
              <div className="flex items-center gap-1.5 mb-2 text-red-700 font-bold text-xs uppercase tracking-wide">
                <TrendingDown className="w-3 h-3" /> Расходы
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Общие</span>
                    <span className="font-mono text-slate-700">${player.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Дети ({player.children})</span>
                    <span className="font-mono text-slate-700">${(player.children * 200).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Cashflow Highlight */}
          <div className="bg-slate-800 text-white p-3 rounded-xl shadow-md mb-6 flex justify-between items-center">
            <span className="text-xs font-medium text-slate-300 uppercase">Чистый поток</span>
            <span className="text-xl font-bold font-mono text-yellow-400">
                +${player.payday.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Assets List */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Активы</h3>
              {player.assets.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">Нет активов</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {player.assets.map((asset, idx) => (
                    <li key={idx} className="bg-white p-2.5 rounded-lg text-sm flex justify-between items-center shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-xs">{asset.name}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                            {asset.type === 'STOCK' ? (
                                <span className="bg-blue-50 text-blue-600 px-1 rounded">{asset.symbol}</span>
                            ) : (
                                <span>Недвижимость</span>
                            )}
                            <span className="ml-2">Ст: ${asset.cost.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-emerald-600 font-mono font-bold text-xs bg-emerald-50 px-2 py-1 rounded">
                        +${asset.cashflow}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Liabilities List */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Пассивы</h3>
               <ul className="space-y-2">
                  {player.liabilities.map((liab, idx) => (
                    <li key={idx} className="bg-white p-2.5 rounded-lg text-sm flex justify-between items-center shadow-sm border border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 text-xs">{liab.name}</span>
                        <span className="text-[10px] text-slate-400">Долг: ${liab.value.toLocaleString()}</span>
                      </div>
                      <div className="text-red-600 font-mono font-bold text-xs bg-red-50 px-2 py-1 rounded">
                        -${liab.expense}
                      </div>
                    </li>
                  ))}
                </ul>
            </div>
          </div>
      </div>
    </div>
  );
};

export default FinancialStatement;
