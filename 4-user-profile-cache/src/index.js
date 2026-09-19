import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.get("/", async (req, res) => {
    res.status(200).json({
        message: "Welcome to the User Profile Cache service",
        success:true
    });
});

// store the data in redis as a json string , but we usally store the data in redis as a hash, so we can use the hset and hgetall commands to store and retrieve the data
// we don't modify the strings in redis and also need to convert the data to json when we retrieve it.
app.post("/user/:id/json", async (req,res)=>{
    await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));
    res.status(200).json({
        message: "User profile cached successfully",
        success:true,
    });
})

app.get("/user/:id/json", async (req,res)=>{
    const raw = await redis.get(`user:${req.params.id}:json`);
    res.status(200).json({
        message: "User profile found in cache",
        success:true,
        // data: raw ? JSON.parse(raw) : null
        data: raw 
    });
})

app.post("/user/:id/hash", async (req,res)=>{

    await redis.hset(`user:${req.params.id}:hash`, req.body);
    res.status(200).json({
        message: "User profile cached successfully",
        success:true,
    });

})

app.get("/user/:id/hash", async (req,res)=>{
    const raw = await redis.hgetall(`user:${req.params.id}:hash`);
    res.status(200).json({
        message: "User profile found in cache",
        success:true,
        data: raw
    });
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

