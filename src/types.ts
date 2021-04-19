import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";

export type MyContex = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
}