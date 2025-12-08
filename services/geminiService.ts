import { GoogleGenAI, Type } from "@google/genai";
import { CardType, GameCard } from '../types';

// --- OFFLINE DATABASE (RICH CONTENT) ---

const SMALL_DEALS_DB: GameCard[] = [
  {
    id: 'sd_stock_1',
    title: 'Акции MYT4U',
    description: 'Компания по производству электроники. Рынок нестабилен.',
    type: CardType.SMALL_DEAL,
    cost: 5,
    downPayment: 0,
    cashflow: 0,
    tradingRangeLow: 5,
    tradingRangeHigh: 30,
    symbol: 'MYT4U'
  },
  {
    id: 'sd_stock_2',
    title: 'Акции OK4U',
    description: 'Фармацевтический стартап. Ждут одобрения лекарства.',
    type: CardType.SMALL_DEAL,
    cost: 40,
    downPayment: 0,
    cashflow: 0,
    tradingRangeLow: 5,
    tradingRangeHigh: 50,
    symbol: 'OK4U'
  },
  {
    id: 'sd_stock_3',
    title: 'Акции ON2U',
    description: 'Развлекательный холдинг. Стабильный рост.',
    type: CardType.SMALL_DEAL,
    cost: 20,
    downPayment: 0,
    cashflow: 0,
    tradingRangeLow: 10,
    tradingRangeHigh: 30,
    symbol: 'ON2U'
  },
  {
    id: 'sd_re_1',
    title: 'Кондоминиум 2Br/1Ba',
    description: 'Банк продает залоговую квартиру. Требуется косметический ремонт.',
    type: CardType.SMALL_DEAL,
    cost: 40000,
    downPayment: 4000,
    cashflow: 140,
    symbol: 'REAL_ESTATE_2BR'
  },
  {
    id: 'sd_re_2',
    title: 'Дом 3Br/2Ba',
    description: 'Старый дом в хорошем районе. Владелец переезжает срочно.',
    type: CardType.SMALL_DEAL,
    cost: 55000,
    downPayment: 5000,
    cashflow: 200,
    symbol: 'REAL_ESTATE_3BR'
  },
  {
    id: 'sd_re_3',
    title: 'Земля (10 акров)',
    description: 'Участок за городом. Коммуникаций нет, но город растет в эту сторону.',
    type: CardType.SMALL_DEAL,
    cost: 5000,
    downPayment: 5000,
    cashflow: 0,
    symbol: 'LAND'
  },
  {
    id: 'sd_coin',
    title: 'Редкая Золотая Монета',
    description: 'Коллекционная монета Крюгерранд 1970 года.',
    type: CardType.SMALL_DEAL,
    cost: 500,
    downPayment: 500,
    cashflow: 0,
    symbol: 'RARE_COIN'
  },
  {
    id: 'sd_cert',
    title: 'Депозитный Сертификат',
    description: 'Банковский вклад под хороший процент.',
    type: CardType.SMALL_DEAL,
    cost: 4000,
    downPayment: 4000,
    cashflow: 20,
    symbol: 'CD'
  }
];

