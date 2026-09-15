import mongoose from 'mongoose';

const policyRuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    required: true,
    enum: ['email', 'phone_number', 'card_number', 'address', 'id_document']
  },
  action: { type: String, enum: ['allow', 'warn', 'block'], default: 'warn' },
  active: { type: Boolean, default: false }
});

policyRuleSchema.index({ userId: 1, category: 1 }, { unique: true });

export default mongoose.model('PolicyRule', policyRuleSchema);
