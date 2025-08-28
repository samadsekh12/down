// server.js
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(cors());
app.use(express.json());

app.use(rateLimit({ windowMs: 60_000, max: 60 }));

// Demo: platform detector
function detect(url){
  const u = url.toLowerCase();
  if(/youtu\.be|youtube\.com/.test(u)) return 'youtube';
  if(/facebook\.com/.test(u)) return 'facebook';
  if(/instagram\.com/.test(u)) return 'instagram';
  if(/twitter\.com|x\.com/.test(u)) return 'twitter';
  if(/tiktok\.com/.test(u)) return 'tiktok';
  if(/linkedin\.com/.test(u)) return 'linkedin';
  if(/vimeo\.com/.test(u)) return 'vimeo';
  if(/dai\.ly|dailymotion\.com/.test(u)) return 'dailymotion';
  if(/sharechat\.com/.test(u)) return 'sharechat';
  if(/roposo\.com/.test(u)) return 'roposo';
  return 'unknown';
}

// GET /api/analyze?url=&platform=&format=&quality=
app.get('/api/analyze', async (req, res) => {
  const { url, platform = 'auto', format = 'auto', quality = 'best' } = req.query;
  if(!url) return res.status(400).json({ error: 'Missing url' });
  const plat = platform === 'auto' ? detect(url) : platform;
  if(plat === 'unknown') return res.status(400).json({ error: 'Unsupported platform' });

  // TODO: Replace with real extractor/links. This is a mock response shape.
  const base = [
    { id:`${plat}-360p`, type:'video', container:'mp4', quality:'360p', hasAudio:true, size:50*1024*1024 },
    { id:`${plat}-720p`, type:'video', container:'mp4', quality:'720p', hasAudio:true, size:120*1024*1024 },
    { id:`${plat}-1080p`, type:'video', container:'mp4', quality:'1080p', hasAudio:true, size:220*1024*1024 },
    { id:`${plat}-2160p`, type:'video', container:'mp4', quality:'2160p', hasAudio:true, size:900*1024*1024 },
    { id:`${plat}-mp3-128`, type:'audio', container:'mp3', quality:'128 kbps', hasAudio:true, size:10*1024*1024 },
    { id:`${plat}-mp3-320`, type:'audio', container:'mp3', quality:'320 kbps', hasAudio:true, size:22*1024*1024 },
  ];

  let streams = base;
  if(format !== 'auto'){
    streams = streams.filter(s => format === 'mp3' ? s.container === 'mp3' : s.container === 'mp4');
  }
  if(quality !== 'best'){
    streams = streams.filter(s => s.quality === quality);
    if(!streams.length) streams = base;
  }

  res.json({
    platform: plat,
    title: `Sample from ${plat.toUpperCase()}`,
    thumb: `https://picsum.photos/seed/${encodeURIComponent(plat)}/160/90`,
    streams
  });
});

// GET /api/download?id=
app.get('/api/download', async (req, res) => {
  const { id } = req.query;
  if(!id) return res.status(400).send('Missing id');

  // TODO: Replace with a real signed URL or stream the binary.
  // For demo, download a tiny text file.
  res.setHeader('Content-Disposition', `attachment; filename="${id}.txt"`);
  res.setHeader('Content-Type', 'text/plain');
  res.send(`This simulates downloading stream: ${id}\nReplace with real binary stream or redirect.`);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
