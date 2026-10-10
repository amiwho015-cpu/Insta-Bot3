const { Model, DataTypes } = require("sequelize");

module.exports = function (sequelize) {
	class userModel extends Model { }
	userModel.init({
		email: DataTypes.STRING,
		name: DataTypes.STRING,
		password: DataTypes.STRING,
		instagramUserID: {
			type: DataTypes.STRING,
			defaultValue: ""
		},
		isAdmin: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		sequelize,
		modelName: "userDashboard"
	});

	return userModel;
};