var mockery = require('mockery'),
    StringStream = require('string-stream'),
    latexBackend,
    should = require('should');
function Application() {
  this._cache = {};
}
Application.prototype.register = function (key, scope) {
  this._cache[key] = scope;
};
Application.prototype.require = function (key) {
  return this._cache[key];
};
function Mistore() {
  this.backend = {};
}
Mistore.prototype.render = function (doc, stream, arg, next) {
  var b = this.backend[doc.type];
  b = new b();
  b.start(doc, stream, arg, next);
};
function EJSLatexBackend() {
}
EJSLatexBackend.prototype.start = function (doc, stream, arg, next) {
  should.exists(arg.name);
  arg.name.should.equal('Tester');
  stream.once('end', next);
  stream.end('Hello Tester');
};
describe('LaTeX Backend', function () {
  var app,
      mistore;
  before(function (done) {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });
    mockery.registerMock('node-tex', function (stream, deps, callback) {
      var stringStream = new StringStream();
      stringStream.on('end', function () {
        var pdfStream = new StringStream('PDF Stream');
        stringStream.toString().should.equal('Hello Tester');
        callback(null, pdfStream);
      });
      stream.pipe(stringStream);
    });
    mockery.registerAllowable('..', true);
    latexBackend = require('..');
    app = new Application();
    app.register('mistore', new Mistore());
    mistore = app.require('mistore');
    mistore.backend['ejs-latex'] = EJSLatexBackend;
    latexBackend(app, done);
  });
  it('should render correctly', function (done) {
    var stream = new StringStream();

    /*! First the mistore machinery is installed.  This will load the ejs
     * backend automatically so that we can test it. */

    mistore.render(
      {
        type: 'latex',
        template: 'Hello <%= name %>'
      },
      stream,
      {
        name: 'Tester'
      },
      function (error) {
        if (error) {
          done(error);
        } else {
          stream.toString().should.equal('PDF Stream');
          done();
        }
      }
    );
  });
});
