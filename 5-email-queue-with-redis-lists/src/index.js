import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const QUEUE_KEY = 'queue:email';

// in queue we insert job (job is just a data or it technical way of saying a task) in the queue and then we process the job in the queue by a worker (worker is just a process that runs in the background and process the job in the queue) and then we remove the job from the queue after processing it.
app.post('/email', async (req, res) => {

    const job = {
        to: req.body.to,
        subject : req.body.subject || 'No subject',
        body: req.body.body || 'No content',
        createdAt: new Date().toISOString()
    }

    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    res.status(200).json({
        message: "Email job added to queue successfully",
        queued:true,
        job: job
    });
})

app.get("/email/process-one", async (req, res) => {

    const rawJob = await redis.rpop(QUEUE_KEY);
    if(!rawJob){
        return res.status(200).json({
            message: "No email job found in queue",
            queued:false,
            job: null
        });
    }
    const job = JSON.parse(rawJob);
    //simulation email sending
    console.log(`Sending email to ${job.to} with subject ${job.subject} and body ${job.body}`);
    res.status(200).json({
        message: "Email job processed successfully",
        queued:true,
        job: job
    });

})

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
});

