import 'source-map-support/register';
import * as express from 'express';
import { Request, Response } from 'express';
import * as serverless from 'serverless-http';
import User from './models/user';
import { genSaltSync, hashSync } from 'bcryptjs'

// express instance
const app = express()

// express middleware
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/user', async (req: Request, res: Response) => {
  const users = await User.findAll();

  res.status(200).json({
    code: 200,
    message: 'success',
    data: users
  })
})

app.post('/user', async (req: Request, res: Response) => {
  // get input
  const { name, email, password } = req.body

  const users = await User.create({
    name: name,
    email: email,
    password: hashSync(password, genSaltSync(10)),
  });

  res.status(200).json({
    code: 200,
    message: 'success',
    data: users
  })
})

export const handler = serverless(app);
