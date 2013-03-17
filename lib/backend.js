var fs = require('fs'),
    path = require('path'),
    StringStream = require('string-stream'),
    nodeTex = require('node-tex'),
    config = this.configuration || {},
    latexTemp;
module.exports = function (mistore) {
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
      if (error) {
        next(error);
        return;
      }

      /*! The generated source is then fed into node-tex. */

      nodeTex(
        stringStream,
        this._dependencyStreams,
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
    ejsLatex.start(doc, stringStream, arg, render);
  };
  Backend.prototype.dependencyStream = function (name) {
    var s = new StreamString();
    s.filename = name;
    this._dependencyStreams.push(s);
    return s;
  };
  return Backend;
};
