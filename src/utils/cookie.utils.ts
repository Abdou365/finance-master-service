import { Response } from 'express';
import { computeExpiresIn, jwtExpiresIn } from '../auth/constants';

export function setCookies({
  res,
  access_token,
  user,
}: {
  res?: Response<any, Record<string, any>>;
  access_token?: string;
  user?: any;
}) {
  if (access_token) {
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN,
      signed: true,
      sameSite: 'none',
    });
  }
  if (res) {
    res.cookie(
      'exipresIn',
      new Date(
        new Date().valueOf() + computeExpiresIn(jwtExpiresIn.refresh_token)
      ),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        domain: process.env.COOKIE_DOMAIN,
        sameSite: 'none',
      }
    );
  }

  if (user) {
    res.cookie('user', user, {
      maxAge: computeExpiresIn(jwtExpiresIn.refresh_token),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN,
      signed: true,
      sameSite: 'none',
    });
  }
}
export function removeCookies(res: Response<any, Record<string, any>>) {
  res.clearCookie('access_token');
  res.clearCookie('expiresIn');
  res.clearCookie('user');
  res.closed;
}
