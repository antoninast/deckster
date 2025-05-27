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

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server as any,
    {
      context: authenticateToken as any
    }
  ));

  // // Endpoint to upload CSV and import to MongoDB
  // app.post('/upload-csv', upload.single('file'), async (req, res) => {
  //   if (!req.file) {
  //     return res.status(400).send('No file uploaded.');
  //   }

  //   const filePath = path.resolve(req.file.path);
  //   try {
  //     await client.connect();
  //     const db = client.db('your_database_name');
  //     const collection = db.collection('your_collection_name');
  //     const records: any[] = [];

  //     // Crerate a read stream and pipe it to csv-parser
  //     fs.createReadStream(filePath)
  //       .pipe(csvParser())
  //       .on('data', (row) => {
  //         records.push(row);
  //       })
  //       .on('end', async () => {
  //         try {
  //           // Insert records into MongoDB if there are any
  //           if (records.length > 0) {
  //             await collection.insertMany(records);
  //             res.status(200).send(`Successfully imported ${records.length} records.`);
  //             console.log('You did it, B! Data successfully inserted into MongoDB');  
  //           }
            
  //           // Delete the uploaded file
  //           fs.unlinkSync(filePath);
  //           console.log('File deleted successfully');

  //         } catch (err) {
  //           console.error('Error inserting data into MongoDB:', err);
  //           res.status(500).send('Error inserting data into MongoDB');
  //         }
  //       })
  //   } catch (err) {
  //     console.error('Error connecting to MongoDB:', err);
  //     res.status(500).send('Error connecting to MongoDB');
  //   }

  // });

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
