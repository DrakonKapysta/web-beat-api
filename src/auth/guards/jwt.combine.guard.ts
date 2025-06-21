import { AuthGuard } from '@nestjs/passport';

export class JwtCombineAuthGuard extends AuthGuard(['jwt', 'jwt-cookie']) {}
