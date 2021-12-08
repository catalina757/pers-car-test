"use strict";

module.exports = (sequelize, DataType) => {
    let Pers_car = sequelize.define('Pers_Car', {
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false
    });


    return Pers_car;
};
