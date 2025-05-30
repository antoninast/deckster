// import express from 'express';
// import { ApolloServer } from 'apollo-server-express';
// import { graphqlUploadExpress } from 'graphql-upload';
// import mongoose from 'mongoose';
// import typeDefs from './schema';
// import resolvers from './resolvers';

// async function startServer() {
//   const app = express();

//   // Enable file uploads
//   app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });

//   await server.start();
//   server.applyMiddleware({ app });

//   await mongoose.connect('mongodb://localhost:27017/your-db');

//   app.listen(4000, () =>
//     console.log(`Server running at http://localhost:4000${server.graphqlPath}`)
//   );
// }

// startServer();
