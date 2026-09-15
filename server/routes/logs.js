import { Router } from 'express';
import sharp from 'sharp';
import DecisionLog from '../models/DecisionLog.js';

const router = Router();
const decisions = ['allowed', 'blocked', 'redacted'];

router.get('/', async (req, res) => {
  const logs = await DecisionLog.find({ userId: req.userId })
    .select('domain pageUrl pageTitle field category decision imageData evidenceStatus timestamp -_id')
    .sort({ timestamp: -1 })
    .lean();
  return res.json(logs);
});

router.post('/', async (req, res) => {
  const { domain, pageUrl, pageTitle, field, category, decision, imageData } = req.body;
  if (typeof domain !== 'string' || !domain || typeof category !== 'string' || !decisions.includes(decision)) {
    return res.status(400).json({ message: 'Invalid log metadata' });
  }

  let blurredImage;
  if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
    try {
      const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
      const processed = await sharp(imageBuffer)
        .resize({ width: 900, withoutEnlargement: true })
        .blur(18)
        .jpeg({ quality: 65 })
        .toBuffer();
      blurredImage = `data:image/jpeg;base64,${processed.toString('base64')}`;
    } catch {
      return res.status(400).json({ message: 'Invalid evidence image' });
    }
  }

  const log = await DecisionLog.create({
    userId: req.userId,
    domain: domain.slice(0, 253),
    category,
    decision,
    imageData: blurredImage,
    pageUrl: typeof pageUrl === 'string' ? pageUrl.slice(0, 2000) : undefined,
    pageTitle: typeof pageTitle === 'string' ? pageTitle.slice(0, 300) : undefined,
    field: typeof field === 'string' ? field.slice(0, 80) : undefined,
    evidenceStatus: blurredImage ? 'captured' : 'unavailable'
  });
  return res.status(201).json({
    domain: log.domain,
    category: log.category,
    decision: log.decision,
    imageData: log.imageData,
    pageUrl: log.pageUrl,
    pageTitle: log.pageTitle,
    field: log.field,
    evidenceStatus: log.evidenceStatus,
    timestamp: log.timestamp
  });
});

export default router;
