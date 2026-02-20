// server.js (FINAL MERGED VERSION)

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Load env

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const Job = require('./models/job');          // Job model
const { connectDB } = require('./config/db');  // MongoDB connection (job-portal)

// 🔐 Auth routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   MIDDLEWARES
====================== */
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ======================
   STATIC FILES
====================== */
app.use('/JOB2-main', express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

/* ======================
   AUTH ROUTES (NEW)
====================== */
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

// Direct verify route for email links
app.get('/verify/:token', require('./controllers/auth.controller').verifyEmail);


/* ======================
   JOB ROUTES (UNCHANGED)
====================== */

// GET all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    await connectDB();
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: err.message, details: 'Database connection error' });
  }
});

// GET single job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE job
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, category, companyName, location, description } = req.body;

    console.log('🔵 POST - Full req.body:', JSON.stringify(req.body, null, 2));
    console.log('🔵 POST - Description field:', description);

    if (!title || !category || !companyName || !location) {
      return res.status(400).json({
        error: 'Title, category, company name, and location are required'
      });
    }

    const job = new Job(req.body);
    console.log('🔵 POST - Job before save:', job);
    const savedJob = await job.save();
    console.log('🔵 POST - Job after save:', savedJob.toObject());
    console.log('🔵 POST - Job description after save:', savedJob.description);

    res.json({ message: 'Job saved successfully!', job: savedJob.toObject() });
  } catch (err) {
    console.error('❌ POST Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { title, category, companyName, location, description } = req.body;

    console.log('UPDATE - Received data:', req.body);
    console.log('UPDATE - Description:', req.body.description);

    if (!title || !category || !companyName || !location) {
      return res.status(400).json({
        error: 'Title, category, company name, and location are required'
      });
    }

    const updateData = req.body;

    console.log('UPDATE - Update data:', updateData);

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: false }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('UPDATE - Updated job:', updatedJob);
    console.log('UPDATE - Updated job description:', updatedJob.description);

    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   FALLBACK (Frontend)
====================== */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
  } catch (err) {
    console.error('Error serving home.html:', err);
    res.status(500).send('Server error');
  }
});

/* ======================
   SERVER START
====================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
