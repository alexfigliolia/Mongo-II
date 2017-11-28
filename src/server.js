const bodyParser = require('body-parser');
const express = require('express');

const Post = require('./post.js');

const STATUS_USER_ERROR = 422;

const server = express();
// to enable parsing of json bodies for post requests

server.use(bodyParser.json());

const myErrorHandler = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (typeof err === 'string') {
    res.json({ error: err });
  } else {
    res.json(err);
  }
};

// TODO: write your route handlers here
server.get('/accepted-answer/:soID', (req, res) => {
  const { soID } = req.params;
  Post.find({ soID })
    .select('acceptedAnswerID')
    .exec((err, acID) => {
      if (err) {
        res.status(STATUS_USER_ERROR).json({ 'something went wrong': err });
      } else {
        Post.find({ soID: acID })
          .exec((err2, ans) => {
            if (err2) {
              res.status(STATUS_USER_ERROR).json({ 'something went wrong': err2 });
            } else {
              res.status(200).json(ans);
            }
          });
      }
    });
});

server.get('/top-answer/:soID', (req, res) => {
  const { soID } = req.params;
  Post.findOne({ soID }, (err, post) => {
    if (err || post === null || post.length === 0) {
      myErrorHandler('something went wrong', res);
      return;
    }
    Post.findOne({ soID: { $ne: post.acceptedAnswerID }, parentID: post.soID })
      .sort({ score: -1 })
      .exec((err2, ans) => {
        if (err2 || ans === null) {
          myErrorHandler(err2, res);
          return;
        }
        res.status(200).json(ans);
      });
  });
});

server.get('/popular-jquery-questions', (req, res) => {
  Post.find({
    tags: 'jquery',
    parentID: null,
    $or: [{ score: { $gt: 5000 } }, { 'user.reputation': { $gt: 200000 } }]
  })
    .exec((err, posts) => {
      if (err || posts.length === 0) {
        myErrorHandler(err, res);
        return;
      }
      res.status(200).json(posts);
    });
});

server.get('/npm-answers', (req, res) => {
  Post.find({ tags: 'npm', parentID: null }, (err, qus) => {
    if (err || qus.length === 0) {
      myErrorHandler(err, res);
      return;
    }
    Post.find({ parentID: { $in: qus.map(qu => qu.soID) } })
      .exec((err2, ans) => {
        if (err2 || qus.length === 0) {
          myErrorHandler(err2, res);
          return;
        }
        res.status(200).json(ans);
      });
  });
});

module.exports = { server };
