import argon2 from 'argon2';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { DUPLICATE_ERROR_CODE } from '../config/constants';
import { User } from '../entities/User';
import { MyContex } from '../config/types';


@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[]

  @Field(() => User, {nullable: true})
  user?: User
}

@Resolver()
export class UserResolver {
  @Query(() => User, {nullable: true})
  async me(
    @Ctx() { em, req }: MyContex
  ) {
    // you're not logged in
    const id = req.session.userId;
    if (!id) return null;

    const user = await em.findOne(User, { id });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContex
  ): Promise<UserResponse> {
    if (options.username.length <= 3) {
      return {
        errors: [{
          field: 'username',
          message: 'length must be greater than 3'
        }]
      }
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username, password: hashedPassword
    });

    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === DUPLICATE_ERROR_CODE) {
        return {
          errors: [{
            field: 'username',
            message: 'username already exists'
          }]
        }
      }
    }
    
    /**
     *  store user id in session setting a cookie
     *  on the user to keep them logged in
     */
    req.session.userId = user.id;
    
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContex
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username});
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'username doesn\'t exist'
        }]
      }
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: 'incorrect password'
        }]
      }
    }

    req.session.userId = user.id;

    return { user };
  }
}