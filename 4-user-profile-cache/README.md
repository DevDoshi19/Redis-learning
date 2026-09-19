# Redis User Profile Cache — Learning README

## Project Overview

A beginner-friendly Express.js and Redis project exploring two ways to store user profile data:

1. **JSON String:** Store a complete object using `SET` and `GET`.
2. **Redis Hash:** Store individual fields using `HSET`, `HGET`, and `HGETALL`.

Technologies:
- Node.js
- Express.js
- Redis
- ioredis
- Postman

---

## Learning Goals

- Understand Redis Strings and Hashes.
- Use `JSON.stringify()` and `JSON.parse()`.
- Store, retrieve, update, and delete hash fields.
- Understand Redis TTL and key-level expiration.
- Understand Redis data types and Node.js Buffers.
- Choose a Redis data structure based on access patterns.

---

## JSON String Storage

### Store

```javascript
const key = `user:${userId}:json`;

await redis.set(key, JSON.stringify(req.body));
```

### Retrieve

```javascript
const raw = await redis.get(key);
const data = raw ? JSON.parse(raw) : null;
```

### Advantages

- Simple to implement.
- Supports nested objects and arrays.
- Good for complete API-response caching.
- Convenient when reading or replacing the whole object.

### Disadvantages

- Updating one field usually requires rewriting the whole object.
- Requires serialization and parsing.
- Ordinary Redis `GET` cannot access an individual JSON field.
- Concurrent whole-object updates can overwrite each other.

---

## Redis Hash Storage

### Store

```javascript
const key = `user:${userId}:hash`;

await redis.hset(key, {
    name: "Dev",
    age: "20",
    city: "Ahmedabad"
});
```

### Retrieve all fields

```javascript
const user = await redis.hgetall(key);
```

### Advantages

- Supports field-level reads and updates.
- Useful for flat objects.
- Avoids serializing the complete profile.
- Good for metadata, settings, and counters.

### Disadvantages

- Values are generally returned as strings.
- Numbers and booleans need conversion.
- Nested objects need encoding or another data model.
- TTL applies to the hash key, not individual fields.

---

## JSON String vs Hash

| Feature | JSON String | Redis Hash |
|---|---|---|
| Redis type | String | Hash |
| Read one field | Parse whole value | `HGET` |
| Update one field | Usually rewrite object | `HSET` |
| Read all data | `GET` | `HGETALL` |
| Nested objects | Naturally supported | Requires encoding |
| Expiration | Key-level | Key-level |
| Best for | Whole-object cache | Flat structured records |

There is no universal winner. Choose based on how the application reads and updates data.

---

# Redis String Commands

## SET

```javascript
await redis.set("name", "Dev");
```

## GET

```javascript
const value = await redis.get("name");
```

Returns `null` when the key does not exist.

## SET with expiration

```javascript
await redis.set("session:101", "active", "EX", 60);
```

## MSET

```javascript
await redis.mset(
    "firstName", "Dev",
    "city", "Ahmedabad"
);
```

## MGET

```javascript
const values = await redis.mget(
    "firstName",
    "city"
);
```

## SET with NX

Set only if the key does not already exist:

```javascript
const result = await redis.set(
    "lock:resource",
    "1",
    "EX",
    30,
    "NX"
);
```

## INCR / DECR

```javascript
await redis.incr("counter");
await redis.decr("counter");
```

## APPEND

```javascript
await redis.append("message", " world");
```

## STRLEN

```javascript
const length = await redis.strlen("message");
```

## DEL

```javascript
await redis.del("name");
```

## EXISTS

```javascript
const exists = await redis.exists("name");
```

## TYPE

```javascript
const type = await redis.type("user:101:hash");
```

Possible results include `string`, `hash`, `list`, `set`, `zset`, and `none`.

---

# Redis Hash Commands

Assume this hash exists:

```text
user:101:hash

name -> Dev
age  -> 20
city -> Ahmedabad
```

## HSET

Create or update fields:

```javascript
await redis.hset(key, "name", "Dev");
```

Multiple fields:

```javascript
await redis.hset(key, {
    name: "Dev",
    age: "20",
    city: "Ahmedabad"
});
```

## HGET

Read one field:

```javascript
const name = await redis.hget(key, "name");
```

## HMGET

Read multiple fields:

```javascript
const values = await redis.hmget(
    key,
    "name",
    "city"
);
```

## HGETALL

Read all fields:

```javascript
const user = await redis.hgetall(key);
```

## HEXISTS

Check whether a field exists:

```javascript
const exists = await redis.hexists(key, "email");
```

Returns `1` or `0`.

## HDEL

Delete one or more fields:

```javascript
await redis.hdel(key, "city");
```

This removes the field, not necessarily the entire hash.

## HLEN

```javascript
const count = await redis.hlen(key);
```

Returns the number of fields.

## HKEYS

```javascript
const fields = await redis.hkeys(key);
```

Returns all field names.

## HVALS

```javascript
const values = await redis.hvals(key);
```

Returns all field values.

## HINCRBY

```javascript
await redis.hincrby(key, "loginCount", 1);
```

Increments an integer field.

## HINCRBYFLOAT

```javascript
await redis.hincrbyfloat(key, "rating", 0.5);
```

Increments a floating-point field.

## HSETNX

```javascript
await redis.hsetnx(
    key,
    "createdAt",
    "2026-09-18"
);
```

Sets a field only if it does not already exist.

---

