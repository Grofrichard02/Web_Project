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

const AddressTable = dbhandler.define("Address", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    City: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Zip: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Address1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const BillingAddressTable = dbhandler.define("BillingAddress", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    City: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Zip: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Address1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const LogTable = dbhandler.define("Log", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    OrderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const OrderTable = dbhandler.define("Order", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    Phase: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Feldolgozás alatt"
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    AddressId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const OrderItemTable = dbhandler.define("OrderItem", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    OrderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PriceAtPurchase: { 
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

UserTable.hasMany(OrderTable, { foreignKey: "UserId" });
OrderTable.belongsTo(UserTable, { foreignKey: "UserId" });

AddressTable.hasMany(OrderTable, { foreignKey: "AddressId" });
OrderTable.belongsTo(AddressTable, { foreignKey: "AddressId" });

OrderTable.hasMany(OrderItemTable, { foreignKey: "OrderId", onDelete: "CASCADE" });
OrderItemTable.belongsTo(OrderTable, { foreignKey: "OrderId" });

ProductsTable.hasMany(OrderItemTable, { foreignKey: "ProductId" });
OrderItemTable.belongsTo(ProductsTable, { foreignKey: "ProductId" });

UserTable.hasMany(OrderTable, {
    foreignKey: {
        name: "UserId",
        allowNull: false
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

OrderTable.belongsTo(UserTable, {
    foreignKey: "UserId"
});

UserTable.hasMany(AddressTable, {
    foreignKey: {
        name: "UserId",
        allowNull: false
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

AddressTable.belongsTo(UserTable, {
    foreignKey: "UserId"
});

CompanyTable.hasMany(ProductsTable, {
    foreignKey: {
        name: "CompanyId",
        allowNull: false
    },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

ProductsTable.belongsTo(CompanyTable, {
    foreignKey: "CompanyId"
});

AddressTable.hasMany(OrderTable, {
    foreignKey: {
        name: "AddressId",
        allowNull: false
    },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

OrderTable.belongsTo(AddressTable, {
    foreignKey: "AddressId"
});

OrderTable.hasMany(LogTable, {
    foreignKey: {
        name: "OrderId",
        allowNull: false
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

LogTable.belongsTo(OrderTable, {
    foreignKey: "OrderId"
});



