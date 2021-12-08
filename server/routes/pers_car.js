module.exports = app => {
    'use strict';
    const express = require('express');
    const pers_carCtrl = require('../controllers/pers_carCtrl')(app.locals.db);
    const router  = express.Router();

    router.post('/', pers_carCtrl.create);
    router.put('/', pers_carCtrl.update);
    router.get('/', pers_carCtrl.findAll);
    router.get('/:id', pers_carCtrl.find);
    router.delete('/:id', pers_carCtrl.destroy);

    return router;
};
