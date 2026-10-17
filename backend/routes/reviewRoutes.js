import { Router } from 'express';
import { listReviews } from '../controllers/reviewController.js';
import { authRequired } from '../middleware/auth.js';
import { asyncRoute } from '../utils/errors.js';

const router = Router();
router.get('/', authRequired, asyncRoute(listReviews));

export default router;
