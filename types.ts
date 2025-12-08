
export enum SpaceType {
  OPPORTUNITY = 'OPPORTUNITY', // Возможность (Deals)
  MARKET = 'MARKET',           // Рынок (Sell)
  DOODAD = 'DOODAD',           // Траты (Expenses)
  CHARITY = 'CHARITY',         // Благотворительность
  PAYCHECK = 'PAYCHECK',       // Зарплата
  BABY = 'BABY',               // Ребенок
  DOWNSIZED = 'DOWNSIZED',     // Увольнение
}

export enum CardType {
  SMALL_DEAL = 'SMALL_DEAL',
  BIG_DEAL = 'BIG_DEAL',
  MARKET_EVENT = 'MARKET_EVENT',
  DOODAD_EVENT = 'DOODAD_EVENT',
}

export enum GameDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Profession {
  id: string;
  title: string;
  salary: number;
  savings: number;
  liabilities: {
    homeMortgage: number;
    schoolLoans: number;
    carLoans: number;
    creditCards: number;
    retailDebt: number;
  };
}

export interface Asset {
  id: string;
  name: string;
  cost: number;
  downPayment: number; // 0 for stocks
  cashflow: number; // Monthly income
  type: 'REAL_ESTATE' | 'STOCK' | 'BUSINESS';
  quantity?: number; // For stocks
  symbol?: string; // For stocks
}

export interface Liability {
  id: string;
  name: string;
  value: number; // Total debt amount
  expense: number; // Monthly payment
}

export interface PlayerState {
  id: string;
  name: string;
  isHuman: boolean; // Determines if AI controls this player
  profession: string;
  cash: number;
  salary: number;
  children: number;
  isRatRace: boolean;
  
  // Ledger
  assets: Asset[];
  liabilities: Liability[];
  
  // Computed
  passiveIncome: number;
  totalExpenses: number;
  payday: number; // Monthly Cashflow
  
  // Board
  currentPosition: number;
  skippedTurns: number;
  hasCharity: boolean; // 2 dice
}

export interface GameCard {
  id: string;
  title: string;
  description: string;
  type: CardType;
  
  // Logic fields
  cost?: number;
  downPayment?: number;
  cashflow?: number;
  tradingRangeLow?: number;
  tradingRangeHigh?: number;
  symbol?: string; // For market events or stocks
  rule?: string; // Special instructions
}

export interface BoardSpace {
  id: number;
  type: SpaceType;
  label: string;
  color: string;
  gridArea?: string; // For layout positioning
}

export interface GameLogEntry {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'DANGER' | 'NEUTRAL';
  timestamp: number;
}
