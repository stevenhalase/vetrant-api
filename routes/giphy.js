const Joi = require('joi');
const axios = require('axios');
const GIPHYURL = process.env.GIPHYURL;

module.exports = [
  {
    method: 'GET',
    path: '/api/v1/giphy/{query}',
    config: {
      description: 'Search giphy.',
      tags: ['api', 'v1', 'giphy'],
      handler: async (req, reply) => {
        const { query } = req.params;
        const url = GIPHYURL.replace('{0}', encodeURIComponent(query));
        const result = await axios.get(url)
          .then(response => {
            console.log(response);
            return response;
          })
          .catch(error => {
            console.log(error);
            return error;
          });
        return result.data.data;
      },
      validate: {
        params: {
          query: Joi.string()
                    .required()
                    .description('Giphy query')
        }
      }
    }
  }
]