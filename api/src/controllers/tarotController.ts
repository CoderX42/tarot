import { Request, Response } from 'express';
import crypto from 'crypto';
import { majorArcana } from '../data/cards.js';

export const getCards = (req: Request, res: Response) => {
  // Only return necessary metadata, not the full interpretations
  const metadata = majorArcana.map(card => ({
    id: card.id,
    number: card.number,
    name_zh: card.name_zh,
    name_en: card.name_en,
    image_url: card.image_url
  }));
  res.json({ cards: metadata });
};

export const drawCards = (req: Request, res: Response) => {
  let { count = 3 } = req.body;
  
  if (count > majorArcana.length) {
    count = majorArcana.length; // fallback to available cards
  }

  // Use crypto for better randomness
  const availableIndices = Array.from({ length: majorArcana.length }, (_, i) => i);
  const drawn = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = crypto.randomInt(0, availableIndices.length);
    const cardIndex = availableIndices.splice(randomIndex, 1)[0];
    
    // Determine upright or reversed (50/50 chance)
    const isReversed = crypto.randomInt(0, 2) === 1;
    
    drawn.push({
      card: majorArcana[cardIndex],
      isReversed
    });
  }

  res.json({ drawn });
};

export const interpretReading = (req: Request, res: Response) => {
  const { question, cards } = req.body;
  
  if (!cards || cards.length === 0) {
    return res.status(400).json({ error: 'No cards provided for interpretation' });
  }

  // In a real app, this would use an LLM or complex rules engine.
  // Here we construct a simple interpretation based on the cards' static meanings.
  const reading = cards.map((c: any, index: number) => {
    const cardData = majorArcana.find(m => m.id === c.id);
    if (!cardData) return null;

    const position = index === 0 ? '过去/基础' : index === 1 ? '现在/行动' : '未来/结果';
    const state = c.isReversed ? '逆位' : '正位';
    const keywords = c.isReversed ? cardData.keywords.reversed : cardData.keywords.upright;
    
    // Simple logic: pick a meaning based on some generic mapping
    const meaning = cardData.meanings.career; // just an example

    return {
      position,
      cardName: cardData.name_zh,
      state,
      keywords,
      interpretation: `${cardData.name_zh}（${state}）在${position}的位置。关键提示：${keywords.join('，')}。这暗示着${meaning}`
    };
  }).filter(Boolean);

  res.json({
    question,
    reading,
    advice: "命运掌握在你自己手中，塔罗只是指引方向。"
  });
};