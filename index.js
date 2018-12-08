require('dotenv').config();

const hapi = require('hapi');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const User = require('./models/User');
const Avatar = require('./models/Avatar');
const Image = require('./models/Image');
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
		},
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
						fileType
					} = req.payload;
					
          try {
						const post = new Post({
							user,
							channel,
							content,
							title,
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
		},
		{
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
						fileType
					} = req.payload;
					
          try {
						const comment = new Comment({
							user,
							post,
							content,
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
											.description('Username')
					}
        }
			}
		}
	]);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();