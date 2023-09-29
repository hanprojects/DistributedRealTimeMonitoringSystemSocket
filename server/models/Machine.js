const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Machine = new Schema({
  macAddresss: String,
  systemExecutionLoad: Number,
  freeMemory: Number,
  totalMemory: Number,
  usedMem: Number,
  memUseage: Number,
  osName: String,
  upTime: Number,
  cpuArch: String,
  cores: Number,
  executionSpeed: Number,
});

module.exports = mongoose.model('Machine', Machine);
