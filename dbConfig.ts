import { Sequelize } from 'sequelize';

const db = new Sequelize({
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'example',
    database: 'sls_aws',
    timezone: '+07:00',
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 1000
    }
});

const initConnection = async () => {
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

initConnection()
    .then(res => console.log(res))
    .catch(err => console.error(err));

export default db;