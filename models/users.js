const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}

  // init the User model
  User.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: Sequelize.STRING },
      lastName: { type: Sequelize.STRING },
      emailAddress: { type: Sequelize.STRING },
      password: { type: Sequelize.STRING },
    },
    { sequelize }
  );

  // set up the relationship with the Course table/model
  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: "user", // alias
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
      },
    });
  };

  return User;
};
