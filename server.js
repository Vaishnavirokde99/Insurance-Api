const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { Worker } = require('worker_threads');
const os = require('os');
const { exec } = require('child_process');
const schedule = require('node-schedule');
const path = require('path');

// Models
const Agent = require('./models/Agent');
const User = require('./models/User');
const Account = require('./models/Account');
const Category = require('./models/Category');
const Carrier = require('./models/Carrier');
const Policy = require('./models/Policy');

// Express setup
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/insuranceDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

// Endpoint to upload CSV/XLSX
app.post('/upload', upload.single('file'), (req, res) => {
    const worker = new Worker(path.resolve(__dirname, './workers/uploadWorker.js'), {
        workerData: {
            filePath: req.file.path,
        },
    });

    worker.on('message', (msg) => {
        res.status(200).json({ message: msg });
    });

    worker.on('error', (error) => {
        res.status(500).json({ error: error.message });
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: `Worker stopped with exit code ${code}` });
        }
    });
});

// Endpoint to search policy info by username
app.get('/policy-info/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ firstName: username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const policies = await Policy.find({ userId: user._id }).populate('categoryId companyId');
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to aggregate policy by each user
app.get('/aggregated-policy', async (req, res) => {
    try {
        const aggregatedData = await Policy.aggregate([
            { $group: { _id: "$userId", totalPolicies: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
            { $unwind: "$userDetails" },
            { $project: { userId: "$_id", totalPolicies: 1, userDetails: { firstName: 1, email: 1 } } },
        ]);

        res.json(aggregatedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to schedule a message insertion
app.post('/schedule-message', async (req, res) => {
    const { message, day, time } = req.body;

    const [hour, minute] = time.split(':').map(Number);
    const scheduleTime = new Date(day);
    scheduleTime.setHours(hour, minute);

    schedule.scheduleJob(scheduleTime, () => {
        console.log(`Inserting message: ${message}`);
        // Implement message insertion logic here, e.g., save to MongoDB
    });

    res.json({ message: `Message scheduled for ${scheduleTime}` });
});

// Monitor CPU usage and restart server if usage exceeds 70%
function monitorCPUUsage() {
    const cpuUsage = os.loadavg()[0];
    const numCPUs = os.cpus().length;
    const cpuPercentage = (cpuUsage / numCPUs) * 100;

    if (cpuPercentage > 70) {
        console.log(`High CPU usage detected: ${cpuPercentage}%. Restarting server...`);
        exec('pm2 restart insurance-api');
    }
}

setInterval(monitorCPUUsage, 10000);

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
