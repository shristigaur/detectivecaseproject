import mongoose from 'mongoose';

const decisionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true, trim: true },
  pageUrl: { type: String, trim: true },
  pageTitle: { type: String, trim: true },
  field: { type: String, trim: true },
  category: { type: String, required: true },
  decision: { type: String, enum: ['allowed', 'blocked', 'redacted'], required: true },
  imageData: { type: String, select: false },
  evidenceStatus: { type: String, enum: ['captured', 'unavailable'], default: 'unavailable' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('DecisionLog', decisionLogSchema);
