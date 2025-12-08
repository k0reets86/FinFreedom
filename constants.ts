
import { BoardSpace, PlayerState, SpaceType, GameDifficulty, Profession } from './types';

export const PROFESSIONS: Profession[] = [
  {
    id: 'pilot',
    title: 'Пилот',
    salary: 9500,
    savings: 2500,
    liabilities: { homeMortgage: 143000, schoolLoans: 0, carLoans: 15000, creditCards: 22000, retailDebt: 1000 }
  },
  {
    id: 'doctor',
    title: 'Врач',
    salary: 13200,
    savings: 3500,
    liabilities: { homeMortgage: 202000, schoolLoans: 150000, carLoans: 19000, creditCards: 9000, retailDebt: 1000 }
  },
  {
    id: 'engineer',
    title: 'Инженер',
    salary: 4900,
    savings: 1800,
    liabilities: { homeMortgage: 75000, schoolLoans: 12000, carLoans: 7000, creditCards: 4000, retailDebt: 1000 }
  },
  {
    id: 'teacher',
    title: 'Учитель',
    salary: 3300,
    savings: 1200,
    liabilities: { homeMortgage: 50000, schoolLoans: 12000, carLoans: 5000, creditCards: 3000, retailDebt: 1000 }
  },
  {
    id: 'truck_driver',
    title: 'Водитель',
    salary: 2500,
    savings: 950,
    liabilities: { homeMortgage: 38000, schoolLoans: 0, carLoans: 4000, creditCards: 2000, retailDebt: 1000 }
  },
  {
    id: 'lawyer',
    title: 'Юрист',
    salary: 7500,
    savings: 2000,
    liabilities: { homeMortgage: 115000, schoolLoans: 78000, carLoans: 11000, creditCards: 6000, retailDebt: 1000 }
  },
  {
    id: 'nurse',
    title: 'Медсестра',
    salary: 3100,
    savings: 1000,
    liabilities: { homeMortgage: 47000, schoolLoans: 6000, carLoans: 5000, creditCards: 3000, retailDebt: 1000 }
  },
  {
    id: 'manager',
    title: 'Менеджер',
    salary: 4600,
    savings: 1500,
    liabilities: { homeMortgage: 75000, schoolLoans: 12000, carLoans: 6000, creditCards: 4000, retailDebt: 1000 }
  },
];

// Base state template (some fields will be overwritten by Profession data)
export const INITIAL_PLAYER_TEMPLATE: Omit<PlayerState, 'name' | 'id' | 'isHuman' | 'profession' | 'cash' | 'salary'> = {
  children: 0,
  isRatRace: true,
  assets: [],
  liabilities: [],
  passiveIncome: 0,
  totalExpenses: 0, 
  payday: 0,
  currentPosition: 0,
  skippedTurns: 0,
  hasCharity: false,
};

// Expanded board with 20 spaces
export const BOARD_SPACES: BoardSpace[] = [
  // Top Row (Left to Right)
  { id: 0, type: SpaceType.PAYCHECK, label: "Зарплата", color: "bg-yellow-400" },
  { id: 1, type: SpaceType.OPPORTUNITY, label: "Сделка", color: "bg-emerald-500" },
  { id: 2, type: SpaceType.DOODAD, label: "Траты", color: "bg-rose-500" },
  { id: 3, type: SpaceType.OPPORTUNITY, label: "Сделка", color: "bg-emerald-500" },
  { id: 4, type: SpaceType.CHARITY, label: "Благо", color: "bg-violet-500" },
  { id: 5, type: SpaceType.OPPORTUNITY, label: "Сделка", color: "bg-emerald-500" },
  
  // Right Column (Top to Bottom)
  { id: 6, type: SpaceType.PAYCHECK, label: "Зарплата", color: "bg-yellow-400" },
  { id: 7, type: SpaceType.MARKET, label: "Рынок", color: "bg-sky-500" },
  { id: 8, type: SpaceType.OPPORTUNITY, label: "Сделка", color: "bg-emerald-500" },
  { id: 9, type: SpaceType.DOODAD, label: "Траты", color: "bg-rose-500" },

  // Bottom Row (Right to Left)
  { id: 10, type: SpaceType.DOWNSIZED, label: "Увольнение", color: "bg-slate-600" },
  { id: 11, type: SpaceType.OPPORTUNITY, label: "Сделка", color: "bg-emerald-500" },
  { id: 12, type: SpaceType.PAYCHECK, label: "Зарплата", color: "bg-yellow-400" },
  { id: 13, type: SpaceType.OPPORTUNITY, label: "Сделка", color: "bg-emerald-500" },
  { id: 14, type: SpaceType.BABY, label: "Ребенок", color: "bg-pink-400" },
  { id: 15, type: SpaceType.OPPORTUNITY, label: "Сделка", color: "bg-emerald-500" },

  // Left Column (Bottom to Top)
  { id: 16, type: SpaceType.MARKET, label: "Рынок", color: "bg-sky-500" },
  { id: 17, type: SpaceType.DOODAD, label: "Траты", color: "bg-rose-500" },
  { id: 18, type: SpaceType.OPPORTUNITY, label: "Сделка", color: "bg-emerald-500" },
  { id: 19, type: SpaceType.MARKET, label: "Рынок", color: "bg-sky-500" },
];

export const LIVING_EXPENSES_BASE = 0; // Calculated dynamically now based on debts + taxes (simplified as base expenses per profession usually, but we'll adapt)
export const CHILD_EXPENSE = 240;

export const DIFFICULTY_SETTINGS = {
  [GameDifficulty.EASY]: { startCashBonus: 2000, salaryBonus: 0 },
  [GameDifficulty.MEDIUM]: { startCashBonus: 500, salaryBonus: 0 },
  [GameDifficulty.HARD]: { startCashBonus: 0, salaryBonus: -200 },
};

// Gender balanced bot names
export const BOT_NAMES = ['Роберт', 'Анна', 'Уоррен', 'Мария', 'Илон', 'Оливия', 'Джефф', 'Елена', 'Билл', 'София'];

// Colors for up to 6 players
// Blue, Red, Green, Purple, Orange, Cyan
export const PLAYER_COLORS_HEX = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#f97316', '#06b6d4'];
export const PLAYER_COLORS_TAILWIND = [
  'bg-blue-600 ring-blue-300 shadow-blue-500/50',
  'bg-red-600 ring-red-300 shadow-red-500/50',
  'bg-green-600 ring-green-300 shadow-green-500/50',
  'bg-purple-600 ring-purple-300 shadow-purple-500/50',
  'bg-orange-500 ring-orange-300 shadow-orange-500/50',
  'bg-cyan-500 ring-cyan-300 shadow-cyan-500/50'
];
