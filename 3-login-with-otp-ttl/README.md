# Basic OTP Service with Express and Redis

A beginner-friendly backend project to learn how to generate OTPs, store
them in Redis, verify them, resend them, and work with key expiration
using TTL.

> **Project level:** Beginner\
> **Focus:** Express.js fundamentals + Redis basics\
> **Status:** Learning project, not production-ready authentication

------------------------------------------------------------------------

## 1. Project Overview

This project implements a simple OTP service using:

-   **Node.js**
-   **Express.js**
-   **Redis**
-   **ioredis**

The application supports:

1.  Generate an OTP for a phone number.
2.  Store the OTP in Redis with an expiration time.
3.  Verify the OTP.
4.  Delete the OTP after successful verification.
5.  Resend a new OTP.
6.  Check the remaining TTL of an OTP.

------------------------------------------------------------------------

## 2. Technologies Used

  Technology   Purpose
  ------------ ----------------------------
  Node.js      JavaScript runtime
  Express.js   Build HTTP APIs
  Redis        Store OTPs temporarily
  ioredis      Connect Node.js with Redis
  Postman      Test API endpoints

------------------------------------------------------------------------

## 3. Installation

### Initialize the project

``` bash
npm init -y
```

### Install dependencies

``` bash
npm install express ioredis
```

### Enable ES Modules

Add this to `package.json`:

``` json
{
  "type": "module"
}
```

### Start Redis

The project expects Redis to run locally:

``` text
redis://localhost:6379
```

You can also use a Redis URL through an environment variable:

``` env
REDIS_URL=redis://localhost:6379
```

### Run the server

``` bash
node server.js
```

Expected output:

``` text
Server is running on port 3000
```

------------------------------------------------------------------------

## 4. Redis Key Design

The project uses this function:

``` javascript
function otpkey(phoneNumber) {
    return `otp:${phoneNumber}`;
}
```

For example:

``` text
Phone number: 9876543210
Redis key:    otp:9876543210
```

This is called a **key naming convention**.

It helps us organize related data in Redis.

------------------------------------------------------------------------

## 5. API Endpoints

### 5.1 Health Check

**Request**

``` http
GET /
```

**Response**

``` json
{
  "message": "Welcome to the OTP service",
  "success": true
}
```

------------------------------------------------------------------------

### 5.2 Generate OTP

**Request**

``` http
POST /otp
```

**Body**

``` json
{
  "phoneNumber": "9876543210"
}
```

**Redis operation**

``` javascript
await redis.set(key, otp, "EX", 60);
```

Meaning:

-   `key`: Redis key.
-   `otp`: OTP value.
-   `EX`: Expiration time mode.
-   `60`: Expiration time in seconds.

**Learning point:** Redis automatically removes the key after its TTL
expires.

------------------------------------------------------------------------

### 5.3 Verify OTP

**Request**

``` http
POST /otp/verify
```

**Body**

``` json
{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

**Verification flow**

``` text
Receive phone number and OTP
          |
          v
Create Redis key
          |
          v
Read OTP from Redis
          |
          v
Does OTP exist?
      /       \
    No         Yes
    |           |
Expired     Compare OTP
                |
         --------------
         |            |
       Wrong        Correct
         |            |
      Reject      Delete OTP
                      |
                      v
                Success response
```

The OTP is deleted after successful verification:

``` javascript
await redis.del(otpkey(phoneNumber));
```

This prevents the same OTP from being reused after verification.

------------------------------------------------------------------------

### 5.4 Resend OTP

**Request**

``` http
POST /otp/resend
```

**Body**

``` json
{
  "phoneNumber": "9876543210"
}
```

The resend endpoint generates a new OTP and stores it using the same
Redis key.

Because the key is the same, the new OTP replaces the old OTP.

Example:

``` text
First OTP:
otp:9876543210 -> 123456

