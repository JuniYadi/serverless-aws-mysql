import {
  Model,
  DataTypes,
  Optional,
} from "sequelize";
import db from '../dbConfig';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        tableName: "Users",
        sequelize: db, // passing the `sequelize` instance is required
        defaultScope: {
          attributes: {
              exclude: [
                  'password'
              ]
          }
        }
    }
);

export default User;