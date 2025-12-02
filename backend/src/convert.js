const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const Job = require('./models/Job');
const auth = require('./middlewares/authMiddleware');
const Queue = require('bull');

const storagePath = process.env.STORAGE_PATH || path.join(__dirname,'..','..','storage');
if(!fs.existsSync(storagePath)) fs.mkdirSync(storagePath, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: function(req,file,cb){ cb(null, storagePath); },
    filename: function(req,file,cb){ cb(null, uuid.v4() + path.extname(file.originalname)); }
  }),
  limits: { fileSize: (process.env.MAX_UPLOAD_MB || 50) * 1024 * 1024 }
});

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const convertQueue = new Queue('convert', redisUrl);

router.post('/jobs', auth, upload.single('file'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
    if(req.file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Apenas PDFs são suportados' });

    const jobDoc = new Job({
      userId: req.user._id,
      originalName: req.file.originalname,
      filePath: req.file.path,
      status: 'queued',
      progress: 0
    });
    await jobDoc.save();

    await convertQueue.add({ jobId: jobDoc._id.toString() }, { attempts: 3, backoff: 10000 });

    res.json({ id: jobDoc._id, status: jobDoc.status });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar job' });
  }
});

router.get('/jobs', auth, async (req,res)=>{
  const jobs = await Job.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(jobs);
});

router.get('/jobs/:id/download', auth, async (req,res)=>{
  const job = await Job.findById(req.params.id);
  if(!job) return res.status(404).json({ error: 'Job não encontrado' });
  if(job.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Acesso negado' });
  if(job.status !== 'done') return res.status(400).json({ error: 'Resultado ainda não disponível' });
  res.download(job.resultPath, job.originalName.replace(/\.pdf$/i,'') + '.docx');
});

module.exports = router;