# TTL and Expiration Commands

## EXPIRE

```javascript
await redis.expire(key, 60);
```

Sets expiration in seconds.

## PEXPIRE

```javascript
await redis.pexpire(key, 60000);
```

Sets expiration in milliseconds.

## TTL

```javascript
const ttl = await redis.ttl(key);
```

Return values:

| Value | Meaning |
|---|---|
| Positive number | Remaining seconds |
| `-1` | Key exists without expiration |
| `-2` | Key does not exist |

## PTTL

```javascript
const ttl = await redis.pttl(key);
```

Returns remaining time in milliseconds.

## PERSIST

```javascript
await redis.persist(key);
```

Removes expiration from the key.

## EXPIRETIME

```javascript
const expiry = await redis.expiretime(key);
```

Returns the expiration Unix timestamp when supported.

**Important:** TTL applies to the Redis key, not each individual hash field.

---

# Redis Data Types

| Data type | Typical use |
|---|---|
| String | Text, JSON, counters, tokens |
| Hash | Flat object-like records |
| List | Queues and ordered collections |
| Set | Unique values and membership |
| Sorted Set | Rankings and leaderboards |
| Stream | Events and message processing |
| Bitmap | Bit-level flags |
| HyperLogLog | Approximate unique counts |
| Geospatial | Location and distance queries |

---

# Strings, JSON, and Buffer

## JSON

```javascript
const text = JSON.stringify({ name: "Dev" });
const object = JSON.parse(text);
```

- `JSON.stringify()` converts an object into a JSON string.
- `JSON.parse()` converts JSON text into a JavaScript value.

## Buffer

A Node.js `Buffer` represents raw bytes:

```javascript
const buffer = Buffer.from("Hello");
console.log(buffer);

const text = buffer.toString("utf8");
```

ioredis supports buffer-returning methods:

```javascript
const value = await redis.getBuffer("key");
```

Use Buffers when working with binary data. For ordinary user profiles, JSON strings or hashes are easier.

---

# Common Debugging Problems

## JSON response returns a string

Instead of:

```javascript
data: raw
```

Use:

```javascript
data: raw ? JSON.parse(raw) : null
```

## Hash numbers return as strings

```javascript
const user = await redis.hgetall(key);
const age = Number(user.age);
```

## TTL returns -2

Possible reasons:

- Key expired.
- Key was deleted.
- Wrong key was used.
- Redis connection or database is different.
- Key was never created.

Debug:

```javascript
console.log("Key:", key);
console.log("Type:", await redis.type(key));
console.log("Exists:", await redis.exists(key));
console.log("TTL:", await redis.ttl(key));
```

## Hash field is missing

```javascript
console.log(await redis.hgetall(key));
```

Or:

```javascript
const exists = await redis.hexists(key, "email");
```

---

# Cache-Aside Pattern

Redis is often used as a cache in front of a database:

```text
Request
   |
   v
Check Redis
   |
   +-- Cache hit ---> Return cached data
   |
   +-- Cache miss --> Read database
                         |
                         v
                    Store in Redis
                         |
                         v
                    Return response
```

Redis should not automatically be treated as the primary database. The correct approach depends on consistency and failure requirements.

---

# Testing Checklist

- [ ] Store a profile as JSON.
- [ ] Read and parse the JSON profile.
- [ ] Store a profile as a Hash.
- [ ] Read one field with `HGET`.
- [ ] Read all fields with `HGETALL`.
- [ ] Check a field using `HEXISTS`.
- [ ] Delete a field using `HDEL`.
- [ ] Update a field using `HSET`.
- [ ] Increment a numeric field using `HINCRBY`.
- [ ] Set and check TTL.
- [ ] Test missing keys.
- [ ] Check the Redis data type using `TYPE`.
- [ ] Experiment with `GET` and `GETBUFFER`.

---

# Practice Questions

1. What is the difference between a Redis String and Hash?
2. Why do we use `JSON.stringify()`?
3. Why do we use `JSON.parse()`?
4. What happens when `GET` is called for a missing key?
5. What is the difference between `HGET` and `HGETALL`?
6. What does `HDEL` remove?
7. What does `HEXISTS` return?
8. Can ordinary Redis Hash commands set TTL on individual fields?
9. Why are hash numbers usually returned as strings?
10. What is the difference between `TTL` and `PTTL`?
11. What is the difference between `EXPIRE` and `PERSIST`?
12. Why can TTL return `-2`?
13. When would you choose JSON over a Hash?
14. When would you choose a Hash over JSON?
15. What is a Node.js Buffer?
16. What is the difference between a Redis String and JavaScript String?
17. What can happen when two clients update the same JSON object concurrently?
18. What happens when one hash field is deleted?

---

# Future Learning Roadmap

1. Redis Lists and queues.
2. Redis Sets.
3. Sorted Sets.
4. Counters and atomic operations.
5. Cache-aside pattern.
6. Cache invalidation.
7. Redis transactions: `MULTI` and `EXEC`.
8. Pipelining.
9. Pub/Sub.
10. Redis Streams.
11. Distributed locks.
12. Redis persistence and memory management.
13. Redis integration with authentication.

---

## Main Takeaway

Use **JSON Strings** when you usually need the complete object. Use **Hashes** when you need field-level access and updates.

Choose the Redis data structure based on your application's access pattern.

## Author

**Dev Doshi**

Learning backend development with Node.js, Express.js, Redis, and system design.
