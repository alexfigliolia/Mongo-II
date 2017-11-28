const bodyParser = require('body-parser');
const express = require('express');

const Post = require('./post.js');

const STATUS_USER_ERROR = 422;

const server = express();
// to enable parsing of json bodies for post requests

server.use(bodyParser.json());

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
  Post.find({ soID })
    .exec((err, qu) => {
      if (err) {
        res.status(STATUS_USER_ERROR).json({ 'something went wrong': err });
      } else {
        Post.find({ parentID: soID}).sort({ score: -1 }).limit(1)
          .exec((err2, high) => {
            if (err2) {
              res.status(STATUS_USER_ERROR).json({ 'something went wrong': err2 });
            } else {
              res.status(200).json(high);
            }
          });
      }
    });
});

server.get('/popular-jquery-questions', (req, res) => {
  Post.find({ 
  	tags: 'jquery', 
  	$or: [
  		{ score: { $gt: 5000 } },
  		{ 'user.reputation': { $gt: 200000 } }
  	]
  })
  	.exec((err, posts) => {
  		if(err) {
  			res.status(STATUS_USER_ERROR).json({'something went wrong': err});
  		} else {
  			res.status(200).json(posts);
  		}
  	});
});

server.get('/npm-answers', (req, res) => {
	const ids = [];
  Post.find({tags: 'npm', parentID: null})
  	.exec((err, qus) => {
  		if(err) {
  			res.status(STATUS_USER_ERROR).json({'something went wrong': err});
  		} else {
  			qus.forEach(qu => {
  				ids.push({ parentID: qu.soID });
  			});
  			Post.find({$or: ids})
  				.exec((err, ans) => {
  					if(err) {
  						res.status(STATUS_USER_ERROR).json({'something went wrong': err});
  					} else {
  						res.status(200).json(ans);
  					}
  				});
  		}
  	});
});

module.exports = { server };
