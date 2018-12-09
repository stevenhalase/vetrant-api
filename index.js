require('dotenv').config();

const hapi = require('hapi');
const mongoose = require('mongoose');



const UserRoutes = require('./routes/user');
const PostRoutes = require('./routes/post');
const ChannelRoutes = require('./routes/channel');
const GiphyRoutes = require('./routes/giphy');

/* swagger section */
const Inert = require('inert');
const Vision = require('vision');
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
		...UserRoutes,
		...PostRoutes,
		...ChannelRoutes,
		...GiphyRoutes
	]);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();