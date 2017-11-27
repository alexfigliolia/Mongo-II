const fs = require('fs');

let savedPosts = null;

const Post = require('./post.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(
  'mongodb://localhost/posts',
  { useMongoClient: true }
);

const readPosts = () => {
  // cache posts after reading them once
  if (!savedPosts) {
    const contents = fs.readFileSync('posts.json', 'utf8');
    savedPosts = JSON.parse(contents);
  }
  return savedPosts;
};

const populate = () => {
  const populatePosts = () => {
    // TODO: implement this
    const posts = readPosts();
    const promises = posts.map(p => new Post(p).save());
    return Promise.all(promises);
  };
  return populatePosts()
    .then(() => {
      console.log('done');
      mongoose.disconnect();
    })
    .catch((err) => {
      console.log('ERROR', err);
      throw new Error(err);
    });
};

populate();

module.exports = { readPosts, populate };
