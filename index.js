var package = require('./package');
module.exports = {
  name: package.name,
  dependencies: [
    require('mistore'),
    require('mistore-ejs-latex')
  ],
  install: require('./lib')
};
