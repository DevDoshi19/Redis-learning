# Redis Learning 🚀

A hands-on repository for learning **Redis with Node.js, Express.js, ioredis, BullMQ, and MongoDB** through small practical projects.

The goal is to understand not only Redis commands, but also **when and why Redis is useful in real backend systems**.

## 📚 Learning Roadmap

| # | Project | Concepts |
|---|---|---|
| 1 | Redis + MongoDB Setup | Redis connection, `PING`, `SET`, `GET`, MongoDB connection |
| 2 | Site Banner | `SET`, `GET`, `DEL`, `EXISTS`, key naming |
| 3 | Login with OTP + TTL | Temporary data, OTP verification, `TTL`, expiration |
| 4 | User Profile Cache | JSON strings, hashes, `HSET`, `HGET`, `HGETALL`, field updates |
| 5 | Email Queue with Redis Lists | Lists, producer/consumer pattern, basic queues |
| 6 | Background Jobs with BullMQ | Queues, jobs, workers, retries, exponential backoff |
| 7 | Redis Pub/Sub | Publishers, subscribers, channels, event delivery |
| 8 | Live Leaderboard | Sorted sets, `ZADD`, `ZINCRBY`, `ZREVRANGE`, `ZREVRANK` |

## 🛠️ Tech Stack

- Node.js
- Express.js
- Redis
- ioredis
- BullMQ
- MongoDB and Mongoose
- Docker / Docker Compose
- Postman

## 📂 Repository Structure

```text
Redis-learning/
├── 1-setup-folder/
├── 2-site-banner/
├── 3-login-with-otp-ttl/
├── 4-user-profile-cache/
├── 5-email-queue-with-redis-lists/
├── 6-queue-background-job-workers-bullmq/
├── 7-pub-sub-with-redis/
├── 8-live-leaderboard-with-redis/
├── docker-compose.yml
└── README.md
```

## 🐳 Start Redis and MongoDB

The repository includes Docker Compose configuration for Redis and MongoDB.

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

Default services:

```text
Redis:    localhost:6379
MongoDB:  localhost:27017
```

Stop the services:

```bash
docker compose down
```

## 🔑 Main Redis Concepts

### Strings

Useful for simple values, JSON, tokens, and counters.

```javascript
await redis.set("name", "Dev");
const name = await redis.get("name");
await redis.incr("views");
```

### TTL and Expiration

Useful for OTPs, sessions, temporary tokens, and cache expiration.

```javascript
await redis.set("otp:123", "456789", "EX", 60);
const ttl = await redis.ttl("otp:123");
```

### Hashes

Useful for structured data and field-level updates.

```javascript
await redis.hset("user:1", {
  name: "Dev",
  age: "19"
});

const user = await redis.hgetall("user:1");
```

### Lists and Queues

Lists can be used to build a basic producer/consumer queue.

```javascript
await redis.lpush("queue:email", JSON.stringify(job));
const rawJob = await redis.rpop("queue:email");
```

### Sorted Sets

Sorted sets are useful for ranking and leaderboards.

```bash
ZADD leaderboard 100 Dev
ZINCRBY leaderboard 50 Dev
ZREVRANGE leaderboard 0 9 WITHSCORES
ZREVRANK leaderboard Dev
```

### Pub/Sub

Pub/Sub allows publishers to send messages to subscribers through channels.

```javascript
await publisher.publish(
  "notifications",
  JSON.stringify(payload)
);
```

Pub/Sub messages are not durable like BullMQ jobs. A subscriber generally needs to be connected when the message is published.

## ⚛️ Atomic Operations

Redis commands such as `INCR` are atomic at the individual-command level.

```bash
INCR views
```

This is safer for concurrent counter updates than performing separate `GET`, application-side calculation, and `SET` operations.

However, atomicity of one command does not automatically make a sequence of commands atomic. Multi-command workflows may require `MULTI/EXEC` or server-side scripting.

## 🧠 Data Structure Selection

| Requirement | Redis Structure |
|---|---|
| Simple value | String |
| Counter | String + `INCR` |
| Structured fields | Hash |
| Temporary data | Key + TTL |
| Basic queue | List |
| Reliable background jobs | BullMQ |
| Real-time broadcasting | Pub/Sub |
| Ranking | Sorted Set |

## 🎯 Learning Method

For each topic, I focus on:

1. What problem does it solve?
2. Which Redis data structure is suitable?
3. How does the operation work?
4. What are its limitations?
5. How can it be used in a real backend project?

## 🚀 Future Goal

After completing the learning playlist, I plan to build a complete next-level backend project combining:

- Node.js and Express.js
- Redis caching
- BullMQ queues and workers
- Background jobs
- Retries and scheduled jobs
- MongoDB as persistent storage
- Docker
- Error handling
- API and worker separation
- Production-oriented backend architecture

## 👨‍💻 Author

**Dev Doshi**

Learning backend engineering through hands-on projects with Node.js, Redis, BullMQ, MongoDB, and Docker.
