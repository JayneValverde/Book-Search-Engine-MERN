const express = require('express');
const path = require('path');
const db = require('./config/connection');

// import ApolloServer
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');

// import typeDefs and Resolvers
const { typeDefs, resolvers } = require('./schemas');

const app = express();
// add express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
});

const PORT = process.env.PORT || 3001

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  context: authMiddleware,
});

// Create a new instance of an Apollo Server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();
  
  // integrate the Apollo server with the Express application as middlware
  server.applyMiddleware({ app });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
};

// Call the async funciton to start the server
startApolloServer();