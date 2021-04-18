import { PROD } from './constants';
import { Post } from './entities/Post';
import { MikroORM } from '@mikro-orm/core';
import path from 'path';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[jt]s$/,
  },
  entities: [Post],
  dbName: 'lereddit',
  type: 'postgresql',
  debug: !PROD
} as Parameters<typeof MikroORM.init>[0];