module.exports = app => {
  'use strict';
  const express = require('express');
  const carCtrl = require('../controllers/carCtrl')(app.locals.db);
  const router = express.Router();

  router.post('/', carCtrl.create);
  router.put('/', carCtrl.update);
  router.get('/', carCtrl.findAll);
  router.get('/unlink', carCtrl.findUnlinkedCars);
  router.get('/unlinkAndLinkedCarsForPerson', carCtrl.findUnlinkedCarsAndLinkedCarsForPerson);
  router.get('/:id', carCtrl.find);
  router.delete('/:id', carCtrl.destroy);

  return router;
};
