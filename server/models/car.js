'use strict';

module.exports = (sequelize, DataType) => {
    let Car = sequelize.define('Car', {
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        marca: {
            type: DataType.STRING
        },
        model: {
            type: DataType.STRING
        },
        an_fab: {
            type: DataType.INTEGER
        },
        cap_cil: {
            type: DataType.INTEGER
        },
        imp: {
            type: DataType.INTEGER
        }
    }, {
        timestamps: false
    });

    Car.hasMany(sequelize.models.Pers_Car);
    sequelize.models.Pers_Car.belongsTo(Car);

    return Car;
};
