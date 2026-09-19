import Redis from "ioredis";

const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

subscriber.subscribe('notifications',(err)=>{
    if(err){
        console.error("Failed to subscribe to email channel", err);
        return;
    }else{
        console.log("Subscribed to email channel successfully");
    }
})

subscriber.on('notifications', (channel, message)=>{
    const job = JSON.parse(message);
    // simulate email sending
    console.log("Recive on ", channel, "message: ", job);
});
