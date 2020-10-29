import Store from 'electron-store';

const store = new Store();
export default {
  mongoose: {
    uri: () => {
      return store.get('uri') || 'mongodb://localhost:27017/perm2';
    },
    setUri: (uri) => {
      return store.set('uri', uri);
    },
    options: {
      useFindAndModify: false,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};
