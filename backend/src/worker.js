const Queue = require('bull');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const JobModel = require('./models/Job');
const cloudconvert = require('./services/cloudconvertService');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const workQueue = new Queue('convert', redisUrl);

workQueue.process(async (job, done) => {
  const jobId = job.data.jobId;
  const jobDoc = await JobModel.findById(jobId);
  if(!jobDoc) return done(new Error('Job doc não existe'));

  try{
    jobDoc.status = 'processing';
    jobDoc.progress = 10;
    await jobDoc.save();

    const inputPath = jobDoc.filePath;
    const outName = path.basename(inputPath).replace(/\.pdf$/i,'.docx');
    const outputPath = path.join(process.env.STORAGE_PATH || path.join(__dirname,'..','..','storage'), 'out-' + outName);

    await cloudconvert.convertPdfToDocx(inputPath, outputPath);

    jobDoc.resultPath = outputPath;
    jobDoc.status = 'done';
    jobDoc.progress = 100;
    await jobDoc.save();

    done();
  }catch(err){
    console.error('Worker error:', err);
    jobDoc.status = 'failed';
    jobDoc.error = err.message;
    await jobDoc.save();
    done(err);
  }
});

console.log('Worker started — listening to convert queue');
