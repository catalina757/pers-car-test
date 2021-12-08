"use strict";

module.exports = db => {
    return {
        create: (req, res) => {
            db.models.Person.create(req.body).then(() => {
                res.send({ success: true });
            }).catch(() => res.status(401));
        },

        update: (req, res) => {
            db.models.Person.update(req.body, { where: { id: req.body.id } }).then(() => {
                res.send({ success: true });
            }).catch(() => res.status(401));
        },

        findAll: (req, res) => {
            db.models.Person.findAll({
                include: [
                    {
                        model: db.models.Pers_Car,

                        include: [
                            {
                                model: db.models.Car
                            }
                        ]
                    },
                ],
                // logging: console.log
            }).then(resp => {
                res.send(resp);
            }).catch(() => res.status(401));
        },

        find: (req, res) => {
             // db.query(`SELECT id, cnp, nume, prenume, 'ceva' as x
             // FROM "Person" WHERE id = ${req.params.id}`, { type: db.QueryTypes.SELECT})

            db.models.Person.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    {
                        model: db.models.Pers_Car,
                        include: [
                            {
                                model: db.models.Car
                            }
                        ]
                    },
                ],
                // logging: console.log
            }).then(resp => {
                    res.send(resp);
            }).catch(() =>
                res.status(401)
            );
        },

        destroy: (req, res) => {
            db.query(`DELETE FROM "Person" WHERE id = ${req.params.id}`, { type: db.QueryTypes.DELETE }).then(() => {
                res.send({ success: true });
            }).catch(() => res.status(401));
        }
    };
};
