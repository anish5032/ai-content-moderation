import { Router } from 'express';
import {
  analyzeVideo,
  deleteVideo,
  getVideo,
  getVideoResult,
  listVideos,
  uploadVideo,
} from '../controllers/videoController.js';
import { authRequired } from '../middleware/auth.js';
import { receiveVideo } from '../middleware/upload.js';
import { asyncRoute } from '../utils/errors.js';

const router = Router();
router.post('/', authRequired, receiveVideo, asyncRoute(uploadVideo));
router.get('/', authRequired, asyncRoute(listVideos));
router.get('/:videoId', authRequired, asyncRoute(getVideo));
router.delete('/:videoId', authRequired, asyncRoute(deleteVideo));
router.post('/:videoId/analyze', authRequired, asyncRoute(analyzeVideo));
router.get('/:videoId/result', authRequired, asyncRoute(getVideoResult));

export default router;
