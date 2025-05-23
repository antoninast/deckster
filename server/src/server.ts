import express from "express";
import path from "node:path";
import type { Request, Response } from "express";
import db from "./config/connection.js";
import { ApolloServer } from "@apollo/server"; // Note: Import from @apollo/server-express
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index.js";
import { authenticateToken } from "./utils/auth.js";
// import multer from 'multer';
// import { GraphQLUpload, FileUpload } from 'graphql-upload';
// import csvParser from 'csv-parser';
// import fs from 'fs';
// import { MongoClient } from 'mongodb';

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB connection string
// const client = new MongoClient(uri);
// const dbName = 'your_database_name'; // Replace with your database name
// const collectionName = 'your_collection_name'; // Replace with your collection name

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();
  await db();

  const PORT = process.env.PORT || 3001;
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server as any, {
      context: authenticateToken as any,
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../client/dist")));

    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();
