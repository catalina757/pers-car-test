"use strict";

module.exports = db => {
  return {
    create: (req, res) => {
      db.models.Person.create(req.body).then((person) => {
        if (typeof req.body.Pers_Cars !== 'undefined' && req.body.Pers_Cars !== null && req.body.Pers_Cars.length) {
          let Cars = req.body.Pers_Cars;

          for (let i = 0; i < Cars.length; i++) {
            db.models.Pers_Car.create({
              CarId: Cars[i].id,
              PersonId: person.id,
            });
          }
        }

        res.send({success: true});
      }).catch(() => res.status(401));
    },

    update: (req, res) => {
      db.models.Person.update(req.body, {where: {id: req.body.id}}).then(() => {
        db.models.Pers_Car.destroy({where: {PersonId: req.body.id}}).then(() => {
          let Cars = req.body.Pers_Cars;

          for (let i = 0; i < Cars.length; i++) {

            db.models.Pers_Car.create({
              CarId: Cars[i].hasOwnProperty('CarId') ? Cars[i].CarId : Cars[i].id,
              PersonId: req.body.id,
            });
          }

          setTimeout(() => {
            return res.send({success: true});
          }, 1000);
        }).catch(() => res.status(401));

      }).catch(() => res.status(401));
    },

    findAll: (req, res) => {
      db.query(`SELECT "Person"."id", "Person"."cnp", "Person"."varsta", "Person"."nume", "Person"."prenume", 
                "Pers_Cars"."id" AS "Pers_Cars.id", "Pers_Cars"."PersonId" AS "Pers_Cars.PersonId", "Pers_Cars"."CarId" AS "Pers_Cars.CarId", 
                "Pers_Cars->Car"."id" AS "Pers_Cars.Car.id", "Pers_Cars->Car"."marca" AS "Pers_Cars.Car.marca", "Pers_Cars->Car"."model" AS "Pers_Cars.Car.model", "Pers_Cars->Car"."an_fab" AS "Pers_Cars.Car.an_fab", "Pers_Cars->Car"."cap_cil" AS "Pers_Cars.Car.cap_cil", "Pers_Cars->Car"."imp" AS "Pers_Cars.Car.imp" 
                FROM "Person" AS "Person" 
                LEFT OUTER JOIN "Pers_Car" AS "Pers_Cars" 
                ON "Person"."id" = "Pers_Cars"."PersonId" 
                LEFT OUTER JOIN "Car" AS "Pers_Cars->Car" 
                ON "Pers_Cars"."CarId" = "Pers_Cars->Car"."id"`, {nest: true, type: db.QueryTypes.SELECT})

      // db.models.Person.findAll({
      //   include: [
      //     {
      //       model: db.models.Pers_Car,
      //
      //       include: [
      //         {
      //           model: db.models.Car
      //         }
      //       ]
      //     },
      //   ],
      //   // logging: console.log
      // })

        .then(resp => {
        res.send(resp);
        console.log(resp[0]);
      }).catch(() => res.status(401));
    },

    find: (req, res) => {
      // db.query(`SELECT *
      //           FROM "Person"
      //           INNER JOIN "Pers_Car"
      //           ON "Person".id = "PersonId"
      //           INNER JOIN "Car"
      //           ON "Car".id = "CarId"`, {type: db.QueryTypes.SELECT})

      db.query(` SELECT "Person"."id", "Person"."cnp", "Person"."varsta", "Person"."nume", "Person"."prenume",
                "Pers_Cars"."id" AS "Pers_Cars.id", "Pers_Cars"."PersonId" AS "Pers_Cars.PersonId", "Pers_Cars"."CarId" AS "Pers_Cars.CarId",
                "Pers_Cars->Car"."id" AS "Pers_Cars.Car.id", "Pers_Cars->Car"."marca" AS "Pers_Cars.Car.marca", "Pers_Cars->Car"."model" AS "Pers_Cars.Car.model", "Pers_Cars->Car"."an_fab" AS "Pers_Cars.Car.an_fab", "Pers_Cars->Car"."cap_cil" AS "Pers_Cars.Car.cap_cil", "Pers_Cars->Car"."imp" AS "Pers_Cars.Car.imp"
                FROM "Person" AS "Person"
                LEFT OUTER JOIN "Pers_Car" AS "Pers_Cars"
                ON "Person"."id" = "Pers_Cars"."PersonId"
                LEFT OUTER JOIN "Car" AS "Pers_Cars->Car"
                ON "Pers_Cars"."CarId" = "Pers_Cars->Car"."id" WHERE "Person"."id" = ${req.params.id}`, {nest: true, type: db.QueryTypes.SELECT})

      // db.models.Person.findOne({
      //   where: {
      //     id: req.params.id
      //   },
      //   include: [
      //     {
      //       model: db.models.Pers_Car,
      //       include: [
      //         {
      //           model: db.models.Car
      //         }
      //       ]
      //     },
      //   ],
      //   // logging: console.log
      // })

        .then(resp => {
          // resp = JSON.stringify(resp);
        console.log(resp);
        res.send(resp);
      }).catch(() =>
        res.status(401)
      );
    },

    destroy: (req, res) => {
      db.query(`DELETE FROM "Person" WHERE id = ${req.params.id}`, {type: db.QueryTypes.DELETE}).then(() => {
        res.send({success: true});
      }).catch(() => res.status(401));
    }
  };
};
