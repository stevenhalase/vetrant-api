require('dotenv').config();

const hapi = require('hapi');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const User = require('./models/User');
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
  
  server.route([]);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();