module.exports = app => {
  'use strict';

  let errors = require('./errors');
  // app.use('/api/user', require('./routes/user')(app));

  app.use('/api/information', require('./routes/information')(app));
  app.use('/api/person', require('./routes/person')(app));
  app.use('/api/car', require('./routes/car')(app));

  app.get('/app/*', (req, res) => res.render('../../public/app/' + req.params['0']));

  app.route('*/:url(api|auth|components|app|bower_components|assets)/*').get(errors[404]);
  app.route('/').get((req, res) => res.render('admin'));
  app.route('*').get(errors[404]);
};
