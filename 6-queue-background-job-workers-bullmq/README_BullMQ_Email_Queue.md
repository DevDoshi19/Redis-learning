# BullMQ Email Queue — Basic Learning Project

## Overview

This project demonstrates how to use **BullMQ + Redis** to add email jobs to a queue and process them asynchronously with a worker.

Files:
- `api.js` — Express API that adds email jobs.
- `queue.js` — Creates the BullMQ queue and Redis connection.
- `worker.js` — Processes queued jobs.

> The worker currently simulates email sending with a 1-second delay.

## Architecture

```text
Client
  |
  v
Express API
  |
  | emailQueue.add(...)
  v
Redis + BullMQ Queue
  |
  v
Worker
  |
  v
Process email job
```

## Installation

```bash
npm install express bullmq
```

Redis must be running at:

```text
localhost:6379
```

## API Endpoint

### Add a welcome email job

```http
POST /welcome-email
```

Request body:

```json
{
  "to": "dev@example.com",
  "subject": "Welcome!",
  "body": "Thanks for signing up."
}
```

The API adds a job using:

```javascript
await emailQueue.add(
    "send-welcome-email",
    {
        to: req.body.to,
        subject: req.body.subject || "Welcome to our service",
        body: req.body.body || "Thank you for signing up!"
    },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000
        }
    }
);
```

## Important BullMQ Concepts

### Queue

A Queue adds jobs to Redis:

```javascript
const emailQueue = new Queue("emails", { connection });
```

### Job

A job contains a name, data, options, and metadata:

```javascript
await emailQueue.add("send-welcome-email", {
    to: "dev@example.com"
});
```

### Worker

A Worker reads and processes jobs:

```javascript
const worker = new Worker(
    "emails",
    async (job) => {
        console.log(job.id, job.name, job.data);
    },
    { connection }
);
```

### Attempts

```javascript
attempts: 3
```

Allows the job to be attempted up to three times if processing fails.

### Exponential Backoff

```javascript
backoff: {
    type: "exponential",
    delay: 1000
}
```

Increases the delay between retry attempts.

### Worker Events

```javascript
worker.on("completed", (job) => {
    console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
    console.log("Job failed:", job?.id, err.message);
});
```

## Running the Project

Use separate terminals:

```bash
node api.js
```

```bash
node worker.js
```

Then call:

```http
POST http://localhost:3000/welcome-email
```

The API adds the job, and the worker processes it.

## Why Use a Queue?

Without a queue:

```text
API -> Send email -> Return response
```

With a queue:

```text
API -> Add job -> Return response
             |
             v
          Worker -> Send email
```

Queues are useful for:
- Sending emails
- Processing images
- Generating reports
- Sending notifications
- Background tasks
- Retryable operations

## Learning Notes

- Redis stores BullMQ queue data.
- API and worker can run as separate processes.
- Queues decouple request handling from background work.
- Workers can retry failed jobs.
- The worker must be running to process jobs.
- The current project does not send real emails.
- A failed job should throw an error so BullMQ can retry it.

Example:

```javascript
throw new Error("Email provider failed");
```

## Practice Questions

1. What is the difference between a Queue and a Worker?
2. Why should email sending happen in a worker?
3. What happens if the worker is offline?
4. What does `attempts: 3` mean?
5. Why use exponential backoff?
6. What is stored in `job.data`?
7. What happens when the worker throws an error?
8. Can multiple workers process the same queue?
9. Why does BullMQ need Redis?
10. What is background processing?

## Future Improvements

- Validate the recipient email.
- Integrate a real email provider.
- Add job status endpoints.
- Configure worker concurrency.
- Add graceful shutdown.
- Add monitoring and metrics.
- Configure job retention.
- Use environment variables for configuration.

## Main Takeaway

**BullMQ uses Redis to manage background jobs.** The API adds work to a queue, and a worker processes that work independently with retry support.

## Author

**Dev Doshi**
