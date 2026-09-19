Here is the highly curated essential cheat sheet containing only the environment management and database commands from my actual terminal workflow.

## 💻 Environment & Service Control
Run these directly in your standard Ubuntu Bash terminal.

* `redis-cli ping` – Test if the background Redis server is alive. Returns PONG.
* `redis-cli` – Open the interactive Redis CLI mode (changes prompt to 127.0.0.1:6379).
* `redis-cli shutdown` – Gracefully stop the active background Redis instance.
* `sudo pkill -9 redis-server` – Forcefully kill any running or stuck background Redis processes.
* `sudo service redis-server stop` – Prevent the Ubuntu service manager from auto-restarting the server.

------------------------------
## 🔑 Key-Value & String Commands
Run these inside the Redis prompt (127.0.0.1:6379).

* `SET key value` – Store a key (e.g., SET mykey 10).
* `GET key` – Retrieve the value of a key (e.g., GET mykey).
* `INCR key` – Increment a numeric value by 1 (e.g., INCR mykey).

## Conditional Modifiers (Extra)

* `SET key value NX` – Not Exists: Only set the key if it does not already exist.
* `SET key value XX` – Only update the key if it already exists.

------------------------------
## 📊 Sorted Set (Zset) Commands
Run these inside the Redis prompt (127.0.0.1:6379).

* `ZINCRBY key increment member` – Add or increment a member's score (e.g., ZINCRBY my_sorted_set 10 "one").
* `ZRANGE key 0 -1 WITHSCORES` – List all members and their scores sorted from lowest to highest.
* `ZREVRANK key member` – Find a member's 0-indexed position sorted from highest to lowest (0 = 1st place).



## Here are the next most important Redis commands you will need as your project grows. These focus on **managing keys, working with Objects/Hashes, and managing Lists/Queues**.

## 🔍 Key Management & Maintenance
Run these inside the Redis prompt (127.0.0.1:6379>) to view and clean up your database.

* `EXISTS key` – Check if a key exists. Returns 1 if it exists, 0 if not.
* `DEL key` – Delete a key completely (works on Strings, Sets, or Hashes).
* `EXPIRE key 60` – Set a time-to-live countdown on a key (e.g., auto-delete this key in 60 seconds).
* `TTL key` – Check how many seconds a key has left before it self-destructs.
* `FLUSHALL` – Wipe out everything. Deletes every single key across your entire Redis server.

------------------------------
## 📦 Hash Commands (H prefixed)
Perfect for storing structured objects (like a user profile) without having to create multiple separate keys.

* `HSET user`:1 name "Dev" age 25 – Save an object with multiple fields under one key.
* `HGET user:1 name` – Retrieve a specific field from the object.
* `HGETALL user:1` – Retrieve the entire object (all fields and values).
* `HDEL user:1 age` – Delete a specific field inside the object.

------------------------------
## 📋 List & Queue Commands (L / R prefixed)
Used for creating timelines, message queues, or stacks where order matters.

* `LPUSH myqueue "task1"` – Push an item to the front (left side) of a list.
* `RPUSH myqueue "task2"` – Push an item to the back (right side) of a list.
* `LPOP myqueue` – Take out and remove the first item from the front.
* `LRANGE myqueue 0 -1` – View all items currently waiting in the list.
