import 'reflect-metadata';
// MikroOrm
import { MikroORM } from '@mikro-orm/core';
import microConfig from './db/mikro-orm.config';
// Express and Apollo
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
// Redis and sessions express client
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
// GraphQl Resolvers
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import { PROD } from './config/constants';
import { MyContex } from './config/types';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  
  const app = express();
  
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  
  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true
      }),
      cookie: {
        maxAge: 315360000000, // 10 years in ms
        httpOnly: true,
        sameSite: 'lax', //csrf
        secure: PROD // cookie works in https 
      },
      saveUninitialized: false,
      secret: 'lakmsdkamsdkdnndsnadksndknkasdnmaskdk',
      resave: false
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false
    }),
    context: ({ req, res}): MyContex => ({ em: orm.em, req, res })
  });
  
  apolloServer.applyMiddleware({ app });

  app.listen(4000, ()=> {
    console.log('server started on localhost:4000');
  })
};

main();