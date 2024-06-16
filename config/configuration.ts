export default () => ({
  port: parseInt(process.env.PORT, 10),
  mail: {
    host: 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT, 10),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    url: process.env.DATABASE_URL,
  },
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  front: {
    url: process.env.FRONT_URL,
  },
});
