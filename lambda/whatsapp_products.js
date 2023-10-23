/* eslint-disable @typescript-eslint/camelcase */
const whatsapp_products = [
  {
    uuid: '6e38eba0-d673-4a35-82df-21bae2b6d466',
    title: 'Product 1',
    created_on: '2021-09-01T01:06:39.178493Z'
  },
  {
    uuid: '7e38eba0-d673-4a35-82df-21bae2b6d467',
    title: 'Product 2',
    created_on: '2021-09-01T01:06:39.178493Z'
  },
  {
    uuid: '8e38eba0-d683-4a35-82df-21bae2b6d468',
    title: 'Product 3',
    created_on: '2021-09-01T01:06:39.178493Z'
  },
  {
    uuid: '9e38eba0-d683-4a35-82df-21bae2b6d468',
    title: 'Product 4',
    created_on: '2021-09-01T01:06:39.178493Z'
  }
];

const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
  cb(null, getOpts({ body: JSON.stringify({ results: whatsapp_products }) }));
