import express from "express";
import cors from "cors";
import path from "node:path";
import type { Request, Response } from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import db from "./config/connection.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import { authenticateToken } from "./utils/auth.js";
import { SecurityQuestion } from "./models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error("GraphQL Error:", err);
    console.error("Extensions:", err.extensions);
    return err;
  },
});

const startApolloServer = async () => {
  await server.start();
  await db();

  const app = express();
  const PORT = process.env.PORT || 3001;

  // Middleware

  app.use(cors());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static('public'))

  // REST endpoint for security questions
  app.get("/api/security-questions", async (_req: Request, res: Response) => {
    const securityQuestions = await SecurityQuestion.find({});
    return res.send(securityQuestions);
  });

  // GraphQL endpoint with authentication
  app.use(
    "/graphql",
    expressMiddleware(server as any, {
      context: async ({ req }) => {
        const modifiedReq = authenticateToken({ req });
        return {
          user: modifiedReq.user,
        };
      },
    })
  );

  // Serve static files in production
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
