const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./errorHandler');
const session = require('express-session');
const knexSessionStore = require('connect-session-knex')(session);
const restricted = require('./data/auth/restricted-middleware');

const usersRouter = require("./users/users-router");
const authRouter = require("./data/auth/auth-router");


const server = express();

const sessionConfig = {
    name: 'ctsession',
  secret: 'myspeshulsecret',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false, // should be true in production
    httpOnly: true
  },
  resave: false,
  saveUninitialized: false,

  store: new knexSessionStore(
    {
      knex: require("./data/db-config"),
      tablename: "sessions",
      sidfieldname: "sid",
      createtable: true,
      clearInterval: 1000 * 60 * 60
    }
  )
}

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use('/api/users', restricted, usersRouter);
server.use('/api/auth', authRouter);
server.use(session(sessionConfig));

server.get('/', (req, res) => {
    res.json({api: "up"});
});

server.use(errorHandler);

module.exports = server;