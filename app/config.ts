export default {
  mongoose: {
    connect: 'mongodb://localhost:27017/perm2',
    options: {
      useFindAndModify: false,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};