'use strict';

module.exports = (sequelize, DataType) => {
  let Person = sequelize.define('Person', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      allowNull: false,
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
  }, {
    freezeTableName: true
  });

  return Person;
};
