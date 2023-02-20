const Sequelize = require('sequelize');
const sequelize = new Sequelize('chat' , 'root' , 'Srashti@1234',{
    dialect: 'mysql',
    host : 'localhost'
})

module.exports = sequelize;