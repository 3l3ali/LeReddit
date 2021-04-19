import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, Int, ObjectType } from 'type-graphql';

// Add @ObjectType() to make the entity a GraphQl type
@ObjectType()
@Entity()
export class Post {
  // Add @Field() to expose field to GraphQl
  @Field()
  @PrimaryKey()
  id!: number;
  
  @Field(() => String)
  @Property({type: 'date'})
  createdAt: Date = new Date();
  
  @Field(() => String)
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
  
  @Field()
  @Property({type: 'text'})
  title!: string;
}