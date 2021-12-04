module.exports = () => {
  'use strict';
  const router = require('express').Router(),
    moment = require('moment-timezone');

  router.get('/', (req, res) => {
    res.send({date: moment().tz("Europe/Bucharest").format()});
    //res.send({date: moment().format()});
  });

  return router;
};