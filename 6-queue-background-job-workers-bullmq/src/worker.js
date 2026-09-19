import { Job, Worker } from "bullmq";
import {connection} from './queue.js';

// worker take 3 things : 
// 1. name of the queue
// 2. a function that will process the job ( logic to process the job or business logic to process the job )
// 3. connection to the redis server ( we can pass the connection object to the worker so that it can connect to the redis server and process the job )
// 4. options (optional) : we can pass options to the worker like concurrency, lockDuration, etc.
const worker = new Worker(
    'emails',
    async(job) => {
        console.log("processing email job.. ",job.id,job.name,job.data);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate email sending delay
        console.log("email job processed successfully");
    },
    {connection}
)

worker.on('completed', (job) => {
    console.log(`Job ${job.id}, ${job.name}, ${job.data} has completed!`);
})

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id}, ${job.name}, ${job.data} has failed with error: ${err.message}`);
})