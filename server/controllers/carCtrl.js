module.exports = db => {
    'use strict';

    return {
        create: (req, res) => {
            db.models.Car.create(req.body).then(() => {
                res.send({ success: true });
            }).catch(() => res.status(401));
        },

        update: (req, res) => {
            db.models.Car.update(req.body, { where: { id: req.body.id } }).then(() => {
                res.send({ success: true })
            }).catch(() => res.status(401));
        },

        findAll: (req, res) => {
            db.query(`SELECT id, marca, model, an_fab, cap_cil, imp
      FROM "Car"
      ORDER BY id`, { type: db.QueryTypes.SELECT}).then(resp => {
                res.send(resp);
            }).catch(() => res.status(401));
        },

        findUnlinkedCars: (req, res) => {
            db.query(`SELECT id, marca, model, an_fab, cap_cil, imp
      FROM "Car" WHERE id NOT IN (SELECT "CarId" FROM "Pers_Car")
      ORDER BY id`, { type: db.QueryTypes.SELECT}).then(resp => {
                res.send(resp);
            }).catch(() => res.status(401));
        },

        findUnlinkedCarsAndLinkedCarsForPerson: (req, res) => {
            db.query(`SELECT id, marca, model, an_fab, cap_cil, imp
                        FROM "Car"
                        WHERE id NOT IN (SELECT "CarId" FROM "Pers_Car" WHERE "PersonId" != ${req.query.id})
      ORDER BY id`, { type: db.QueryTypes.SELECT}).then(resp => {
                res.send(resp);
            }).catch(() => res.status(401));
        },

        find: (req, res) => {
            db.query(`SELECT id, marca, model, an_fab, cap_cil, imp
      FROM "Car" WHERE id = ${req.params.id}`, { type: db.QueryTypes.SELECT}).then(resp => {
                res.send(resp[0]);
            }).catch(() => res.status(401));
        },

        destroy: (req, res) => {
            db.query(`DELETE FROM "Car" WHERE id = ${req.params.id}`, { type: db.QueryTypes.DELETE }).then(() => {
                res.send({ success: true });
            }).catch(() => res.status(401));
        }
    };
};
