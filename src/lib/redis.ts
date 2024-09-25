import { createClient } from "redis";

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URL,
    port: parseInt(process.env.REDIS_PORT ?? "6379"),
  },
});

client.on("connect", () => {
  console.log("Redis connected");
});

client.on("error", (error) => {
  console.error(error);
});

export default client;
