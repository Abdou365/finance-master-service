import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
describe('AuthService', () => {
  let service: AuthService;

  describe('generateAccessToken', () => {
    it('should generate an access token', () => {
      // Create a mock payload
      const payload = { email: 'test@example.com', sub: '123' };

      // Call the generateAccessToken method
      const accessToken = service.generateAccessToken(payload);

      // Assert that the access token is not empty
      expect(accessToken).toBeTruthy();
    });
  });

  // ...
});
