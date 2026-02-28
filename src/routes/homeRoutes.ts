import express from 'express';
import { getHomeCards } from '../controllers/homeController';

const router = express.Router();

router.get('/cards', getHomeCards);

export default router;