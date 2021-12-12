"use strict";

module.exports = (sequelize, DataType) => {
    let Pers_Car = sequelize.define('Pers_Car', {
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false
    }, {
        freezeTableName: true
    });


    Pers_Car.belongsTo(sequelize.models.Person, {foreignKey: 'PersonId'});
    Pers_Car.belongsTo(sequelize.models.Car, {foreignKey: 'CarId'});

    return Pers_Car;
};
