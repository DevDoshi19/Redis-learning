import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();

// in redis we create a client 
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
// same as creating a connection to mongodb
const url = process.env.MONGO_URL || 'mongodb://localhost:27017/mongo_learning'

// created a end point to check if redis is working or not
app.get('/redis', async (req, res) => {
    const reply = await redis.ping(); // ping command is used to check if redis is working or not
    redis.set('key', 'value'); // set command is used to set a key value pair in redis
    const key = await redis.get('key'); // get command is used to get the value of a key in redis
    res.json({ redis: reply ,key :key});
})

// creating a end point to check if mongodb is working or not
app.get('/mongo', async (req, res) => {
    // check if mongodb is connected or not
    try {
        if (!mongoose.connection.readyState) {
            await mongoose.connect(url);
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        return res.status(500).json({ error: 'Failed to connect to MongoDB' });
    }

    res.status(200).json({ mongo: 'connected' ,database:mongoose.connection.name});
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

