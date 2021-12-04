module.exports = db => {
  'use strict';
  const {error: rh} = require('./requestHandler');
  const rhs = require('./requestHandler').success;
  const emailSender = require('./emailSender')(global.smtpTransportYour);
  const _ = require('lodash');
  const async = require('async');
  const fs = require('fs');
  const promise = require('node-promise').Promise;
  const moment = require('moment');
  const https = require('https');

  function logError(user, action, err, res) {
    console.log(action, err);
    let text = 'Data eroare: ' + (new Date()) + '\n\n';
    text += (user && user.unit) ? ('Unitate: ' + user.unit.name + ', CUI: ' + user.unit.cui + (user ? ', id: ' + user.id : null) + '\n\n') : 'server side problems';
    text += 'Acțiune: ' + action + '\n\nEroare: ' + err.toString();
    emailSender.sendMailErr(text);
    db.models.LogError.create({id_user: user ? user.id : null, id_tax_payer: user && user.id_tax_payer ? user.id_tax_payer : null, action: action, error: err ? err.toString() : '', detail: err ? JSON.stringify(err, null, 4) : ''}).then(() => {
      if (res) {
        res.status(400);
        res.end();
      }
    }).catch(() => {
      if (res) {
        res.status(400);
        res.end();
      }
    });
  }

  return {
    /* ---------------------------------------------- NO DB utils ---------------------------------------------- */
    renderPdf: (ob, res, req) => {
      const renderer = require('../init/pdf')(req.app);
      renderer.renderer(ob, (err, pdfPath) => {
        if (err !== true) {
          logError(req.user, 'error render PDF', err, res);
        } else if (pdfPath) {
          res.download(pdfPath, '', err => {
            if (err) {
              logError(req.user, 'error download static pdf', err, res);
            }
            fs.unlink(pdfPath, errUnlink => {
              if (errUnlink) {
                logError(req.user, 'error unlink static pdf file', errUnlink, res);
              }
            });
          });
        } else {
          rh(res, 'No pdf path found', err);
        }
      });
    },

    renderMultiplePdf: (ob, res, req) => {
      const renderer = require('../init/pdf')(req.app);
      const p = new promise();
      renderer.renderer(ob, (err, pdfPath, html) => {
        if (err !== true) {
          p.reject(err);
        } else if (pdfPath) {
          p.resolve({pdfPath, html});
        } else {
          p.reject(err);
        }
      });
      return p;
    },

    parseNumber: strNumber => {
      if (!strNumber || isNaN(strNumber) || strNumber.toString().length === 0) {
        return 0;
      }
      return parseFloat(strNumber.toString());
    },

    randomString: (len, charSet) => {
      charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var randomString = '';
      for (let i = 0; i < len; i++) {
        let randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
      }
      return randomString;
    },

    replaceDiacritics: text => text ? text.toLowerCase().normalize('NFKD').replace(/[^\w]/g, '') : null,

    replaceTabs: text => {
      if (text && text.length > 0) {
        let re = new RegExp('\n', 'g'),
          re1 = new RegExp('\t', 'g'),
          reLine = new RegExp('<p></p>', 'g');
        text = text.replace(re1, '&emsp;&emsp;');
        text = '<p>' + text.replace(re, '</p><p>') + '</p>';
        text = text.replace(reLine, '<p>&nbsp;</p>');
      }
      return text;
    },

    replaceWithTab: text=> {
      if (text && text.length > 0) {
        let re = new RegExp('\n', 'g'),
          re1 = new RegExp('\t', 'g');
        text = text.replace(re1, '&#8195;');
        return text.replace(re, '<br>');
      }
      return text;
    },

    monthDiff: (startDate, endDate) => {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      let months;
      months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
      months -= startDate.getMonth() + 1;
      months += endDate.getMonth() + 1;
      return months <= 0 ? 0 : months;
    },

    divideByDeadlines: (value, terms, rounded) => {
      let arr = [], sum = 0, roundFraction = rounded ? Math.round((value / terms).toFixed(2)) : parseFloat((value / terms).toFixed(2));
      for (let i = 0; i < terms; i++) {
        arr.push(roundFraction);
        sum += roundFraction;
      }
      sum = sum.toFixed(2);
      if (rounded) {
        let diff = value - sum;
        if (diff > 0) {
          for (let i = 0; i < diff; i++) {
            arr[i]++;
          }
        } else {
          for (let i = arr.length - 1; i >= 0; i--) {
            if (diff !== 0) {
              arr[i]--;
              diff++;
            } else {
              break;
            }
          }
        }
      } else {
        let diff = (value - sum).toFixed(2);
        if (diff > 0) {
          for (let i = 0; i < diff * 100; i++) {
            arr[i] += 0.01;
          }
        } else {
          for (let i = arr.length - 1; i >= 0; i--) {
            if (parseFloat(diff) !== 0) {
              arr[i] = (parseFloat(arr[i]) - 0.01).toFixed(2);
              diff = (parseFloat(diff) + 0.01).toFixed(2);
            } else {
              break;
            }
          }
        }
      }
      return arr;
    },

    currencyWords: amount => {
      let exp = ['', 'mii', 'milioane', 'miliarde', 'trilioane'];
      let dec = ['', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci', 'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci'];
      let sing = ['', 'una', 'doua', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'noua', 'zece',
        'unsprezece', 'doisprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece'];
      // Round to two decimal points and format as a string
      let str = parseFloat(amount).toFixed(2);
      // Extract the integer part and the fraction part
      let intStr = str.substring(0, str.length - 3);
      let frac = str.substring(str.length - 2);
      // Compute the number of three-digit groups
      let tot = '';
      let len = intStr.length;
      let group = Math.floor(len / 3) + (len % 3 === 0 ? 0 : 1);

      // For each group ...
      for (let g = group; g > 0; --g) {
        let p = len - 3 * g;
        let s = '';
        // Format the hundreds
        if (p >= 0 && intStr[p] !== '0') {
          s += sing[parseInt(intStr[p])] + (parseInt(intStr[p]) === 1 ? ' suta' : ' sute');
        }
        // Format values between 1 and 99
        if (p >= -1) {
          if (intStr[p + 1] < '2') {
            if (s !== '') {
              s += ' ';
            }
            s += sing[10 * parseInt(intStr[p + 1]) + parseInt(intStr[p + 2])];
          } else {
            if (s !== '') {
              s += ' ';
            }
            s += dec[parseInt(intStr[p + 1])];
            if (intStr[p + 2] > '0') {
              s += ' și ' + sing[parseInt(intStr[p + 2])];
            }
          }
          // Special case if amount < 10
        } else if (intStr[p + 2] > '0') {
          if (s !== '') {
            s += ' ';
          }
          if (parseInt(intStr[p + 2]) === 1) {
            if (exp[g - 1] === 'milioane' || exp[g - 1] === 'miliarde' || exp[g - 1] === 'trilioane') {
              s += 'un';
            }
            if (exp[g - 1] === 'mii') {
              s += 'una';
            }
          } else {
            s += sing[parseInt(intStr[p + 2])];
          }
        }

        // Add exponent descriptor
        if (s !== '') {
          let e = exp[g - 1];
          if (parseInt(intStr[p + 2]) === 1) {
            if (e === 'mii') {
              e = 'mie';
            }
            if (e === 'milioane') {
              e = 'milion';
            }
            if (e === 'miliarde') {
              e = 'miliard';
            }
            if (e === 'trilioane') {
              e = 'trilion';
            }
          }
          if (e !== '') {
            s += ' ' + e;
          }
        }
        // Append to total string
        if (tot !== '') {
          tot += ' ';
        }
        tot += s;
      }
      // Append 'dollar(s)'
      let d = parseInt(intStr);
      if (d === 1) {
        tot += ' leu';
      } else if (d > 1) {
        tot += ' lei';
      }
      // Append fractional part, if not zero
      if (frac !== '00') {
        if (tot !== '') {
          //tot += ' si ';
          tot += ' , ';
        }
        //let c = '';
        //if (frac[0] < '2') {
        //    c = sing[10 * parseInt(frac[0]) + parseInt(frac[1])];
        //    if (c === 'una') {
        //        c = 'un';
        //    }
        //    if (c === 'doua') {
        //        c = 'doi';
        //    }
        //} else {
        //    c = dec[parseInt(frac[0])];
        //    if (frac[1] > '0') {
        //        c += ' si ' + sing[parseInt(frac[1])];
        //    }
        //}

        tot += frac + (frac[1] === '01' ? ' ban' : ' bani');
      }
      // Special case if amount == 0
      if (tot === '') {
        tot = 'zero';
      }
      //tot = tot.toUpperCase();
      tot = tot.replace(/ /g, '');
      return tot;
    },

    getBarCode: (text, params) => {
      const bwipjs = require('bwip-js');
      let d = new promise();
      let ob = {
        bcid: 'pdf417',       // Barcode type
        text: text,
        scaleX: 1,             // 1x scaling factor
        scaleY: 2,
        height: 17,           // Bar height, in millimeters
        columns: 7,
        //includetext: true,  // Show human-readable text
        textalign: 'center'   // Always good to set this
      };
      if (params) {
        if (params.bcid) {
          ob.bcid = params.bcid;
        }
        if (params.scale) {
          ob.scale = params.scale;
        }
        if (params.height) {
          ob.height = params.height;
        }
        if (params.includetext) {
          ob.includetext = params.includetext;
        }
        if (params.columns) {
          ob.columns = params.columns;
        }
        if (params.textxalign) {
          ob.textxalign = params.textxalign;
        }
      }
      bwipjs.toBuffer(ob, function (err, png) {
        if (err) {
          d.reject(err);
          console.log(err);
          // Decide how to handle the error
          // `err` may be a string or Error object
        } else {
          d.resolve('data:image/png;base64, ' + png.toString('base64'));
          // `png` is a Buffer
          // png.length           : PNG file length
          // png.readUInt32BE(16) : PNG image width
          // png.readUInt32BE(20) : PNG image height`
        }
      });
      return d;
    },

    /* ---------------------------------------------- DB utils ---------------------------------------------- */

    getHandlebar: (unit, name) => {
      let d = new promise(), t = [], response = {};
      t.push(cb => {
        let condition = unit && unit.id ? 'OR id_unit = ' + unit.id : '';
        db.query(`SELECT content, orientation, disable_footer, footer_height
        FROM "Handlebar"
        WHERE name = '${name}' AND (id_unit is null ${condition})
        ORDER BY id_unit LIMIT 1`, {type: db.QueryTypes.SELECT}).then(resp => {
          if (resp.length) {
            response.template = resp[0];
            cb();
          } else {
            cb(`template ${name} not found`);
          }
        }).catch(e => cb(e));
      });
      //if (unit && unit.id) {
      //	t.push(cb => {
      //		db.query('SELECT antet FROM "Unit" WHERE id = ' + unit.id).then(resp => {
      //			if (resp[0].length) {
      //				unit.antet = resp[0][0].antet;
      //			}
      //			cb();
      //		}).catch(e => cb(e));
      //	});
      //}
      async.parallel(t, e => {
        if (!e) {
          d.resolve(response);
        } else {
          d.reject(e);
        }
      });
      return d;
    },

    updateLastLogin: idUser => {
      if (idUser) {
        let tasks = [];
        tasks.push(cb => {
          db.query(`UPDATE "User" SET last_login = now() WHERE id = ${idUser}`).then(() => cb()).catch(e => cb(e));
        });
        tasks.push(cb => {
          db.query(`UPDATE "UserAction" SET date=now(), details=details || ';' || now()::text WHERE action = 'LogIn' AND id_user = ${idUser}`).then(resp => {
            if (resp[1].rowCount > 0) {
              cb();
            } else {
              db.query(`INSERT INTO "UserAction"(action, date, details, "createdAt", "updatedAt", id_user) VALUES ('LogIn', now(), now(), now(), now(), ${idUser})`).then(() => cb()).catch(e => cb(e));
            }
          }).catch(e => cb(e));
        });
        async.parallel(tasks, () => {
          return null;
        });
      }
    },

    logError: logError,

    logAction: (idUser, action, details, id_tax_payer, isReport) => {
      if (idUser) {
        db.models.UserAction.create({
          id_user: idUser,
          action: action,
          details: details,
          id_tax_payer: id_tax_payer ? id_tax_payer : null,
          date: new Date(),
          is_report: (isReport !== null || isReport !== undefined ? isReport : null)
        }).catch(e => console.log('create UserAction', e));
      }
    },

    checkBnrCurrency: checkBnrCurrency
  };

  function checkBnrCurrency() {
    checkBnr();
    setTimeout(()=>checkBnrCurrency(), 1800000);
  }

  function checkBnr(date) {
    let currentDate = moment().format('YYYY-MM-DD');
    let yesterdayCurrency, todayCurrency, nextCurrency;
    let t = [], lastDate, draftCurrency;
    t.push(cb => {
      db.query(`SELECT id, name FROM "Currency" WHERE name != 'RON' ORDER BY id`, {type: db.QueryTypes.SELECT}).then(r => {
        draftCurrency = r;
        cb();
      }).catch(e=>cb(e));
    });
    t.push(cb => {
      db.query(`SELECT MAX(date) AS date FROM "CurrencyData" `, {type: db.QueryTypes.SELECT}).then(r => {
        lastDate = r[0].date;
        cb();
      }).catch(e=>cb(e));
    });
    t.push(cb => {
      db.query(`SELECT sync FROM "CurrencyData" WHERE date = NOW()::date - INTERVAL '1 day' LIMIT 1`, {type: db.QueryTypes.SELECT}).then(r => {
        if (r.length) {
          yesterdayCurrency = r[0];
        }
        cb();
      }).catch(e=>cb(e));
    });
    t.push(cb => {
      db.query(`SELECT sync FROM "CurrencyData" WHERE date = NOW()::date LIMIT 1`, {type: db.QueryTypes.SELECT}).then(r => {
        if (r.length) {
          todayCurrency = r[0];
        }
        cb();
      }).catch(e=>cb(e));
    });
    t.push(cb => {
      db.query(`SELECT id FROM "CurrencyData" WHERE date = NOW()::date + INTERVAL '1 day' LIMIT 1`, {type: db.QueryTypes.SELECT}).then(r => {
        nextCurrency = !!r.length;
        cb();
      }).catch(e=>cb(e));
    });
    async.parallel(t, err => {
      if (err) {
        logError(null, 'Create BNR currency - find max date or brn currency values', err);
      } else {
        try {
          if (moment(lastDate).dayOfYear() < moment().dayOfYear()) {
            let days = [];
            let ln = moment(currentDate).dayOfYear() + 1 - moment(lastDate).dayOfYear();
            for (let i = 0; i < ln; i++) {
              days.push(moment(moment(lastDate).add((i + 1), 'd')).format('YYYY-MM-DD'));
            }
            if(days.length){
              getCurrency(days, draftCurrency).then(r=>{
                for(let i=r.length-1; i>=0; i--){
                  if(moment(r[i].date).dayOfYear() < moment(currentDate).dayOfYear()){
                    r[i].sync = true;
                  }
                  if(r[i].date == currentDate && new Date().getHours() > 15){
                    r[i].sync = true;
                  }
                }
                db.models.CurrencyData.bulkCreate(r).then(()=>{
                  return null;
                }).catch(e=>logError(null, 'Curs valutar bulkCreate', e));
              }, e=>logError(null, 'Curs valutar - getCurrency', e));
            }
          }else {
            let t = [], query = ``;
            if(yesterdayCurrency && !yesterdayCurrency.sync){
              t.push(cb=>{
                getCurrency([moment(moment(currentDate).subtract(1, 'd')).format('YYYY-MM-DD')], draftCurrency).then(r=>{
                  for(let i=r.length-1; i>=0; i--){
                    query += `UPDATE "CurrencyData" SET value = ${r[i].value}, sync = true WHERE date = '${r[i].date}' AND id_currency = ${r[i].id_currency};`;
                  }
                  cb();
                }, e=>cb(e));
              });
            }
            if(todayCurrency && !todayCurrency.sync && new Date().getHours() > 15){
              t.push(cb=>{
                getCurrency([currentDate], draftCurrency).then(r=>{
                  for(let i=r.length-1; i>=0; i--){
                    query += `
                    UPDATE "CurrencyData" SET value = ${r[i].value}, sync = true WHERE date = '${r[i].date}' AND id_currency = ${r[i].id_currency};`;
                  }
                  cb();
                }, e=>cb(e));
              });
            }
            if(!nextCurrency){
              t.push(cb=>{
                getCurrency([moment(moment(currentDate).add(1, 'd')).format('YYYY-MM-DD')], draftCurrency).then(r=>{
                  for(let i=r.length-1; i>=0; i--){
                    query += `
                    INSERT INTO "CurrencyData"(value, "createdAt", "updatedAt", id_currency, date) VALUES (${r[i].value}, NOW(), NOW(), ${r[i].id_currency}, '${r[i].date}');`;
                  }
                  cb();
                }, e=>cb(e));
              });
            }
            async.parallel(t, e=>{
              if(e){
                logError(null, 'Curs valutar - update curs paralel', e);
              }else{
                if(query.length){
                  db.query(query).then(()=>{
                    return null;
                  }).catch(e=>logError(null, 'Curs valutar bulkCreate', e));
                }else{
                  return null;
                }
              }
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
    });
  }

  function getCurrency(days, currency){
    let key = 'LCf2Et1Qqraw1mztx4ozaXdpHELvZ8YCx7-2FspDhzhhNvjZaw';
    let p = new promise();
    let arr = [];
    let t=[];
    _.each(days, day=>{
      t.push(cb => {
        let data = '';
        https.get('https://api.openapi.ro/api/exchange/all.json?date='+day, {headers: {'x-api-key': key}}, resp => {
          resp.setEncoding('utf8');
          resp.on('data', d => data += d);
          resp.on('end', () => {
            data = JSON.parse(data);
            for(let c of currency){
              if(data.rates[c.name]){
                arr.push({
                  name: c.name,
                  value:data.rates[c.name],
                  id_currency: c.id,
                  date: day
                });
              }
            }
            cb();
          });
          resp.on('error', e => cb(e));
          resp.on('timeout', () => cb('No such file'));
        });
      });
    });
    async.parallel(t, e=>{
      if(e){
        p.reject(e);
      }else{
        p.resolve(_.orderBy(arr, ['date', 'id_currency']));
      }
    });
    return p;
  }
};
