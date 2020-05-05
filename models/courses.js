const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}

  Course.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      //     userId: {type: Sequelize.},
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      estimatedTime: { type: Sequelize.STRING, allowNull: true },
      materialsNeeded: { type: Sequelize.STRING, allowNull: true },
    },
    { sequelize }
  );

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: "Userrr", // alias
      foreignKey: { fieldName: "id", allowNull: false },
    });
  };
  return Course;
};
