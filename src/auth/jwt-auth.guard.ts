import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public';
import { jwtSecretsPublic } from './constants';
import { isAfter } from 'date-fns';
import { setCookies } from '../utils/cookie.utils';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly prisma: PrismaClient = new PrismaClient();

  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
    private auth: AuthService
  ) {
    super();
  }

  /**
   * Determines if the route can be activated.
   * @param context - The execution context.
   * @returns A boolean, a promise that resolves to a boolean, an observable that emits a boolean, or any other value.
   */
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
    // Checks if the route is public or requires authentication.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, allow access.
    if (isPublic) {
      return true;
    }

    // Get the request and response objects.
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Extract the access token, user info, and expiration time from signed cookies.
    const access_token = request.signedCookies.access_token;
    const user = request.signedCookies.user;
    try {
      // Verify the access token.

      await this.jwt.verifyAsync(access_token, {
        secret: jwtSecretsPublic.access_token,
      });
      return true;
    } catch (error) {
      // If the access token is invalid, try to use the refresh token.

      if (user) {
        // Fetch the user and their authentication info from the database.
        const auth = await this.prisma.user
          .findUnique({
            where: { id: user.id },
            include: {
              Authentication: {
                select: {
                  id: true,
                  refreshToken: true,
                  refreshExpiresAt: true,
                },
              },
            },
          })
          .catch(error => {
            throw new UnauthorizedException('Invalid credentials');
          });

        if (
          auth &&
          auth.Authentication &&
          auth.Authentication.refreshToken &&
          isAfter(new Date(auth.Authentication.refreshExpiresAt), new Date())
        ) {
          try {
            // Verify the refresh token.
            const payload = await this.jwt.verifyAsync(
              auth.Authentication.refreshToken,
              {
                secret: jwtSecretsPublic.refresh_token,
              }
            );

            if (payload) {
              // Generate a new access token.
              const newAccess_token = this.auth.generateAccessToken({
                email: auth.email,
                sub: auth.id,
              });

              // Set the new access token and expiration time in cookies.
              setCookies({
                res: response,
                access_token: newAccess_token,
                user: auth,
              });

              return true;
            }
          } catch (refreshError) {
            // If there is an error with the refresh token, throw an unauthorized exception.
            throw new UnauthorizedException('Invalid refresh token');
          }
        }
      }

      // If no valid tokens are found, throw an unauthorized exception.
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
