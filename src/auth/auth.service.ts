import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User } from '@prisma/client';
import { omit } from 'lodash';
import { NotificationService } from 'src/notification/notification.service';
import { generateNumber } from 'src/utils/code.utils';
import { generateUUID } from 'src/utils/uuid.utils';
import {
  computeExpiresIn,
  jwtExpiresIn,
  jwtSecretsPrivate,
  jwtSecretsPublic,
} from './constants';
import { Encryption } from './encryption.service';

@Injectable()
export class AuthService {
  private readonly prisma: PrismaClient = new PrismaClient();

  constructor(
    private notification: NotificationService,
    private jwtService: JwtService,
    private encription: Encryption,
    private config: ConfigService
  ) {}

  /**
   * Registers a new user.
   * @param {Object} param - The registration parameters.
   * @param {string} param.email - The email of the user.
   * @param {string} param.password - The password of the user.
   * @returns {Promise<void>} - A promise that resolves when the user is registered.
   * @throws {UnauthorizedException} - If the user cannot be created.
   */
  async register({ email, password }: { email: string; password: string }) {
    const userId = generateUUID();
    const confirmToken = this.generateConfirmToken({
      email,
      sub: userId,
    });
    const code = generateNumber(6);
    const user = await this.prisma.user.create({
      data: {
        id: userId,
        email,
        Authentication: {
          create: {
            password: this.encription.encrypt(password),
            confirmCode: code,
            confirmToken,
            confirmExpiresAt: new Date(
              computeExpiresIn(jwtExpiresIn.confirm_token)
            ),
          },
        },
      },
      include: {
        Authentication: {
          select: {
            id: true,
            loginType: true,
            provider: true,
            lastLogin: true,
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials, no user created');
    }

    this.notification.sendEmail(
      email,
      'Confirm your account',
      `Your Secret Code : ${code} /n Click here to confirm your account: ${this.config.get<string>('front.url')}/auth?step=confirm-register&token=${confirmToken}`
    );
  }

  /**
   * Validates a user's credentials.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns A Promise that resolves to the validated user object without the password.
   * @throws UnauthorizedException if the credentials are invalid.
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        Authentication: {
          select: {
            password: true,
            id: true,
            loginType: true,
            provider: true,
            lastLogin: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = this.encription.compare(
      password,
      user.Authentication.password
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return omit(user, 'Authentication.password');
  }

  /**
   * Confirms user registration using the provided token and code.
   *
   * @param token - The registration token.
   * @param code - The registration code.
   * @returns The logged-in user after successful registration confirmation.
   * @throws UnauthorizedException if the provided credentials are invalid or no user is found.
   */
  async confirmRegistration(token: string, code: number) {
    const { email } = this.jwtService.decode(token) as { email: string };
    const newUser = await this.prisma.user.findUnique({
      where: {
        email,
        Authentication: {
          confirmToken: token,
          confirmCode: code,
        },
      },
      include: {
        Authentication: true,
      },
    });

    if (!newUser) {
      throw new UnauthorizedException('Invalid credentials,  no user found');
    }
    try {
      if (
        this.jwtService.verify(token, {
          secret: jwtSecretsPublic.confirm_token,
        })
      ) {
        const auth = await this.prisma.authentication.update({
          where: {
            id: newUser.Authentication.id,
          },
          data: {
            confirmCode: null,
            confirmToken: null,
            confirmExpiresAt: null,
          },
          include: {
            User: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });
        if (!auth) {
          throw new UnauthorizedException('Invalid credentials');
        }
        this.notification.sendEmail(
          newUser.email,
          'Registration Success',
          `You have successfully registered at ${new Date().toISOString()}`
        );
        return this.logUser(newUser);
      }
    } catch (error) {
      await this.prisma.user.delete({
        where: {
          id: newUser.id,
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Confirms the login by verifying the token and code provided.
   * If the verification is successful, it sends a login success email and returns the logged-in user.
   * If the verification fails, it throws an UnauthorizedException.
   *
   * @param token - The confirmation token.
   * @param code - The confirmation code.
   * @returns The logged-in user.
   * @throws UnauthorizedException if the verification fails.
   */
  async confirmLogin(token: string, code: number) {
    const auth = await this.prisma.authentication.findFirst({
      where: {
        confirmToken: token,
        confirmCode: code,
      },
      select: {
        userId: true,
      },
    });

    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }
    try {
      if (
        this.jwtService.verify(token, {
          secret: jwtSecretsPublic.confirm_token,
        })
      ) {
        const user = await this.prisma.user.findUnique({
          where: {
            id: auth.userId,
          },
          include: {
            Authentication: {
              select: {
                id: true,
                loginType: true,
                provider: true,
                lastLogin: true,
              },
            },
          },
        });
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
        this.notification.sendEmail(
          user.email,
          'Login Success',
          `You have successfully logged in at ${new Date().toISOString()}`
        );
        return this.logUser(user);
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Logs the user in and updates the authentication details.
   * @param user - The partial user object containing email and id.
   * @returns An object with the access token and the user.
   */
  async logUser(user: Partial<User>) {
    const payload = { email: user.email, sub: user.id };

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        Authentication: {
          update: {
            refreshToken: this.generateRefreshToken(payload),
            refreshExpiresAt: new Date(
              Date.now() + computeExpiresIn(jwtExpiresIn.refresh_token)
            ),
            lastLogin: new Date(),
          },
        },
      },
    });

    return {
      access_token: this.generateAccessToken(payload),
      user,
    };
  }

  /**
   * Logs in a user with the provided email and password.
   * Generates a confirmation token and sends an email with a secret code for confirmation.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @throws UnauthorizedException if the credentials are invalid.
   */
  async login(email: string, password: string) {
    const authenticatedUser = await this.validateUser(email, password);
    const confirmToken = this.generateConfirmToken({
      email,
      sub: authenticatedUser.id,
    });

    const code = generateNumber(6);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: authenticatedUser.id,
      },
      data: {
        Authentication: {
          update: {
            confirmCode: code,
            confirmToken,
            confirmExpiresAt: new Date(
              computeExpiresIn(jwtExpiresIn.confirm_token)
            ),
          },
        },
      },
      include: {
        Authentication: {
          select: {
            id: true,
            loginType: true,
            provider: true,
            lastLogin: true,
          },
        },
      },
    });

    if (!updatedUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.notification.sendEmail(
      email,
      'Confirmer votre connexion',
      `Your Secret Code : ${code} /n Cliquez pour confimer votre connexion: ${this.config.get<string>('front.url')}/auth?step=confirm-login&token=${confirmToken}`
    );
  }

  /**
   * Generates a refresh token using the provided payload.
   * @param payload - The payload containing the email and sub.
   * @returns The generated refresh token.
   */
  generateRefreshToken(payload: { email: string; sub: string }): string {
    return this.jwtService.sign(payload, {
      secret: jwtSecretsPrivate.refresh_token,
      algorithm: 'RS256',
      expiresIn: jwtExpiresIn.refresh_token,
    });
  }

  /**
   * Generates a confirmation token for the given payload.
   * @param payload - The payload containing the email and sub.
   * @returns The generated confirmation token.
   */
  generateConfirmToken(payload: { email: string; sub: string }) {
    return this.jwtService.sign(payload, {
      secret: jwtSecretsPrivate.confirm_token,
      algorithm: 'RS256',
      expiresIn: jwtExpiresIn.confirm_token,
    });
  }

  /**
   * Generates an access token using the provided payload.
   * @param payload - The payload containing the email and sub.
   * @returns The generated access token.
   */
  generateAccessToken(payload: { email: string; sub: string }) {
    return this.jwtService.sign(payload, {
      secret: jwtSecretsPrivate.access_token,
      algorithm: 'RS256',
      expiresIn: jwtExpiresIn.acces_token,
    });
  }

  /**
   * Generates a recovery token for the given email and subject.
   * @param payload - The payload containing the email and subject.
   * @returns The generated recovery token.
   */
  generateRecoveryToken(payload: { email: string; sub: string }) {
    return this.jwtService.sign(payload, {
      secret: jwtSecretsPrivate.recovery_token,
      algorithm: 'RS256',
      expiresIn: jwtExpiresIn.recovery_token,
    });
  }

  /**
   * Recovers the password for a user with the specified email.
   * Generates a recovery token and sends an email with a secret code and a recovery link.
   *
   * @param email - The email of the user whose password needs to be recovered.
   * @throws UnauthorizedException if the user with the specified email does not exist.
   */
  async recoveryPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        Authentication: {
          select: {
            id: true,
            loginType: true,
            provider: true,
            lastLogin: true,
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const recoveryToken = this.generateRecoveryToken({
      email,
      sub: user.id,
    });
    const code = generateNumber(6);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        Authentication: {
          update: {
            recoveryCode: code,
            recoveryToken,
            recoveryExpiresAt: new Date(
              computeExpiresIn(jwtExpiresIn.recovery_token)
            ),
          },
        },
      },
    });

    this.notification.sendEmail(
      email,
      'Recover your password',
      `Your Secret Code : ${code} /n Click here to recover your password: ${this.config.get<string>('front.url')}/auth?step=recover-password&token=${recoveryToken}`
    );
  }

  /**
   * Confirms the recovery process for a user by validating the recovery token and code,
   * and updating the user's password.
   *
   * @param token - The recovery token.
   * @param code - The recovery code.
   * @param password - The new password for the user.
   * @param email - The email of the user.
   * @returns The logged-in user after the recovery process is completed.
   * @throws UnauthorizedException if the provided credentials are invalid.
   */
  async confirmRecovery(
    token: string,
    code: number,
    password: string,
    email: string
  ) {
    const auth = await this.prisma.authentication.findFirst({
      where: {
        recoveryToken: token,
        recoveryCode: code,
      },
      select: {
        userId: true,
      },
    });
    if (!auth) {
      throw new UnauthorizedException('Invalid credentials, no auth found');
    }
    try {
      if (
        this.jwtService.verify(token, {
          secret: jwtSecretsPublic.recovery_token,
        })
      ) {
        const user = await this.prisma.user.update({
          where: {
            id: auth.userId,
            email,
          },
          include: {
            Authentication: {
              select: {
                id: true,
                loginType: true,
                provider: true,
                lastLogin: true,
              },
            },
          },
          data: {
            Authentication: {
              update: {
                password: this.encription.encrypt(password),
                recoveryCode: null,
                recoveryToken: null,
                recoveryExpiresAt: null,
                passwordChangedAt: new Date().toISOString(),
              },
            },
          },
        });
        if (!user) {
          throw new UnauthorizedException('Invalid credentials, no user found');
        }
        return this.logUser(user);
      }
    } catch (error) {
      this.prisma.authentication.update({
        where: {
          userId: auth.userId,
        },
        data: {
          recoveryCode: null,
          recoveryToken: null,
          recoveryExpiresAt: null,
        },
      });
      throw new UnauthorizedException(
        'Invalid credentials, token invalid or expired'
      );
    }
  }

  /**
   * Requests to change the email address for a user.
   *
   * @param email - The current email address of the user.
   * @param newEmail - The new email address to be set for the user.
   * @param password - The password of the user for authentication.
   * @throws UnauthorizedException if the provided password is invalid or the user is not found.
   */
  async requestEmailChange(email: string, newEmail: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        Authentication: {
          select: {
            id: true,
            loginType: true,
            provider: true,
            lastLogin: true,
            password: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!this.encription.compare(password, user.Authentication.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const confirmToken = this.generateConfirmToken({
      email: newEmail,
      sub: user.id,
    });
    const code = generateNumber(6);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        Authentication: {
          update: {
            confirmCode: code,
            confirmToken,
            confirmExpiresAt: new Date(
              computeExpiresIn(jwtExpiresIn.confirm_token)
            ),
          },
        },
      },
    });

    this.notification.sendEmail(
      newEmail,
      'Confirm your email',
      `Your Secret Code : ${code} /n Click here to confirm your email: ${this.config.get<string>('front.url')}/auth?step=confirm-email&token=${confirmToken}`
    );
  }

  /**
   * Confirms the email change for a user.
   * @param token - The confirmation token.
   * @param code - The confirmation code.
   * @returns The logged-in user after the email change is confirmed.
   * @throws UnauthorizedException if the provided credentials are invalid.
   */
  async confirmEmailChange(token: string, code: number) {
    const auth = await this.prisma.authentication.findFirst({
      where: {
        confirmToken: token,
        confirmCode: code,
      },
      select: {
        userId: true,
        User: true,
      },
    });
    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }
    try {
      if (
        this.jwtService.verify(token, {
          secret: jwtSecretsPublic.confirm_token,
        })
      ) {
        const { email } = this.jwtService.decode(token) as { email: string };
        const user = await this.prisma.user.update({
          where: {
            id: auth.userId,
          },
          data: {
            email,
            Authentication: {
              update: {
                confirmCode: null,
                confirmToken: null,
                confirmExpiresAt: null,
              },
            },
          },
        });
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
        this.notification.sendEmail(
          user.email,
          'Email Change Success',
          `You have successfully changed your email at ${new Date().toISOString()}`
        );
        return this.logUser(user);
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Logs out a user by updating their refresh token and expiration date to null.
   * @param id - The ID of the user to log out.
   * @returns The updated user object.
   */
  async logout(id: string) {
    const logoutUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        Authentication: {
          update: {
            refreshToken: null,
            refreshExpiresAt: null,
          },
        },
      },
      include: {
        Authentication: {
          select: {
            refreshToken: true,
          },
        },
      },
    });
    // if (!logoutUser) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }
    // if (logoutUser.Authentication.refreshToken) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }

    return logoutUser;
  }

  /**
   * Changes the password for a user.
   * @param email - The email of the user.
   * @param password - The current password of the user.
   * @param newPassword - The new password for the user.
   * @throws UnauthorizedException if the provided credentials are invalid.
   */
  async changePassword({
    email,
    password,
    newPassword,
  }: {
    email: string;
    password: string;
    newPassword: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        Authentication: {
          select: {
            id: true,
            loginType: true,
            provider: true,
            lastLogin: true,
            password: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!this.encription.compare(password, user.Authentication.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        Authentication: {
          update: {
            password: this.encription.encrypt(newPassword),
            passwordChangedAt: new Date().toISOString(),
          },
        },
      },
    });

    if (!updatedUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.notification.sendEmail(
      email,
      'Password Change Success',
      `You have successfully changed your password at ${new Date().toISOString()}`
    );
  }

  /**
   * Resets the user's password.
   *
   * @param params - The parameters for resetting the password.
   * @param params.email - The email of the user.
   * @param params.password - The current password of the user.
   * @param params.newPassword - The new password to set.
   * @param params.token - The recovery token.
   * @param params.code - The recovery code.
   *
   * @throws {UnauthorizedException} If the credentials are invalid, the token is invalid or expired, or the user is not found.
   *
   * @returns {Promise<void>} A promise that resolves when the password has been successfully reset.
   */
  async resetPassword({
    email,
    password,
    token,
    code,
  }: {
    email: string;
    password: string;
    token: string;
    code: number;
  }) {
    try {
      this.jwtService.verify(token, {
        secret: jwtSecretsPublic.recovery_token,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
        include: {
          Authentication: {
            select: {
              id: true,
              loginType: true,
              provider: true,
              lastLogin: true,
              password: true,
              recoveryToken: true,
              recoveryCode: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.Authentication.recoveryToken !== token) {
        throw new UnauthorizedException('Invalid token');
      }

      if (user.Authentication.recoveryCode !== code) {
        throw new UnauthorizedException('Invalid code');
      }

      const updatedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          Authentication: {
            update: {
              password: this.encription.encrypt(password),
              passwordChangedAt: new Date().toISOString(),
              recoveryToken: null,
              recoveryCode: null,
            },
          },
        },
        include: {
          Authentication: {
            select: {
              id: true,
              loginType: true,
              provider: true,
              lastLogin: true,
            },
          },
        },
      });

      if (!updatedUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      this.notification.sendEmail(
        email,
        'Password Change Success',
        `You have successfully changed your password at ${new Date().toISOString()}`
      );

      return this.logUser(updatedUser);
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid credentials, token invalid or expired'
      );
    }
  }

  async logDemoUser() {
    const user = await this.prisma.user.findFirst({
      where: {
        email: 'demo@demo.fr',
      },
      include: {
        Authentication: {
          select: {
            id: true,
            loginType: true,
            provider: true,
            lastLogin: true,
          },
        },
      },
    });

    return this.logUser(user);
  }
}
