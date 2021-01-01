import { Sequelize } from 'sequelize';
import * as mysql2 from 'mysql2'

const db = new Sequelize({
    dialect: 'mysql',
    dialectModule: mysql2, // fixed issue with webpack
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'example',
    database: 'sls_aws',
    dialectOptions: {
        // useUTC: false, //for reading from database
        dateStrings: true,
        typeCast: true,
        timezone: "+07:00"
    },
    timezone: '+07:00',
    pool: {
        max: 1,
        min: 0,
        acquire: 3000,
        idle: 1000
    }
});

// const initConnection = async () => {
//     try {
//         // connect to database
//         await db.sync();
//         await db.authenticate();
//
//         // print message connected
//         // console.log('Connection has been established successfully.');
//     } catch (error) {
//         // print error message if not connected
//         console.error('Unable to connect to the database:', error);
//     }
// }

export default db;