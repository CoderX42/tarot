import test from 'node:test';
import assert from 'node:assert';
import { majorArcana } from '../src/data/cards.js';

test('Tarot Data integrity', (t) => {
  assert.strictEqual(majorArcana.length, 22, 'Should have exactly 22 Major Arcana cards');
  
  majorArcana.forEach(card => {
    assert.ok(card.id.startsWith('arcana_'), 'ID format should be correct');
    assert.ok(card.name_zh, 'Should have Chinese name');
    assert.ok(card.keywords.upright.length > 0, 'Should have upright keywords');
    assert.ok(card.keywords.reversed.length > 0, 'Should have reversed keywords');
    assert.ok(card.meanings.love && card.meanings.career && card.meanings.wealth, 'Should have complete meanings');
  });
});

test('Mock Draw Logic', () => {
  const count = 3;
  const drawn = [];
  const availableIndices = Array.from({ length: majorArcana.length }, (_, i) => i);
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const cardIndex = availableIndices.splice(randomIndex, 1)[0];
    drawn.push({
      card: majorArcana[cardIndex],
      isReversed: Math.random() > 0.5
    });
  }

  assert.strictEqual(drawn.length, 3, 'Should draw exactly 3 cards');
  
  const ids = drawn.map(d => d.card.id);
  const uniqueIds = new Set(ids);
  assert.strictEqual(ids.length, uniqueIds.size, 'Drawn cards should be unique');
});