const BIG_DEALS_DB: GameCard[] = [
  {
    id: 'bd_apt_1',
    title: '8-квартирный дом',
    description: 'Полностью заселен. Требует управления.',
    type: CardType.BIG_DEAL,
    cost: 240000,
    downPayment: 40000,
    cashflow: 1800,
    symbol: 'MULTI_FAMILY'
  },
  {
    id: 'bd_apt_2',
    title: '24-квартирный комплекс',
    description: 'Студенческое жилье рядом с университетом. Высокий спрос.',
    type: CardType.BIG_DEAL,
    cost: 600000,
    downPayment: 75000,
    cashflow: 4200,
    symbol: 'MULTI_FAMILY'
  },
  {
    id: 'bd_biz_1',
    title: 'Автомойка',
    description: 'Автоматическая мойка самообслуживания. Минимум персонала.',
    type: CardType.BIG_DEAL,
    cost: 150000,
    downPayment: 30000,
    cashflow: 1200,
    symbol: 'BUSINESS'
  },
  {
    id: 'bd_biz_2',
    title: 'Пиццерия (Франшиза)',
    description: 'Популярная сеть. Управляющий включен в стоимость.',
    type: CardType.BIG_DEAL,
    cost: 200000,
    downPayment: 40000,
    cashflow: 2500,
    symbol: 'BUSINESS'
  },
  {
    id: 'bd_biz_3',
    title: 'IT Стартап (Доля)',
    description: 'Рискованное вложение в разработчиков ПО. Может выстрелить.',
    type: CardType.BIG_DEAL,
    cost: 50000,
    downPayment: 50000,
    cashflow: 1000,
    symbol: 'BUSINESS_TECH'
  },
  {
    id: 'bd_mall',
    title: 'Мини-Торговый Центр',
    description: '4 магазина. Арендаторы стабильные (аптека, продукты).',
    type: CardType.BIG_DEAL,
    cost: 120000,
    downPayment: 25000,
    cashflow: 800,
    symbol: 'COMMERCIAL'
  }
];

const DOODADS_DB: GameCard[] = [
  {
    id: 'dd_1',
    title: 'Новый Смартфон',
    description: 'Флагманская модель. Старый вдруг "случайно" разбился.',
    type: CardType.DOODAD_EVENT,
    cost: 1000
  },
  {
    id: 'dd_2',
    title: 'Ужин в ресторане',
    description: 'Пригласили друзей отметить пятницу. Счет вышел больше, чем планировали.',
    type: CardType.DOODAD_EVENT,
    cost: 200
  },
  {
    id: 'dd_3',
    title: 'Ремонт машины',
    description: 'Полетела коробка передач. Нужно срочно чинить.',
    type: CardType.DOODAD_EVENT,
    cost: 1500
  },
  {
    id: 'dd_4',
    title: 'Свадьба сестры',
    description: 'Нужен подарок и новый костюм. Нельзя ударить в грязь лицом.',
    type: CardType.DOODAD_EVENT,
    cost: 500
  },
  {
    id: 'dd_5',
    title: 'Лодка',
    description: 'Купили небольшую лодку для рыбалки. Импульсивная покупка.',
    type: CardType.DOODAD_EVENT,
    cost: 3000
  },
  {
    id: 'dd_6',
    title: 'Капучино каждый день',
    description: 'Подсчитали расходы на кофе за месяц. Ужаснулись. Оплатите.',
    type: CardType.DOODAD_EVENT,
    cost: 150
  },
  {
    id: 'dd_7',
    title: 'Стоматолог',
    description: 'Зубная боль не ждет. Страховка не покрыла всё.',
    type: CardType.DOODAD_EVENT,
    cost: 800
  }
];

const MARKET_DB: GameCard[] = [
  {
    id: 'mkt_1',
    title: 'Покупатель на 3-комн.',
    description: 'Молодая семья ищет дом. Предлагают отличную цену за 3Br/2Ba.',
    type: CardType.MARKET_EVENT,
    cost: 135000, // Offer price
    symbol: 'REAL_ESTATE_3BR',
    rule: 'Можно продать Дом 3Br/2Ba за $135,000'
  },
  {
    id: 'mkt_2',
    title: 'Покупатель на Кондо',
    description: 'Инвестор скупает 2Br/1Ba квартиры.',
    type: CardType.MARKET_EVENT,
    cost: 65000,
    symbol: 'REAL_ESTATE_2BR',
    rule: 'Можно продать Кондо 2Br/1Ba за $65,000'
  },
  {
    id: 'mkt_3',
    title: 'Бум на землю',
    description: 'Застройщик ищет участки под застройку.',
    type: CardType.MARKET_EVENT,
    cost: 40000,
    symbol: 'LAND',
    rule: 'Земля подорожала. Продажа за $40,000.'
  },
  {
    id: 'mkt_stock_1',
    title: 'Рынок MYT4U',
    description: 'Взрывной рост продаж. Цена взлетела!',
    type: CardType.MARKET_EVENT,
    cost: 40, // Current price
    symbol: 'MYT4U',
    rule: 'Цена акции MYT4U сейчас $40. Все могут продать.'
  },
  {
    id: 'mkt_stock_2',
    title: 'Крах OK4U',
    description: 'Лекарство не прошло проверку. Акции рухнули.',
    type: CardType.MARKET_EVENT,
    cost: 5,
    symbol: 'OK4U',
    rule: 'Цена акции OK4U сейчас $5.'
  },
  {
    id: 'mkt_coin',
    title: 'Коллекционер монет',
    description: 'Ищет редкие крюгерранды.',
    type: CardType.MARKET_EVENT,
    cost: 4000,
    symbol: 'RARE_COIN',
    rule: 'Покупает монеты по $4,000 за штуку.'
  }
];

