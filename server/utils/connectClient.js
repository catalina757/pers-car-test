module.exports = app => {
  'use strict';

  const _ = require('lodash');
  const async = require('async');
  const jwt = require('jsonwebtoken');

  function render(res, user) {
    delete user.salt;
    delete user.password;
    let obj = user;
    obj.token = jwt.sign(obj, app.locals.config.sKey, {expiresIn: 86400});
    if (user.role === 'admin' || user.role === 'sa') {
      res.render('admin', {bootstrappedUser: obj});
    } else if (_.includes([app.locals.config.roles.clientAdmin, app.locals.config.roles.client], user.role)) {
      res.render('client', {bootstrappedUser: obj});
    } else {
      res.render('login', {success: false, message: 'Autentificare eșuată.'});
    }
  }

  function renderLogin(res, message) {
    res.render('login', {success: false, message: message});
  }

  return {
    loginClient: (req, res)=> {
      if (req.params.token) {
        jwt.verify(req.params.token, app.locals.config.sKey, function checkToken(err, decoded) {
          if (err) {
            let obj = {};
            obj.token = jwt.sign(obj, app.locals.config.sKey, {expiresIn: 60 * 60});
            res.render('login');
          } else {
            let email = decoded.email;
            if (!!email) {
              app.locals.db.query(`SELECT id, first_name, last_name, role, active, password, salt, id_unit, current_year FROM "User" WHERE email = '${email}'`, {type: app.locals.db.QueryTypes.SELECT}).then(user => {
                if (user.length) {
                  if (user[0].role !== 'admin' && user[0].role !== 'sa') {
                    let tasks = [];
                    //detalii user
                    tasks.push(cb=> {
                      app.locals.db.query(`SELECT u.email, u.phone, u.policy, p.function
                      FROM "User" u
                      LEFT JOIN "Post" p ON p.id = u.id_post
                      WHERE u.id = ${user[0].id}`, {type: app.locals.db.QueryTypes.SELECT}).then(resp => {
                        if (resp.length) {
                          user[0] = _.extend(user[0], resp[0]);
                        }
                        cb();
                      }).catch(e=>cb(e));
                    });
                    //drepturi user
                    tasks.push(cb=> {
                      app.locals.db.query(`SELECT r.selected, d.code
                      FROM "UserRight" r
                      LEFT JOIN "UserRightDraft" d ON d.id = r.id_draft
                      WHERE r.id_user = ${user[0].id} AND d.code IS NOT null`, {type: app.locals.db.QueryTypes.SELECT}).then(r => {
                        if (r.length) {
                          let rights = {};
                          for (let i = 0; i < r.length; i++) {
                            rights[r[i].code] = r[i].selected;
                          }
                          user[0].right_role = rights;
                        }
                        cb();
                      }).catch(e=>cb(e));
                    });
                    // unitate
                    tasks.push(cb=> {
                      app.locals.db.query(`SELECT u.id, u.name, u.cui, u.phone, u.fax, u.email, u.website, u.id_treasury, u.rounded_taxes, u.siruta_code, u.admin_pwd, dt.name AS treasury, TO_JSON(a.*) AS address
                      ,r.id_ranks , u.id_superior, u.module_all, u.module_contract, u.module_service, u.bonus_check, u.fine_check, u.from_max_role, u.first_from_min_role
                      FROM "Unit" u
                      LEFT JOIN (
                        SELECT a.id_county, c.name AS county_name, c.code AS county_code, a.id,a.id_village, v.name AS village_name, l.type_name AS "typeLocality", l.type_village, l.siruta_code, a.id_locality, l.name AS locality_name
                        ,a.id_street, s.name AS street, a.number, id_unit, a.postal_code
                        FROM "Address" a
                        LEFT JOIN "County" c ON c.id = a.id_county
                        LEFT JOIN "Locality" l ON l.id = a.id_locality
                        LEFT JOIN "Village" v ON v.id = a.id_village
                        LEFT JOIN "Street" s ON s.id = a.id_street
                      ) a ON a.id_unit = u.id
                      LEFT JOIN (
                        SELECT id_unit, ARRAY_REMOVE(ARRAY_AGG(DISTINCT id_rank), null) AS id_ranks
                        FROM "Address" a
                        LEFT JOIN "Village" v ON v.id_locality = a.id_locality
                        GROUP BY id_unit
                      ) r ON r.id_unit = u.id
                      LEFT JOIN "DraftTreasury" dt ON dt.id = u.id_treasury
                      WHERE u.id = ${user[0].id_unit}`, {type: app.locals.db.QueryTypes.SELECT}).then(r => {
                        if (r.length) {
                          user[0].unit = r[0];
                        }
                        cb();
                      }).catch(e=>cb(e));
                    });
                    // HCL amnistie fiscala
                    tasks.push(cb=> {
                      app.locals.db.query(`SELECT id, number FROM "Hcl" WHERE id_unit = ${user[0].id_unit} AND year = ${user[0].current_year} AND type = 'amnesty'`, {type: app.locals.db.QueryTypes.SELECT}).then(r => {
                        if(r.length) {
                          user[0].amnesty = true;
                          user[0].amnesty_number = r[0].number;
                        } else {
                          user[0].amnesty = false;
                          user[0].amnesty_number = '';
                        }
                        cb();
                      }).catch(e=>cb(e));
                    });
                    // HCL executare silita
                    tasks.push(cb=> {
                      app.locals.db.query(`SELECT id FROM "Hcl" WHERE id_unit = ${user[0].id_unit} AND year = ${user[0].current_year} AND type = 'executionExpence'`, {type: app.locals.db.QueryTypes.SELECT}).then(r => {
                        user[0].hclExecution = !!r.length;
                        cb();
                      }).catch(e=>cb(e));
                    });
                    async.parallel(tasks, e => {
                      if (e) {
                        console.log('connectClient - jwt parallel: ', e);
                      } else {
                        render(res, user[0]);
                      }
                    });
                  } else {
                    render(res, user[0]);
                  }
                } else {
                  renderLogin(res, 'Autentificare eșuată. Utilizator inexistent');
                }
              }).catch(err => {
                console.log('connectClient - find user jwt init', err);
                renderLogin(res, 'Autentificare eșuată.');
              });
            } else {
              res.render('login');
            }
          }
        });
      } else {
        res.render('login');
      }
    }
  };
};