Resent OTP:
otp:9876543210 -> 789012
```

The previous OTP is no longer the stored OTP.

------------------------------------------------------------------------

### 5.5 Check OTP TTL

**Request**

``` http
GET /otp/9876543210/ttl
```

**Response**

``` json
{
  "message": "OTP TTL retrieved successfully",
  "success": true,
  "ttl": 45
}
```

The TTL value represents the remaining time in seconds.

### Redis TTL return values

  Value   Meaning
  ------- --------------------------------
  `60`    60 seconds remaining
  `10`    10 seconds remaining
  `0`     Less than one second remaining
  `-1`    Key exists without expiration
  `-2`    Key does not exist

------------------------------------------------------------------------

## 6. Important Redis Commands Learned

### SET

Stores a value:

``` javascript
await redis.set("name", "Dev");
```

### GET

Retrieves a value:

``` javascript
const value = await redis.get("name");
```

### SET with expiration

``` javascript
await redis.set("otp:9876543210", "123456", "EX", 60);
```

Stores the OTP for 60 seconds.

### TTL

``` javascript
const ttl = await redis.ttl("otp:9876543210");
```

Returns the remaining expiration time in seconds.

### EXISTS

``` javascript
const exists = await redis.exists("otp:9876543210");
```

Returns:

-   `1` if the key exists.
-   `0` if the key does not exist.

### DEL

``` javascript
await redis.del("otp:9876543210");
```

Deletes the key.

------------------------------------------------------------------------

## 7. Core Learnings

### Learning 1: Redis is a key-value store

Redis stores data using a key and value:

``` text
Key                  Value
--------------------------------
otp:9876543210       123456
```

We use the phone number to build a unique key for each user.

------------------------------------------------------------------------

### Learning 2: Redis stores OTP values as strings

The generated OTP is converted into a string:

``` javascript
const otp = Math.floor(
    100000 + Math.random() * 900000
).toString();
```

Redis returns the stored value as a string.

Therefore, the incoming OTP is converted before comparison:

``` javascript
if (savedOTP !== String(otp)) {
    // Invalid OTP
}
```

This avoids a mismatch between a string and a number.

------------------------------------------------------------------------

### Learning 3: TTL is stored in seconds

``` javascript
await redis.set(key, otp, "EX", 60);
```

The `EX` option sets expiration in seconds.

To set expiration in milliseconds, Redis also supports `PX`.

For this project, we use seconds because they are easier to understand.

------------------------------------------------------------------------

### Learning 4: Redis keys can be overwritten

If the same key is used again:

``` javascript
await redis.set(key, newOtp, "EX", 60);
```

The previous value is replaced.

This is why requesting a new OTP invalidates the previous OTP in this
basic project.

------------------------------------------------------------------------

### Learning 5: OTP verification is a multi-step process

The verification endpoint performs these operations:

1.  Receive input.
2.  Generate the Redis key.
3.  Read the stored OTP.
4.  Check whether the OTP exists.
5.  Compare the incoming OTP.
6.  Delete the OTP if it is correct.
7.  Return a response.

This teaches how multiple backend operations work together inside one
API endpoint.

------------------------------------------------------------------------

### Learning 6: Express JSON middleware

``` javascript
app.use(express.json());
```

This middleware allows Express to parse incoming JSON request bodies.

Without it, `req.body` may not contain the expected parsed data.

------------------------------------------------------------------------

### Learning 7: Route parameters and request body are different

Request body:

``` javascript
const { phoneNumber } = req.body;
```

Example:

``` json
{
  "phoneNumber": "9876543210"
}
```

Route parameter:

``` javascript
const { phone } = req.params;
```

Example route:

``` http
GET /otp/9876543210/ttl
```

The route parameter name must match the route definition.

Correct:

``` javascript
app.get("/otp/:phone/ttl", (req, res) => {
    const { phone } = req.params;
});
```

Incorrect:

``` javascript
const { phoneNumber } = req.params;
```

This produces `undefined` because the parameter is named `phone`, not
`phoneNumber`.

------------------------------------------------------------------------

## 8. Common Problems and Debugging

### Problem: Redis TTL returns -2

**Meaning:** The key does not exist.

Possible reasons:

-   The OTP expired.
-   The OTP was deleted after verification.
-   The phone number is different.
-   The Redis key was created incorrectly.
-   The route parameter was extracted incorrectly.

Debug using:

``` javascript
console.log("Generated key:", key);
console.log("TTL:", await redis.ttl(key));
```

------------------------------------------------------------------------

### Problem: Redis key is otp:undefined

Check the request body:

``` javascript
console.log(req.body);
```

Make sure the request contains:

``` json
{
  "phoneNumber": "9876543210"
}
```

Also verify that JSON middleware is enabled:

``` javascript
app.use(express.json());
```

------------------------------------------------------------------------

### Problem: Invalid OTP after requesting a new OTP

The new OTP overwrites the old OTP because both requests use the same
Redis key.

Always verify using the latest OTP.

------------------------------------------------------------------------

### Problem: OTP comparison fails

Inspect the values and their types:

``` javascript
console.log("Saved OTP:", savedOTP, typeof savedOTP);
console.log("Received OTP:", otp, typeof otp);
```

Convert the incoming OTP to a string:

``` javascript
String(otp)
```

------------------------------------------------------------------------

## 9. Manual Testing Plan

Use Postman to test the following flow:

### Test 1: Check the server

``` http
GET /
```

Expected: HTTP 200.

### Test 2: Generate OTP

``` http
POST /otp
```

Body:

``` json
{
  "phoneNumber": "9876543210"
}
```

Expected:

-   OTP is generated.
-   Redis key is created.
-   TTL is approximately 60 seconds.

### Test 3: Check TTL

``` http
GET /otp/9876543210/ttl
```

Expected:

-   TTL is a positive number.
-   TTL decreases over time.

### Test 4: Verify with an incorrect OTP

``` http
POST /otp/verify
```

Expected:

-   Response says `Invalid OTP`.
-   OTP remains stored.

### Test 5: Verify with the correct OTP

Expected:

-   Response says `OTP verified successfully`.
-   Redis key is deleted.

### Test 6: Verify the same OTP again

Expected:

-   Response says `OTP expired or not found`.

### Test 7: Resend OTP

Expected:

-   A new OTP is generated.
-   The old OTP is replaced.
-   TTL is reset.

------------------------------------------------------------------------

## 10. Questions to Test Your Understanding

Try answering these without looking at the code.

1.  What is the difference between Redis `GET` and `TTL`?
2.  Why does Redis return `-2`?
3.  What happens when the same Redis key is used for a second OTP?
4.  Why do we use `String(otp)` during comparison?
5.  What does `EX` mean in the Redis `SET` command?
6.  What happens when the OTP's TTL reaches zero?
7.  Why do we delete the OTP after successful verification?
8.  What is the difference between `req.body` and `req.params`?
9.  Why does `otp:undefined` get generated?
10. What happens if Redis is unavailable when the API is called?

------------------------------------------------------------------------

## 11. Future Improvements

These topics are intentionally postponed until the basic concepts are
comfortable:

-   Input validation
-   Secure OTP generation
-   Error-handling middleware
-   Resend cooldown
-   Rate limiting
-   Maximum verification attempts
-   Atomic OTP verification
-   SMS provider integration
-   Authentication tokens
-   Project folder structure
-   Automated testing

------------------------------------------------------------------------

## 12. Summary

This project helped me understand:

-   How Express APIs receive and return data.
-   How Redis stores key-value pairs.
-   How to set and read TTL values.
-   How Redis automatically expires keys.
-   How to generate and verify OTPs.
-   How Redis keys are overwritten.
-   How to debug `undefined` values and missing keys.
-   How to use Postman for API testing.

> **Main takeaway:** Redis is useful for temporary data because it
> supports fast reads, writes, and automatic expiration using TTL.

------------------------------------------------------------------------

## Author

**Dev Doshi**

Learning backend development with Node.js, Express.js, Redis, and system
design.
