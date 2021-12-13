"use strict";

module.exports = (sequelize, DataType) => {
    let Pers_Car = sequelize.define('Pers_Car', {
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        }
    }, {
        timestamps: false
    }, {
        freezeTableName: true
    });

    return Pers_Car;
};
