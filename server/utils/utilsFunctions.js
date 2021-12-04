module.exports = db => {
	'use strict';
	const emailSender = require('./emailSender')(global.smtpTransportYour);
	const logError = require('./utils')(db).logError;
	const recalculInvoice = require('../controllers/recalcul/invoice')(db).recalcul;
	const _ = require('lodash');
	const async = require('async');

	return {
		automaticBilling: automaticBilling
	};

	function automaticBilling() {
		let date = new Date();
		let dif = parseInt((date.setHours(10, 0, 0, 0) - new Date()) / 60000);
		if (dif > 0) {
			setTimeout(() => checkForCreateInvoice(date), dif * 60000);
		} else {
			checkForCreateInvoice(date);
		}
	}

	function checkForCreateInvoice(date) {
		let currentYear = date.getFullYear();
		let currentDate = date.toISOString().substr(0, 10);
		let t = [], deadlinesInvoice, deadlinesContract, currency, series = {}, count = {}, toCreateInvoice = [];
		t.push(cb => {
			db.query(`SELECT s.date, s.deadline_date, s.quantity, s.unit_price, s.value, s.tva, s.tva_value, s.amount, s.id AS id_local_service, s.index_old, s.index_new
      ,c.id_tax_payer, c.number AS number, TO_CHAR(c.date, 'dd.mm.yyyy') AS date
      ,cf.id_series, cf.increase, cf.increase_type, cf.penalty, cf.penalty_type, cf.rounding
      ,CASE WHEN t.pf THEN cf.id_account_plan_pf ELSE cf.id_account_plan_pj END AS id_account_plan, cf.name AS service_name
      ,m.symbol AS measure_symbol, t.id_unit, u.id As id_user
      FROM "LocalService" s
      LEFT JOIN "LocalServiceContract" c ON c.id = s.id_local_service_contract
      LEFT JOIN "LocalServiceConfig" cf ON cf.id = c.id_local_service_config
      LEFT JOIN "MeasureUnit" m ON m.id = cf.id_measure_unit
      LEFT JOIN "TaxPayer" t ON t.id = c.id_tax_payer
      LEFT JOIN "User" u ON u.id_unit = t.id_unit AND u.role = 'clientAdmin'
      WHERE s.id_invoice IS NULL AND cf.id_local_service_debit_mode = 2
      ORDER BY s.date`, {type: db.QueryTypes.SELECT}).then(r => {
				deadlinesInvoice = r;
				cb();
			}).catch(e => cb(e));
		});
		t.push(cb => {
			db.query(`SELECT d.id, d.id_account_plan, d.date, d.amount, d.invoice_date, c.increase, c.increase_type, c.penalty, c.penalty_type
      ,c.number, c.date, ct.id_serie, t.id AS id_tax_payer, t.id_unit, u.id AS id_user, ct.id_measure_unit
      FROM "ContractDataDeadline" d
      RIGHT JOIN "Contract" c ON c.id = d.id_contract
      LEFT JOIN "ContractType" ct ON ct.id = c.id_contract_type
      LEFT JOIN "TaxPayer" t ON t.id = c.id_tax_payer
      LEFT JOIN "User" u ON u.id_unit = t.id_unit AND u.role = 'clientAdmin'
      WHERE d.id_invoice IS NULL AND c.id_contract_debit_mode = 2
      ORDER BY d.date`, {type: db.QueryTypes.SELECT}).then(r => {
				deadlinesContract = r;
				cb();
			}).catch(e => cb(e));
		});
		t.push(cb => {
			db.query(`SELECT cd.id AS id_currency_data, c.name, cd.value
      FROM "CurrencyData" cd
      LEFT JOIN "Currency" c ON c.id = cd.id_currency
      WHERE cd.id_currency = 2 AND cd.date = '${currentDate}'::date - INTERVAL '1 day'`, {type: db.QueryTypes.SELECT}).then(resp => {
				currency = resp.length ? resp[0] : {};
				cb();
			}).catch(e => cb(e));
		});
		t.push(cb => {
			db.query(`SELECT s.id AS id_series, CASE WHEN MAX(i.number) IS NULL THEN 1 ELSE MAX(i.number) + 1 END AS number
      FROM "Series" s
      LEFT JOIN "Invoice" i ON i.id_series = s.id
      WHERE (i.id is not null AND i.year = ${currentYear}) OR (i.id is null AND s.year = ${currentYear})
      GROUP BY s.id`, {type: db.QueryTypes.SELECT}).then(resp => {
				if (resp.length) {
					for (let i = 0; i < resp.length; i++) {
						if (!series[resp[i].id_series]) {
							series[resp[i].id_series] = resp[i].number;
							count[resp[i].id_series] = 0;
						}
					}
				}
				cb();
			}).catch(e => cb(e));
		});
		async.parallel(t, e => {
			if (e) {
				logError(null, 'checkForCreateInvoice utilsFunctions.js', e);
			} else {
				let invoice;
				//invoices for local services
				for (let i = 0; i < deadlinesInvoice.length; i++) {
					if (deadlinesInvoice[i].date <= currentDate) {
						invoice = {
							id_tax_payer: deadlinesInvoice[i].id_tax_payer,
							id_local_service: deadlinesInvoice[i].id_local_service,
							id_user: deadlinesInvoice[i].id_user,
							id_unit: deadlinesInvoice[i].id_unit,
							id_series: deadlinesInvoice[i].id_series,
							increase: deadlinesInvoice[i].increase,
							increase_type: deadlinesInvoice[i].increase_type,
							penalty: deadlinesInvoice[i].penalty,
							penalty_type: deadlinesInvoice[i].penalty_type,
							date: currentDate,
							deadline_date: deadlinesInvoice[i].deadline_date,
							number: series[deadlinesInvoice[i].id_series] ? series[deadlinesInvoice[i].id_series] + count[deadlinesInvoice[i].id_series] : null,
							year: currentYear,
							tva: deadlinesInvoice[i].tva,
							rounding: deadlinesInvoice[i].rounding,
							data: []
						};
						invoice.data.push({
							id_local_service: deadlinesInvoice[i].id_local_service,
							id_account_plan: deadlinesInvoice[i].id_account_plan,
							name: 'Serviciu local ' + deadlinesInvoice[i].service_name + ', termen de plată ' + new Date(deadlinesInvoice[i].date).toRoString() + ', index vechi ' + deadlinesInvoice[i].index_old + ', index nou ' + deadlinesInvoice[i].index_new +
							', cantitate ' + deadlinesInvoice[i].quantity + ' ' + deadlinesInvoice[i].measure_symbol + ', contract ' + deadlinesInvoice[i].number + '/' + deadlinesInvoice[i].date,
							id_measure_unit: deadlinesInvoice[i].id_measure_unit,
							deadline_date: deadlinesInvoice[i].date,
							local_service: true,
							value: deadlinesInvoice[i].quantity,
							amount: deadlinesInvoice[i].unit_price,
							amount_total: deadlinesInvoice[i].value,
							tva: deadlinesInvoice[i].tva_value,
							total: deadlinesInvoice[i].amount
						});
						if (invoice) {
							toCreateInvoice.push(invoice);
						}
						count[deadlinesInvoice[i].id_series]++;
					}
				}
				//invoices for concession contract
				invoice = null;
				for (let i = 0; i < deadlinesContract.length; i++) {
					if (deadlinesContract[i].invoice_date <= currentDate) {
						invoice = {
							id_tax_payer: deadlinesContract[i].id_tax_payer,
							id_user: deadlinesContract[i].id_user,
							id_unit: deadlinesContract[i].id_unit,
							id_series: deadlinesContract[i].id_serie,
							id_currency_data: currency.id_currency_data,
							increase: deadlinesContract[i].increase,
							increase_type: deadlinesContract[i].increase_type,
							penalty: deadlinesContract[i].penalty,
							penalty_type: deadlinesContract[i].penalty_type,
							date: currentDate,
							deadline_date: deadlinesContract[i].date,
							number: series[deadlinesContract[i].id_serie] ? series[deadlinesContract[i].id_serie] + count[deadlinesContract[i].id_serie] : null,
							year: currentYear,
							data: []
						};
						invoice.data.push({
							id_account_plan: deadlinesContract[i].id_account_plan,
							id_contract_deadline: deadlinesContract[i].id,
							id_measure_unit: deadlinesContract[i].id_measure_unit,
							contract: true,
							deadline_date: deadlinesContract[i].date,
							name: 'Contract ' + deadlinesContract[i].number + '/' + new Date(deadlinesContract[i].date).toRoString() + ', termen scadent de plată ' + new Date(deadlinesContract[i].date).toRoString(),
							value: 1,
							amount: parseFloat(deadlinesContract[i].amount)
						});
						calculateTerm(invoice.data[0]);
						if (invoice) {
							invoice.dataIds = _.map(invoice.data, 'id_contract_deadline');
							toCreateInvoice.push(invoice);
						}
						count[deadlinesContract[i].id_serie]++;
					}
				}
				if (toCreateInvoice.length) {
					t = [];
					_.forEach(toCreateInvoice, invoice => {
						if (invoice.id_local_service) {
							t.push(cb => createFromService(invoice, cb));
						} else {
							t.push(cb => createFromContract(invoice, cb));
						}
					});
					async.parallel(t, e => {
						if (e) {
							logError(null, 'checkForCreateInvoice utilsFunctions.js - parallel create', e);
						} else {
							console.log('Facturi generate automat: ' + toCreateInvoice.length);
						}
					});
				}
			}
		});
	}

	function calculateTerm(row) {
		if (row.value && row.amount) {
			row.amount_total = Math.round(row.value * row.amount * 100) / 100;
			row.tva = row.tva_value ? Math.round(row.amount_total * (row.tva_value / 100) * 100) / 100 : null;
			row.total = Math.round((row.amount_total + row.tva) * 100) / 100;
		} else {
			row.amount_total = row.tva = row.total = null;
		}
	}

	function createFromContract(invoice, callback) {
		db.models.Invoice.create(invoice).then(resp => {
			let t = [];
			t.push(cb => {
				for (let i = invoice.data.length - 1; i >= 0; i--) {
					invoice.data[i].id_invoice = resp.id;
				}
				db.models.InvoiceData.bulkCreate(invoice.data).then(() => cb()).catch(e => cb(e));
			});
			if (invoice.data) {
				t.push(cb => {
					db.query(`UPDATE "ContractDataDeadline" SET id_invoice = ${resp.id} WHERE id IN (${invoice.dataIds})`).then(() => cb()).catch(e => cb(e));
				});
			}
			async.parallel(t, e => {
				if (e) {
					db.query(`DELETE FROM "Invoice" WHERE id = ${resp.id}`).catch(e => callback(e));
				} else {
					let taxPayer = {id: invoice.id_tax_payer, id_unit: invoice.id_unit, rounded_taxes: true, year: invoice.year};
					recalculInvoice(taxPayer, callback);
				}
			});
		}).catch(e => callback(e));
	}

	function createFromService(invoice, callback) {
		db.models.Invoice.create(invoice).then(resp => {
			let t = [];
			t.push(cb => {
				for (let i = invoice.data.length - 1; i >= 0; i--) {
					invoice.data[i].id_invoice = resp.id;
				}
				db.models.InvoiceData.bulkCreate(invoice.data).then(() => cb()).catch(e => cb(e));
			});
			if (invoice.data) {
				t.push(cb => {
					db.query(`UPDATE "LocalService" SET id_invoice = ${resp.id} WHERE id = (${invoice.id_local_service})`).then(() => cb()).catch(e => cb(e));
				});
			}
			async.parallel(t, e => {
				if (e) {
					db.query(`DELETE FROM "Invoice" WHERE id = ${resp.id}`).then(e => callback(e));
				} else {
					let taxPayer = {id: invoice.id_tax_payer, id_unit: invoice.id_unit, rounded_taxes: invoice.rounding, year: invoice.year};
					recalculInvoice(taxPayer, callback);
				}
			});
		}).catch(e => callback(e));
	}

};
