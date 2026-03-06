import { knexInstance } from '../persistence/knex.js';
import { UserRepositoryImpl } from '../persistence/repositories/UserRepositoryImpl.js';
import { PostRepositoryImpl } from '../persistence/repositories/PostRepositoryImpl.js';
import { ReqResAdapter } from '../adapters/reqres/ReqResAdapter.js';
import { JwtTokenService } from '../adapters/JwtTokenService.js';

const Registry = {
  UserRepository: new UserRepositoryImpl(knexInstance),
  PostRepository: new PostRepositoryImpl(knexInstance),
  UserProvider: new ReqResAdapter(),
  TokenService: new JwtTokenService(),
};

export { Registry };
