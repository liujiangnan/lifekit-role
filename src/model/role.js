module.exports = function(sequelize, DataTypes) {
  var role = sequelize.define('role', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull : false
    },
    description: {
      type: DataTypes.STRING
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
  return role;
};