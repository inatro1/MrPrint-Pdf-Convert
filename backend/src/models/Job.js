const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: String,
  filePath: String,
  resultPath: String,
  status: { type: String, enum: ['queued','processing','done','failed'], default: 'queued' },
  progress: { type: Number, default: 0 },
  error: { type: String },
  cloudconvertJobId: String,
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
