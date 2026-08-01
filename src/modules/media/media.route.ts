import { Router } from 'express';
import { MediaController } from './media.controller';

const router = Router();

router.get('/:mediaId', MediaController.getMedia);

export const MediaRoutes = router;
