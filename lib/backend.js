var fs = require('fs'),
    path = require('path'),
    StringStream = require('string-stream'),
    nodeTex = require('node-tex');
module.exports = function (app, mistore) {
  var config = app.configuration || {};
  function Backend() {
    this._dependencyStreams = [];
  }
  Backend.prototype.start = function (doc, stream, arg, next) {

    /*! The renderer itself uses the ejs-latex backend to generate the tex
     * source. */

    var EJSLatex = mistore.backend['ejs-latex'],
        stringStream = new StringStream(),
        ejsLatex;
    function render(error) {
      var options,
          backendConfig;
      if (error) {
        next(error);
        return;
      }
      backendConfig = config['mistore-latex'] || {};
      backendConfig.cache = backendConfig.cache || null;
      if (backendConfig.cache) {
        options = {
          env: {
            TEXMFCACHE: backendConfig.cache
          }
        };
      }

      /*! The generated source is then fed into node-tex. */

      nodeTex(
        stringStream,
        this._dependencyStreams,
        options,
        function (error, pdfStream) {
          if (error) {
            next(error);
            return;
          }

          /*! Which then produces the PDF stream which is exposed to the
           * output */

          stream.once('end', next);
          pdfStream.pipe(stream);
        }
      );
    };
    ejsLatex = new EJSLatex();
    ejsLatex.start(doc, stringStream, arg, render.bind(this));
  };
  Backend.prototype.dependencyStream = function (name) {
    var s = new StreamString();
    s.filename = name;
    this._dependencyStreams.push(s);
    return s;
  };
  return Backend;
};
