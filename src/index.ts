import { MikroORM } from '@mikro-orm/core';
import microConfig from './mikro-orm.config';
import express from 'express';
import { Post } from './entities/Post';


const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  
  const app = express();

  // const post = orm.em.create(Post, {title: 'my first post'});
  // await orm.em.persistAndFlush(post);
  
  // const posts = await orm.em.find(Post, {})
  // console.log(posts)
  app.listen(4000, ()=> {
    console.log('server started on localhost:4000');
  })
};

main();