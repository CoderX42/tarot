import { Router } from 'express';
import { getCards, drawCards, interpretReading } from '../controllers/tarotController.js';

const router = Router();

// Get all cards metadata (for initialization)
router.get('/cards', getCards);

// Draw random cards
router.post('/draw', drawCards);

// Interpret a reading
router.post('/interpret', interpretReading);

export default router;