import express from 'express';
import Redis from 'ioredis';
import { emailQueue } from './queue.js';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post("/welcome-email", async (req,res)=>{
    const job = await emailQueue.add('send-welcome-email', {
        to:req.body.to,
        subject: req.body.subject || 'Welcome to our service',
        body: req.body.body || 'Thank you for signing up for our service!'
    },{
        attempts: 3, // number of attempts to process the job if it fails
        backoff:{
            type:"exponential", // type of backoff strategy
            delay: 1000 // delay in milliseconds before retrying the job
        }
    });
    res.json({
        message: "Welcome email job added to queue successfully",
        queued:true,
        job: job
    });
})

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
})