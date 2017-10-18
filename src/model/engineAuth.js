module.exports = function(sequelize, DataTypes) {
  var engineAuth = sequelize.define('engine_auth', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull : false
    },
    name: {
      type: DataTypes.STRING,
      allowNull : false
    },
    description: {
      type: DataTypes.STRING
    },
    engine_id: {
      type: DataTypes.INTEGER,
      allowNull : false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue : DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue : DataTypes.NOW
    }
  }, {
    freezeTableName: true
  });
  return engineAuth;
};