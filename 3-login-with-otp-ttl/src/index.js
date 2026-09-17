import express from 'express';
import Redis from 'ioredis';
import { randomInt } from 'crypto';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otpkey(phoneNumber) {
    return `otp:${phoneNumber}`;
}

function genrateOTP() {
    // const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generate a random 6 digit otp
    const otp = randomInt(100000, 1000000).toString(); // better cryptographically secure way to generate a random 6 digit otp
    const key = otpkey(phoneNumber);
    const result = await redis.set(key,otp,'EX', 60); // set the otp in redis with a ttl of 30 seconds
    
    console.log("Generated key:", key);

    const ttl = await redis.ttl(key);
    console.log("TTL after setting:", ttl);
    return otp;
}

app.get("/", async (req, res) => {
    res.status(200).json({
        message: "Welcome to the OTP service",
        success:true
    });
});

app.post("/otp", async (req,res)=>{
    const {phoneNumber} = req.body;

    const otp = genrateOTP(phoneNumber);

    res.status(200).json({
        message: "OTP sent successfully",
        success:true,
        otp:otp
    });

});

app.post("/otp/verify", async (req,res)=>{
    const {phoneNumber, otp} = req.body;
    const savedOTP = await redis.get(otpkey(phoneNumber));
    if(!savedOTP){
        return res.status(400).json({
            message: "OTP expired or not found",
            success:false
        });
    }
    if (savedOTP !== String(otp)){
        return res.status(400).json({
            message: "Invalid OTP",
            success:false
        });
    }
    await redis.del(otpkey(phoneNumber)); // delete the otp from redis
    res.status(200).json({
        message: "OTP verified successfully",
        success:true
    });
    

});

app.post("/otp/resend", async (req,res)=>{
    const {phoneNumber} = req.body;
    const otp = genrateOTP(phoneNumber);

    res.status(200).json({
        message: "OTP resent successfully",
        success:true,
        otp:otp
    });

});

app.get("/otp/:phoneNumber/ttl", async (req,res)=>{
    const {phoneNumber} = req.params;
    const ttl = await redis.ttl(otpkey(phoneNumber));

    res.status(200).json({
        message: "OTP TTL retrieved successfully",
        success:true,
        ttl:ttl
    });

});

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
})