import { create } from 'zustand';

export type ReadingState = 'idle' | 'shuffling' | 'selecting' | 'interpreting' | 'reading' | 'done';

interface TarotStore {
  readingState: ReadingState;
  selectedCards: any[]; // Store full card data
  availableCards: any[];
  question: string;
  readingResult: any;
  setReadingState: (state: ReadingState) => void;
  setQuestion: (q: string) => void;
  addSelectedCard: (cardData: any) => void;
  reset: () => void;
  submitReading: () => Promise<void>;
  fetchCards: () => Promise<void>;
}

export const useTarotStore = create<TarotStore>((set, get) => ({
  readingState: 'idle',
  selectedCards: [],
  availableCards: [],
  question: '',
  readingResult: null,
  setReadingState: (state) => set({ readingState: state }),
  setQuestion: (q) => set({ question: q }),
  addSelectedCard: (cardData) => {
    set((state) => ({
      selectedCards: [...state.selectedCards, cardData],
    }));
    
    // Automatically submit reading if we just added the 3rd card
    const state = get();
    if (state.selectedCards.length === 3 && state.readingState === 'selecting') {
      state.submitReading();
    }
  },
  reset: () => set({ readingState: 'idle', selectedCards: [], question: '', readingResult: null }),
  fetchCards: async () => {
    try {
      const response = await fetch('/api/tarot/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 22 }) // get shuffled 22 cards
      });
      const data = await response.json();
      set({ availableCards: data.drawn });
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    }
  },
  submitReading: async () => {
    const { question, selectedCards } = get();
    set({ readingState: 'interpreting' });
    try {
      const response = await fetch('/api/tarot/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, cards: selectedCards }),
      });
      const data = await response.json();
      set({ readingResult: data, readingState: 'reading' });
    } catch (error) {
      console.error('Failed to interpret reading:', error);
      set({ readingState: 'reading' }); // Fallback or handle error
    }
  }
}));