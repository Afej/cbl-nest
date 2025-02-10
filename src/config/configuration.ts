export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb://root:example@localhost:27017/bank?authSource=admin',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
  },
});
