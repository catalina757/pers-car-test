'use strict';

module.exports = (sequelize, DataType) => {
    let Person = sequelize.define('Person', {
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cnp: {
            type: DataType.STRING(13),
            allowNull: false,
            unique: true
        },
        varsta: {
            type: DataType.INTEGER
        },
        nume: {
            type: DataType.STRING
        },
        prenume: {
            type: DataType.STRING
        }
    }, {
        timestamps: false
    });

    Person.hasMany(sequelize.models.Pers_Car);
    sequelize.models.Pers_Car.belongsTo(Person);

    return Person;
};
