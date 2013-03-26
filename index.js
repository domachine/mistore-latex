var backend = require('./lib/backend');

/**
 * This is a backend for mistore that is used to render latex documents as pdf
 * streams.  All dependencies are fetched and written with their name to the
 * temporary directory.  When all streams are written the document is rendered
 * using pdflualatex.
 */

module.exports = function (app, next) {
  var mistore = app.require('mistore'),
      Backend = backend(app, mistore);
  mistore.backend.latex = Backend;
  next();
};
