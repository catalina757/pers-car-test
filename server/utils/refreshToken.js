module.exports = app => {
  'use strict';
  const router = require('express').Router(),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    jwtRefresh = require('jsonwebtoken-refresh');

  router.get('/', (req, res) => {
    let token = req.headers['x-access-token'] || req.body.token || req.params.token;
    if (token) {
      jwt.verify(token, app.locals.config.sKey, function checkToken(err) {
        if (!err) {
          let obj = jwt.decode(token, {complete: true});
          res.send({token: jwtRefresh.refresh(obj, 60 * 60, app.locals.config.sKey, null)});
        } else {
          res.send({token: null});
        }
      });
    } else {
      res.send({token: null});
    }
  });

  router.put('/', (req, res) => {
    let token = req.headers['x-access-token'] || req.body.token || req.params.token, response = null;
    if (token) {
      jwt.verify(token, app.locals.config.sKey, function checkToken(err) {
        if (!err) {
          //app.locals.db.models.User.update({monitoring_title: req.body.monitoring_title}, {where: {id: req.body.id}}).then(() => {
            res.send({token: jwt.sign(req.body, app.locals.config.sKey, {expiresIn: 86400})});
          //}).catch(() =>res.send({token: response}));
        } else {
          res.send({token: response});
        }
      });
    } else {
      res.send({token: response});
    }
  });

  router.post('/updateTaxPlayer', (req, res) => {
    let logError = require('../utils/utils')(app.locals.db).logError;
    let token = req.headers['x-access-token'] || req.body.token || req.params.token, response = null;
    if (token) {
      jwt.verify(token, app.locals.config.sKey, function checkToken(err) {
        if (err) {
          logError(req.user, 'Update token updateTaxPlayer', err, res);
        } else {
          app.locals.db.query(`UPDATE "User" SET id_tax_payer = ${req.body.id_tax_payer} WHERE id = ${req.user.id}`).then(()=>{
            let obj = jwt.decode(token, {complete: true});
            let ob = _.extend(obj.payload, req.body);
            delete ob.iat;
            delete ob.exp;
            res.send({token: jwt.sign(ob, app.locals.config.sKey, {expiresIn: 86400})});
          }).catch(e=>logError(req.user, 'Update user id_tax_player', e, res));
        }
      });
    } else {
      res.send({token: response});
    }
  });

  router.post('/updateToken', (req, res) => {
    let logError = require('../utils/utils')(app.locals.db).logError;
    let token = req.headers['x-access-token'] || req.body.token || req.params.token, response = null;
    if (token) {
      jwt.verify(token, app.locals.config.sKey, function checkToken(err) {
        if (err) {
          logError(req.user, 'Update token updateTaxPlayer', err, res);
        } else {
          let obj = jwt.decode(token, {complete: true});
          let ob = _.extend(obj.payload, req.body);
          delete ob.iat;
          delete ob.exp;
          setAccesRol(req.user.id, req.body);
          res.send({token: jwt.sign(ob, app.locals.config.sKey, {expiresIn: 86400})});
        }
      });
    } else {
      res.send({token: response});
    }
  });

  function setAccesRol(idUser, body){
    app.locals.db.query(`SELECT id FROM "TaxPayerAccess" WHERE id_user = ${idUser} AND id_tax_payer = ${body.id_tax_payer}`, {type: app.locals.db.QueryTypes.SELECT}).then(r=>{
      let query;
      if(r.length){
        query = `UPDATE "TaxPayerAccess" SET date = NOW(), day_of = EXTRACT(DOY FROM NOW()) WHERE id = ${r[0].id};`;
      }else{
        query = `INSERT INTO "TaxPayerAccess"(date, day_of, "createdAt", "updatedAt", id_user, id_tax_payer) VALUES (NOW(), EXTRACT(DOY FROM NOW()), NOW(), NOW(), ${idUser}, ${body.id_tax_payer});`;
      }
      let details = 'Id contribuabil: ' + body.id_tax_payer+', rol: '+body.tax_payer_role;
      query += `INSERT INTO "UserAction"(action, date, details, "createdAt", "updatedAt", id_user, id_tax_payer) VALUES ('Accesare contribuabil', NOW(), '${details}', NOW(), NOW(), ${idUser}, ${body.id_tax_payer});`;
      app.locals.db.query(query).then(()=>{return null;}).catch(e=>console.log('UpdateToken - set taxPayer access', e));
    }).catch(e=>console.log('UpdateToken - set taxPayer access', e));
  }
  return router;
};