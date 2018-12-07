require('dotenv').config();

const hapi = require('hapi');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const User = require('./models/User');
const Avatar = require('./models/Avatar');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Like = require('./models/Like');
const Dislike = require('./models/Dislike');
const Channel = require('./models/Channel');

/* swagger section */
const Inert = require('inert');
const Vision = require('vision');
const Joi = require('joi');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const server = hapi.server({
  port: process.env.PORT,
  routes: {
    cors: true
  }
});

mongoose.connect(process.env.MONGOURI);

mongoose.connection.once('open', () => {
	console.log('connected to database');
});

const init = async () => {

  await server.register([
		Inert,
		Vision,
		{
			plugin: HapiSwagger,
			options: {
				info: {
					title: 'Vetrant API Documentation',
					version: Pack.version
				}
			}
		}
  ]);
  
  server.route([
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

					return newUser.save();
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
          
					const user = await User.findOne({ username })
						.exec().then(async (docs) => {
								const options = {
									path: "image",
									model: "Avatar",
								};

								return await User.populate(docs, options);
							})

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
						var base64data = new Buffer(file, 'binary').toString('base64');

						const newAvatar = new Avatar({
							data: base64data,
							type: fileType,
							name: fileName,
							user: user._id
						});

						const savedAvatar = await newAvatar.save();
						user.image = savedAvatar._id;
						return user.save()
							.then(async (docs) => {
								const options = {
									path: "image",
									model: "Avatar",
								};

								return await User.populate(docs, options);
							})
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
	]);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();