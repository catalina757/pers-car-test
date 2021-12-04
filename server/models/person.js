module.exports = (sequelize, DataType) => {
    let model = sequelize.define('Person', {
        nume: {
            type: DataType.STRING
        },
        prenume: {
            type: DataType.STRING
        },
        cnp: {
            type: DataType.STRING
        },
        varsta: {
            type: DataType.INTEGER
        },
        masini: {
            type: DataType.TEXT
        }
    }, {
        timestamps: false
    });
    /*
      Aceasta linie este comentata pentru a demonstra legatura dintre tabelul Information si tabelul Post prin id
    */
    // model.belongsTo(sequelize.models.Post, {foreignKey: 'id_post', onDelete: 'set null'});
    return model;
};
