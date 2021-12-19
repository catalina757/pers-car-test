'use strict';

module.exports = (sequelize, DataType) => {
  let Car = sequelize.define('Car', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      allowNull: false,
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
      type: DataType.INTEGER,
      allowNull: false
    },
    imp: {
      type: DataType.INTEGER
    }
  }, {
    timestamps: false
  }, {
    freezeTableName: true
  });


  return Car;
};
