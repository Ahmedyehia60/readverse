import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
let client: MongoClient;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

export async function connectToDatabase() {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      client = new MongoClient(uri);
      globalThis._mongoClientPromise = client.connect();
    }
    return globalThis._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    return client.connect();
  }
}
