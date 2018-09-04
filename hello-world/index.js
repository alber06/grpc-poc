/* eslint-disable no-console */

const caller = require('grpc-caller');
const hapi = require('hapi');
const boom = require('boom');
const path = require('path')

const helloProto = path.resolve(__dirname, './hello.proto')
const worldProto = path.resolve(__dirname, './world.proto')


const helloClient = caller('hello:50051', helloProto, 'HelloService')
const worldClient = caller('world:50051', worldProto, 'WorldService')


// Create a server with a host and port
const server = new hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: 8080,
});

// Add the route
server.route({
  method: 'GET',
  path: '/{name?}',
  handler(request, reply) {
    let hello

    helloClient.hello({})
    .then(res => {
      hello = res
      return worldClient.say({ name: request.params.name })
    })
    .then(name => {
      reply(`${hello.value} ${name.name}`);
    })
    .catch(err => reply(boom.badRequest(err)));
  }
});

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
