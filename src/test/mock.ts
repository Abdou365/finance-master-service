export class MockConfigService {
  get(key: string) {
    const config = {
      'mail.user': 'test@example.com',
      'mail.host': 'smtp.example.com',
      'mail.port': 587,
      'mail.pass': 'password',
    };
    return config[key];
  }
}

export class MockMailerService {
  // Add any methods used by ItemService here
  sendMail() {
    return true;
  }
}