import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const BANNER_KEY = 'app:banner';

app.post("/banner",async (req, res) => {

    await redis.set(BANNER_KEY, req.body.message || "Welcome to our website");
    res.status(200).json({ 
        message: "Banner message set successfully" ,
        success:true
    });

})

app.get("/banner",async (req, res) => {
    const message = await redis.get(BANNER_KEY);
    if (message === null) {
        return res.status(404).json({ 
            message: "No banner message found" ,
            success:false
        });
    }
    res.status(200).json({ 
        message: message || "Welcome to our website" ,
        success:true
    }); 
})

app.delete("/banner",async (req, res) => {
    await redis.del(BANNER_KEY);
    res.status(200).json({ 
        message: "Banner message deleted successfully" ,
        success:true
    });
})

app.get("/banner/exists",async (req, res) => {
    
    const message = await redis.exists(BANNER_KEY);
    res.status(200).json({ 
        exists:message ,
        success:true
    }); 
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})
