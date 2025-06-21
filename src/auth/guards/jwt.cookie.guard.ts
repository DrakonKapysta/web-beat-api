import { AuthGuard } from '@nestjs/passport';

export class JwtCookieAuthGuard extends AuthGuard('jwt-cookie') {}
