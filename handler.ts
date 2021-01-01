import 'source-map-support/register';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as serverless from 'serverless-http';
import User from './models/user';
import { genSaltSync, hashSync } from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import * as helmet from 'helmet';

// express instance
const app = express()

// express middleware
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

// validation input
const userInputValidate = () => {
  return [
      body('name')
          .isLength({ min: 3, max: 255 })
          .withMessage('Nama Minimal 3 Huruf dan Maksimal 255 Huruf.!'),
      body('email')
          .normalizeEmail()
          .isEmail()
          .withMessage('Email Tidak Valid.!'),
      body('password')
          .isLength({ min: 6, max: 32})
          .withMessage('Password Minimal 6 Digit dan Maksimal 32 Digit.!')
  ]
}

const validate = (req: Request, res: Response, next: NextFunction) => {
  // validate input
  const errors = validationResult(req);

  // if error not found, then continue
  if (errors.isEmpty()) {
    return next()
  }

  // extract error message
  const extractedErrors = {}
  errors.array().map(err => {
    extractedErrors[err.param] = err.msg
  })

  return res.status(400).json({
    code: 400,
    success: false,
    message: "Please Check You're Request Input.!",
    errors: extractedErrors
  });
}

// Index Data
app.get('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAndCountAll({
      order:  [
          ['id', 'asc']
      ],
      limit: 10
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: 'success',
      data: users
    })
  } catch (e) {
    next(e)
  }
})

// Store Data
app.post('/user', userInputValidate(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // get input
    const { name, email, password } = req.body

    const users = await User.create({
      name: name,
      email: email,
      password: hashSync(password, genSaltSync(10)),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: 'success',
      data: {
        name: name,
        email: email,
      }
    })
  } catch (e) {
    // Sequelize Error Catch
    const errObj = {};
    e.errors.map( er => {
      errObj[er.path] = {
        type: er.type,
        message: er.message,
        path: er.path,
        value: req.body[er.path],
      };
    })

    // return error if found
    if(errObj) {
      res.status(422).json({
        code: 422,
        success: false,
        message: errObj
      })
    } else {
      next(e)
    }
  }
})

// Show Data by ID
app.get('/user/:id', async(req: Request, res: Response, next: NextFunction) => {
  try {
    // get parameter
    const { id } = req.params

    // query to database
    const user = await User.findByPk(id)

    // return response
    res.status(200).json({
      code: 200,
      success: true,
      message: 'success',
      data: user
    })
  } catch (e) {
    next(e)
  }
})

// Catch Error Not Found
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new Error(`Route Not Found: [${req.method}] ${req.path}`));
});

// Error Handle
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(422).json({
    code: 422,
    success: false,
    message: error.message,
  });
});

export const handler = serverless(app);
