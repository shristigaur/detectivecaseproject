import { Router } from 'express';
import PolicyRule from '../models/PolicyRule.js';

const router = Router();
const categories = ['email', 'phone_number', 'card_number', 'address', 'id_document'];
const actions = ['allow', 'warn', 'block'];

router.get('/', async (req, res) => {
  const rules = await PolicyRule.find({ userId: req.userId }).select('category action active -_id').lean();
  rules.forEach((rule) => { if (rule.active === undefined) rule.active = true; });
  return res.json(rules);
});

router.post('/', async (req, res) => {
  const { category, action, active } = req.body;
  if (!categories.includes(category) || !actions.includes(action)) {
    return res.status(400).json({ message: 'Invalid category or action' });
  }
  if (active !== undefined && typeof active !== 'boolean') {
    return res.status(400).json({ message: 'Active must be a boolean' });
  }

  const existingRule = await PolicyRule.findOne({ userId: req.userId, category }).lean();

  const rule = await PolicyRule.findOneAndUpdate(
    { userId: req.userId, category },
    { action, active: active ?? existingRule?.active ?? false },
    { new: true, upsert: true, runValidators: true }
  );
  return res.status(201).json(rule);
});

router.put('/:id', async (req, res) => {
  const { action } = req.body;
  if (!actions.includes(action)) return res.status(400).json({ message: 'Invalid action' });

  const rule = await PolicyRule.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { action },
    { new: true, runValidators: true }
  );
  if (!rule) return res.status(404).json({ message: 'Policy rule not found' });
  return res.json(rule);
});

export default router;
