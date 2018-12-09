const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const Joi = require('joi');
const User = require('../models/User');
const Avatar = require('../models/Avatar');

module.exports = [
  {
    method: 'POST',
    path: '/api/v1/user/',
    config: {
      description: 'Create user.',
      tags: ['api', 'v1', 'user'],
      handler: async (req, reply) => {
        const { username, password } = req.payload;
        
        const user = await User.findOne({ username });

        if (user){
          return { message: 'Failed to create user' };
        }

        const newUser = new User({
          username,
          password: bcrypt.hashSync(password, salt)
        });

        return newUser.save().then(async (docs) => {
          const options = {
            path: "image",
            model: "Avatar",
          };

          return await User.populate(docs, options);
        });
      },
      validate: {
        payload: {
          username: Joi.string()
              .required()
              .description('Username'),
          password: Joi.string()
              .required()
              .description('Password')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/user/login/',
    config: {
      description: 'User login.',
      tags: ['api', 'v1', 'user'],
      handler: async (req, reply) => {
        const { username, password } = req.payload;
        
        const user = await User.findOne({ username });

        if (!user){
          return { message: 'Failed to login user' };
        }
        
        if (bcrypt.compareSync(password, user.password)) {
          return user;
        } else {
          return { message: 'Failed to login user' };
        }
      },
      validate: {
        payload: {
          username: Joi.string()
              .required()
              .description('Username'),
          password: Joi.string()
              .required()
              .description('Password')
        }
      }
    }
  },
  {  
    method: 'PUT',
    path: '/api/v1/user/avatar/',
    config: {
      description: 'User avatar update.',
      tags: ['api', 'v1', 'user'],
      handler: async (req, reply) => {
        console.log(req.payload)
        
        const { username, file, fileName, fileType } = req.payload;
        
        const user = await User.findOne({ username });

        if (!user){
          return { message: 'Failed to update user' };
        }
        
        try {
          const base64data = new Buffer(file, 'binary').toString('base64');

          const newAvatar = new Avatar({
            data: base64data,
            type: fileType,
            name: fileName,
            user: user._id
          });

          const savedAvatar = await newAvatar.save();
          user.image = savedAvatar._id;
          return user.save().then(async (docs) => {
            const options = {
              path: "image",
              model: "Avatar",
            };

            return await User.populate(docs, options);
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
  }
]