// --- SERVICE ---

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Random selector for offline mode
const getRandomCard = (type: CardType): GameCard => {
  const db = type === CardType.SMALL_DEAL ? SMALL_DEALS_DB :
             type === CardType.BIG_DEAL ? BIG_DEALS_DB :
             type === CardType.DOODAD_EVENT ? DOODADS_DB :
             MARKET_DB;
  
  const randomIndex = Math.floor(Math.random() * db.length);
  return { ...db[randomIndex], id: `${type}_${Date.now()}_${Math.random()}` };
};

export const generateCardWithGemini = async (type: CardType): Promise<GameCard> => {
  const ai = getClient();
  
  // If no API key is present, IMMEDIATELY use offline DB without waiting or logging error
  if (!ai) {
    return getRandomCard(type);
  }

  let prompt = "";
  let model = "gemini-2.5-flash";

  if (type === CardType.SMALL_DEAL) {
    prompt = "Создай карточку 'Малая Сделка' для финансовой игры (аналог Cashflow). Это может быть дешевая акция (цена $1-$50, без дивидендов) или малая недвижимость (цена < $30000, первый взнос < $5000, cashflow $100-$200). Верни JSON на русском языке. Структура: title, description, cost, downPayment, cashflow, symbol, tradingRangeLow, tradingRangeHigh.";
  } else if (type === CardType.BIG_DEAL) {
    prompt = "Создай карточку 'Крупная Сделка'. Это многоквартирный дом (8-plex, 24-plex), бизнес (автомойка, пиццерия) или коммерческая недвижимость. Цена > $40000, Первый взнос > $8000, Cashflow > $500. Верни JSON на русском языке.";
  } else if (type === CardType.DOODAD_EVENT) {
    prompt = "Создай карточку 'Траты' (Doodad). Смешная или жизненная ненужная покупка. Стоимость $100-$3000. Верни JSON.";
  } else {
    prompt = "Создай карточку 'Рынок'. Это событие, влияющее на цены. Либо покупатель на недвижимость (предлагает высокую цену), либо изменение цены акций, либо сплит акций. Верни JSON.";
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            cost: { type: Type.NUMBER, description: "Total cost or expense amount" },
            downPayment: { type: Type.NUMBER, description: "Down payment if applicable, else 0" },
            cashflow: { type: Type.NUMBER, description: "Monthly passive income generated, else 0" },
            tradingRangeLow: { type: Type.NUMBER, description: "For stocks, low end of historic price" },
            tradingRangeHigh: { type: Type.NUMBER, description: "For stocks, high end of historic price" },
            symbol: { type: Type.STRING, description: "Stock ticker symbol or asset tag" }
          },
          required: ["title", "description", "cost"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: `gen_${Date.now()}`,
        type,
        ...data,
      };
    }
    throw new Error("No text response");
  } catch (e) {
    console.warn("Gemini generation failed or timed out, using offline database.");
    return getRandomCard(type);
  }
};