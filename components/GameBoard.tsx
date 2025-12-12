
import React from 'react';
import { BoardSpace, PlayerState, SpaceType } from '../types';
import { Wallet, TrendingUp, AlertTriangle, Briefcase, Heart, Baby, Scissors, Star, Building2 } from 'lucide-react';
import { PLAYER_COLORS_TAILWIND } from '../constants';

interface Props {
  spaces: BoardSpace[];
  players: PlayerState[];
  currentPlayerIndex: number;
  viewingPlayerIndex: number;
  children?: React.ReactNode;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'PAYCHECK': return <Wallet className="w-5 h-5 text-yellow-100 opacity-90 drop-shadow-sm" />;
    case 'OPPORTUNITY': return <TrendingUp className="w-5 h-5 text-emerald-100 opacity-90 drop-shadow-sm" />;
    case 'DOODAD': return <AlertTriangle className="w-5 h-5 text-rose-100 opacity-90 drop-shadow-sm" />;
    case 'MARKET': return <Briefcase className="w-5 h-5 text-sky-100 opacity-90 drop-shadow-sm" />;
    case 'CHARITY': return <Heart className="w-5 h-5 text-purple-100 opacity-90 drop-shadow-sm" />;
    case 'BABY': return <Baby className="w-5 h-5 text-pink-100 opacity-90 drop-shadow-sm" />;
    case 'DOWNSIZED': return <Scissors className="w-5 h-5 text-slate-300 opacity-90 drop-shadow-sm" />;
    // Fast Track
    case 'CASHFLOW_DAY': return <Wallet className="w-6 h-6 text-yellow-900 drop-shadow-sm" />;
    case 'DREAM': return <Star className="w-6 h-6 text-pink-100 drop-shadow-sm" />;
    case 'BUSINESS': return <Building2 className="w-6 h-6 text-emerald-100 drop-shadow-sm" />;
    default: return <div className="w-3 h-3 bg-white rounded-full" />;
  }
};

const GameBoard: React.FC<Props> = ({ spaces, players, currentPlayerIndex, viewingPlayerIndex, children }) => {
  // Mapping linear ID to 6x6 grid perimeter (20 spaces total)
  // Top: 0-5 (6 spaces)
  // Right: 6-9 (4 spaces)
  // Bottom: 10-15 (6 spaces)
  // Left: 16-19 (4 spaces)
  const getGridStyle = (index: number) => {
      if (index <= 5) return { gridRow: 1, gridColumn: index + 1 }; 
      if (index <= 9) return { gridRow: index - 5 + 1, gridColumn: 6 };
      if (index <= 15) return { gridRow: 6, gridColumn: 6 - (index - 10) };
      if (index <= 19) return { gridRow: 6 - (index - 15), gridColumn: 1 };
      return {};
  };

  const isFastTrack = players[viewingPlayerIndex]?.isRatRace === false;

  return (
    <div className={`
        transition-colors duration-700
        ${isFastTrack ? 'bg-slate-900 border-yellow-500/50' : 'bg-slate-300 border-slate-100'}
        p-3 md:p-5 rounded-[2.5rem] shadow-[inset_0_2px_15px_rgba(0,0,0,0.1)] overflow-hidden select-none border-4 relative
    `}>
        {/* Board Texture/Gradient Background */}
        <div className={`absolute inset-0 opacity-50 pointer-events-none transition-all duration-700 ${isFastTrack ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-200 to-slate-300'}`}></div>
        {isFastTrack && <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>}

        <div className="grid grid-cols-6 grid-rows-6 gap-2 md:gap-3 aspect-square md:aspect-auto h-full min-h-[550px] relative z-10">
            
            {/* Render Spaces */}
            {spaces.map((space) => {
                // Determine if this space should be rendered based on viewer context
                // Note: The parent component passes the correct 'spaces' array based on viewingPlayer
                
                // Only show players on this space if they are in the same TRACK as the viewer
                const playersOnSpace = players.map((p, i) => ({ ...p, originalIndex: i }))
                                              .filter(p => p.currentPosition === space.id && p.isRatRace === players[viewingPlayerIndex].isRatRace);
                
                const isCurrentSpace = playersOnSpace.some(p => p.originalIndex === currentPlayerIndex);

                return (
                    <div 
                        key={space.id} 
                        style={getGridStyle(space.id)}
                        className={`
                            relative rounded-2xl flex flex-col items-center justify-between p-1.5 py-2 text-center transition-all duration-500
                            ${space.color} 
                            ${isCurrentSpace ? 'scale-[1.02] shadow-2xl ring-4 ring-white/50 z-30 brightness-110' : 'shadow-md shadow-black/20 opacity-90 hover:opacity-100 hover:scale-[1.02] z-10'}
                            bg-gradient-to-b from-white/10 to-black/5 border-t border-white/20 border-b-4 border-black/10
                        `}
                    >
                        <div className="bg-black/10 p-1.5 rounded-full backdrop-blur-sm shadow-inner">
                            {getIcon(space.type)}
                        </div>
                        
                        <span className="text-[9px] md:text-[10px] font-black text-white drop-shadow-md leading-tight uppercase tracking-tight line-clamp-2 px-1">
                            {space.label}
                        </span>
                        
                        {/* Space ID */}
                        <span className="absolute top-1 left-2 text-[7px] text-black/20 font-black">{space.id + 1}</span>

                        {/* Player Tokens Container */}
                        <div className="flex flex-wrap gap-1 justify-center w-full px-0.5 min-h-[20px] items-end pb-1">
                          {playersOnSpace.map((p) => (
                            <div 
                              key={p.originalIndex}
                              className={`
                                w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] md:text-[10px] text-white font-black transition-all duration-300
                                ${PLAYER_COLORS_TAILWIND[p.originalIndex]}
                                ${p.originalIndex === currentPlayerIndex ? 'animate-bounce z-50 scale-125 shadow-xl' : 'z-20 scale-100'}
                              `}
                              title={p.name}
                            >
                              {p.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                    </div>
                );
            })}

            {/* Center Area (The Hub) */}
            <div className={`col-start-2 col-end-6 row-start-2 row-end-6 backdrop-blur-sm rounded-3xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-white/60 p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-700 ${isFastTrack ? 'bg-slate-800/80' : 'bg-slate-50/80'}`}>
                {isFastTrack ? (
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-5 pointer-events-none"></div>
                ) : (
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                )}
                
                {/* Provided Controls */}
                <div className="z-10 w-full h-full flex flex-col justify-center">
                    {children}
                </div>
            </div>

        </div>
    </div>
  );
};

export default GameBoard;
