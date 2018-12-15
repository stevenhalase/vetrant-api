const Joi = require('joi');
const Channel = require('../models/Channel');
const Post = require('../models/Post');

module.exports = [
  {
    method: 'GET',
    path: '/api/v1/channel/',
    config: {
      description: 'Get all channels.',
      tags: ['api', 'v1', 'channel'],
      handler: (req, reply) => {
        return Channel.find();
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/channel/',
    config: {
      description: 'Create channel.',
      tags: ['api', 'v1', 'channel'],
      handler: (req, reply) => {
        const { name } = req.payload;
  
        const newChannel = new Channel({
          name
        });
  
        return newChannel.save();
      },
      validate: {
        payload: {
          name: Joi.string()
              .required()
              .description('Channel name')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/post/channel/{channelId}',
    config: {
      description: 'Get all channel posts.',
      tags: ['api', 'v1', 'channel'],
      handler: (req, reply) => {
        const { channelId } = req.params;
        return Post.find({ channel: channelId });
      },
      validate: {
        params: {
          channelId: Joi.string()
                    .required()
                    .description('Channel Id')
        }
      }
    }
  }
]