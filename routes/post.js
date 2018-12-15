const Joi = require('joi');
const Image = require('../models/Image');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Dislike = require('../models/Dislike');

module.exports = [
  {  
    method: 'POST',
    path: '/api/v1/post/',
    config: {
      description: 'Create post.',
      tags: ['api', 'v1', 'post'],
      handler: async (req, reply) => {
        const {
          user,
          channel,
          title,
          content,
          file,
          fileName,
          fileType,
          giphyUrl
        } = req.payload;
        
        try {
          const post = new Post({
            user,
            channel,
            content,
            title,
            giphyUrl,
            date: new Date().getTime()
          })

          if (file) {
            const base64data = new Buffer(file, 'binary').toString('base64');
            const image = new Image({
              user,
              data: base64data,
              type: fileType,
              name: fileName
            });

            const savedImage = await image.save();
            post.image = savedImage._id;
          }
          
          return post.save();
        } catch (error) {
          console.log(error);
          return error;
        }
      },
      payload: {
        output: 'data',
      }
    }
  },{
    method: 'POST',
    path: '/api/v1/comment/',
    config: {
      description: 'Create comment.',
      tags: ['api', 'v1', 'comment'],
      handler: async (req, reply) => {
        const {
          user,
          post,
          content,
          file,
          fileName,
          fileType,
          giphyUrl
        } = req.payload;
        
        try {
          const comment = new Comment({
            user,
            post,
            content,
            giphyUrl,
            date: new Date().getTime()
          })

          if (file) {
            const base64data = new Buffer(file, 'binary').toString('base64');
            const image = new Image({
              user,
              data: base64data,
              type: fileType,
              name: fileName
            });

            const savedImage = await image.save();
            comment.image = savedImage._id;
          }
          
          return comment.save().then(async (docs) => {
            let popComment = await Comment.populate(docs, { path: "user", model: "User" });
            popComment = await Comment.populate(docs, { path: "image", model: "Image" });
            popComment = await Comment.populate(docs, { path: "likes", model: "Like" });
            popComment = await Comment.populate(docs, { path: "dislikes", model: "Dislike" });
            return popComment;
          });
        } catch (error) {
          console.log(error);
          return error;
        }
      },
      payload: {
        output: 'data',
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/like/',
    config: {
      description: 'Create like.',
      tags: ['api', 'v1', 'like'],
      handler: async (req, reply) => {
        const {
          user,
          post,
          comment
        } = req.payload;
        
        try {
          const like = new Like({
            user,
            post,
            comment,
            date: new Date().getTime()
          })
          
          return like.save();
        } catch (error) {
          console.log(error);
          return error;
        }
      },
      validate: {
        payload: {
          user: Joi.string()
              .required()
              .description('User Id'),
          post: Joi.string()
              .description('Post Id'),
          comment: Joi.string()
              .description('Comment Id')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/dislike/',
    config: {
      description: 'Create dislike.',
      tags: ['api', 'v1', 'dislike'],
      handler: async (req, reply) => {
        const {
          user,
          post,
          comment
        } = req.payload;
        
        try {
          const dislike = new Dislike({
            user,
            post,
            comment,
            date: new Date().getTime()
          })
          
          return dislike.save();
        } catch (error) {
          console.log(error);
          return error;
        }
      },
      validate: {
        payload: {
          user: Joi.string()
              .required()
              .description('User Id'),
          post: Joi.string()
              .description('Post Id'),
          comment: Joi.string()
              .description('Comment Id')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/post/user/{userId}',
    config: {
      description: 'Get all user posts.',
      tags: ['api', 'v1', 'post'],
      handler: (req, reply) => {
        const { userId } = req.params;
        return Post.find({ user: userId });
      },
      validate: {
        params: {
          userId: Joi.string()
                    .required()
                    .description('User Id')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/comment/user/{userId}',
    config: {
      description: 'Get all user comments.',
      tags: ['api', 'v1', 'comment'],
      handler: (req, reply) => {
        const { userId } = req.params;
        return Comment.find({ user: userId });
      },
      validate: {
        params: {
          userId: Joi.string()
                    .required()
                    .description('User Id')
        }
      }
    }
  }
]