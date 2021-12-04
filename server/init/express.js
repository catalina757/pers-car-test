module.exports = (app, config)=> {
  'use strict';
  let express = require('express'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    favicon = require('serve-favicon'),
    path = require('path'),
    helmet = require('helmet'),
    multer = require('multer'),
    timeout = require('express-timeout-handler');

  let options = {
    timeout: 27000,
    onTimeout: function (req, res) {
      res.status(503).end();
    }
    //disable: ['write', 'setHeaders', 'send', 'json', 'end']
  };
  app.use(timeout.handler(options));
  app.use(compression());
  app.use(helmet({
    contentSecurityPolicy: false
  }));

  app.disable('x-powered-by');
  app.use(express.static(path.join(config.path, '/public')));
  app.set('views', config.path + '/server/views');
  app.set('view engine', 'pug');
  app.use(favicon('./public/app/images/favicon.ico'));
  app.use(multer({dest:'./tempReports/'}).any());
  app.use(bodyParser.json({limit: '10mb'}));
  app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));
  app.use(cookieParser());
  app.set('appPath', config.path + '/public');
  app.use(morgan('dev'));

  if ('dev' === config.env) {
    //app.use(require('connect-livereload')());
    app.use(require('connect-livereload')({port: 35720}));
    app.disable('view cache');
  }
};
