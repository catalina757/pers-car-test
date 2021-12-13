"use strict";

module.exports = db => {
    return {
        create: (req, res) => {
            db.models.Person.create(req.body).then((person) => {
                if(typeof req.body.Pers_Cars !== 'undefined' && req.body.Pers_Cars !== null && req.body.Pers_Cars.length) {
                    let Cars = req.body.Pers_Cars;

                    for (let i = 0; i < Cars.length; i++) {
                        db.models.Pers_Car.create({
                            CarId: Cars[i].id,
                            PersonId: person.id,
                        });
                    }
                }

                res.send({ success: true });
            }).catch(() => res.status(401));
        },

        update: (req, res) => {
            db.models.Person.update(req.body, { where: { id: req.body.id } }).then(() => {
                db.models.Pers_Car.destroy({where: {PersonId: req.body.id} }).then(() => {
                    let Cars = req.body.Pers_Cars;

                    for(let i = 0; i < Cars.length; i++) {

                        db.models.Pers_Car.create({
                            CarId: Cars[i].hasOwnProperty('CarId') ? Cars[i].CarId : Cars[i].id,
                            PersonId: req.body.id,
                        });
                    }

                    setTimeout(() => {return res.send({ success: true }); }, 1000);
                }).catch(() => res.status(401));

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
