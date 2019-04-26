import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import passport from 'passport'
import passportJWT from 'passport-jwt'
import jwt from 'jsonwebtoken'

import {typeDefs, resolvers} from './typedefs+resolvers'

// Constants
const PORT = 4000
const JWT_SECRET = 'MyFunSecret';

const users = [
  {
    id: 1,
    name: 'John',
    email: 'john@mail.com',
    password: 'john123'
  }
]

// generate a jwt token for testing purposes
console.log(jwt.sign(users[0], JWT_SECRET))

const { Strategy, ExtractJwt } = passportJWT;

const params = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const strategy = new Strategy(params, (payload, done) => {
  const user = users.find(user => user.id === payload.id) || null

  return done(null, user)
})

passport.use(strategy)

// Express
const app = express()
app.set('view engine', 'pug')

passport.initialize()

app.use('/graphql', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (user) {
      req.user = user
    }

    next()
  })(req, res, next)
})

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    user: req.user
  })
})

server.applyMiddleware({ app })

app.listen({ port: PORT }, () => {
  console.log(`Server running on ${PORT}`)
})
