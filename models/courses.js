const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}

  // init the Course model
  Course.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      estimatedTime: { type: Sequelize.STRING, allowNull: true },
      materialsNeeded: { type: Sequelize.STRING, allowNull: true },
    },
    { sequelize }
  );

  // we set up the relationship with User table/model
  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: "user", // alias
      foreignKey: { fieldName: "userId", allowNull: false },
    });
  };

  return Course;
};
