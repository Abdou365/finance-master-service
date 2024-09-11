import {
  Body,
  Controller,
  Get,
  NotAcceptableException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import {
  MESSAGE_SUCCESS_REGISTRATION_CONFIRM_SENT,
  MESSAGE_SUSSUCCESS_LOGIN,
  MESSAGE_SUSSUCCESS_LOGOUT,
  MESSAGE_SUSSUCCESS_REGISTER,
} from 'src/interceptor/response.messages';
import { removeCookies, setCookies } from '../utils/cookie.utils';
import { AuthService } from './auth.service';
import { recoveryPasswordDto } from './dto/recovery-account.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- registration

  @Public()
  @UseInterceptors(
    new ResponseInterceptor(MESSAGE_SUCCESS_REGISTRATION_CONFIRM_SENT)
  )
  @Post('register')
  async create(@Body() body: { email: string; password: string }) {
    await this.authService.register(body);
  }

  @Post('confirm/registration')
  @Public()
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUSSUCCESS_REGISTER))
  async confirmRegistration(
    @Body() body: { token: string; code: number },
    @Res({ passthrough: true }) res: Response
  ) {
    const newUser = await this.authService.confirmRegistration(
      body.token,
      body.code
    );
    setCookies({ res, access_token: newUser.access_token, user: newUser.user });
    return newUser.user;
  }

  // --- login

  @Post('confirm/login')
  @Public()
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUSSUCCESS_LOGIN))
  async confirmLogin(
    @Body() body: { token: string; code: number },
    @Res({ passthrough: true }) res: Response
  ) {
    const newUser = await this.authService.confirmLogin(body.token, +body.code);
    setCookies({ res, access_token: newUser.access_token, user: newUser.user });
    return newUser.user;
  }

  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUSSUCCESS_LOGIN))
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const jwt = await this.authService.login(
      req.body.username, // email
      req.body.password
    );
  }

  // recover password
  @Post('recover')
  @UseInterceptors(new ResponseInterceptor('Recovery email sent'))
  @Public()
  async resetPassword(@Body() body: { email: string }) {
    await this.authService.recoveryPassword(body.email);
  }

  @Post('recover-password')
  @Public()
  @UseInterceptors(new ResponseInterceptor('Password recovered successfully'))
  async recoverPassword(
    @Body()
    body: {
      password: string;
      newPassword: string;
      email: string;
      token: string;
      code: number;
    },
    @Res({ passthrough: true }) res: Response
  ) {
    const loggedUser = await this.authService.resetPassword(body);

    setCookies({
      res,
      access_token: loggedUser.access_token,
      user: loggedUser.user,
    });

    return loggedUser.user;
  }

  @Post('change-password')
  @UseInterceptors(new ResponseInterceptor('Password changed successfully'))
  async changePassword(
    @Body() body: { password: string; newPassword: string; email: string }
  ) {
    await this.authService.changePassword(body);
  }

  @Post('confirm/recover')
  @Public()
  @UseInterceptors(new ResponseInterceptor('Password recovered successfully'))
  async confirmRecover(
    @Body()
    body: recoveryPasswordDto,
    @Res({ passthrough: true }) res: Response
  ) {
    if (body.password !== body.password_confirmation) {
      throw new NotAcceptableException('Password mismatch');
    }

    const newUser = await this.authService.confirmRecovery(
      body.token,
      body.code,
      body.password,
      body.email
    );
    setCookies({ res, access_token: newUser.access_token, user: newUser.user });
    return newUser.user;
  }

  // --- change email

  @Post('change/email')
  async changeEmail(
    @Body() body: { email: string; newEmail: string; password: string }
  ) {
    await this.authService.requestEmailChange(
      body.email,
      body.newEmail,
      body.password
    );
  }

  @Post('confirm/change/email')
  @Public()
  @UseInterceptors(new ResponseInterceptor('Email changed successfully'))
  async confirmChangeEmail(
    @Body() body: { token: string; code: number },
    @Res({ passthrough: true }) res: Response
  ) {
    const newUser = await this.authService.confirmEmailChange(
      body.token,
      +body.code
    );
    setCookies({ res, access_token: newUser.access_token, user: newUser.user });
    return newUser.user;
  }

  // --- logout
  @UseInterceptors(new ResponseInterceptor(MESSAGE_SUSSUCCESS_LOGOUT))
  @Get('logout/:id')
  async logout(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response
  ) {
    removeCookies(res);
    await this.authService.logout(id);
  }

  @Get('test')
  test() {
    return 'Hello World!';
  }
}
