const { Sequelize, DataTypes } = require("sequelize");

const dbhandler = new Sequelize("sql_notrox_hu", "sql_notrox_hu", "6b107270b787b8", {
    dialect: "mysql",
    host: "127.0.0.1",
});

const UserTable = dbhandler.define("User", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Pfp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
});

const CompanyTable = dbhandler.define("Company", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Location: {
        type: DataTypes.STRING,
        allowNull: false
    }
});


const ProductsTable = dbhandler.define("Product", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Ammount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CompanyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IMGURL: {
        type: DataTypes.STRING,
        allowNull: false
    }
});













