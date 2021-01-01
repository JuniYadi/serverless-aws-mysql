import 'source-map-support/register';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as serverless from 'serverless-http';
import User from './models/user';
import { compare, genSalt, hash } from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import * as helmet from 'helmet';
import { sign, verify } from 'jsonwebtoken';

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

// validation auth login
const authInputValidate = () => {
  return [
    body('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email Tidak Valid.!'),
    body('password')
        .isLength({ min: 6, max: 32})
        .withMessage('Password Minimal 6 Digit dan Maksimal 32 Digit.!')
  ]
}

// input validate
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
    message: "Please Check Your Input.!",
    errors: extractedErrors
  });
}

// token validate
const tokenValidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // save token
    let token;

    // check header token or get from query token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    // verify token if found
    if(token) {
      // token verify
      const verifyToken = await verify(token, 'secret')

      // throw error if verify not success
      if(!verifyToken) {
        throw new Error('Token Error or Expired.!');
      }

      // inject user id to req object
      req['userid'] = verifyToken['id']

      // continue
      next();
    } else {
      throw new Error('Token Not Found.!');
    }
  } catch (e) {
    next(e);
  }
}

// register
app.post('/auth/register',
    userInputValidate(),
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get input
    const { name, email, password } = req.body;

    // find user
    const findUser = await User.findOne({ where: { email: email }});

    // throw error if user found
    if(findUser) {
      throw new Error('Email Already Exist.!');
    }

    // generate and hash password
    const salt = await genSalt(10);
    const hashPassword = await hash(password, salt);

    // create new user
    const user = await User.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    // generate JSON Web Token
    // change secret to you're private key
    // change 1h (1 hour) to limit live token
    const token = await sign({
      id: user.id
    }, 'secret', { expiresIn: '1h' })

    // return result
    res.status(200).json({
      code: 200,
      success: true,
      message: 'success',
      data: {
        token: token
      }
    })
  } catch (e) {
    next(e)
  }
})

// login
app.post('/auth/login',
    authInputValidate(),
    validate,
    async (req: Request, res: Response, next: NextFunction) => {

  try {
    // get input
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({
      attributes: {
        // get password because we want to validate it
        include: ['password']
      },
      where: {
        email: email
      }
    });

    // throw error if user not found
    if(!user) {
      throw new Error('Email Not Found.!');
    }

    // validate password
    const comparePassword = await compare(password, user.password);

    // throw error if user password not same
    if(!comparePassword) {
      throw new Error('Password Mismatch.!');
    }

    // generate JSON Web Token
    // change secret to you're private key
    // change 1h (1 hour) to limit live token
    const token = await sign({
      id: user.id
    }, 'secret', { expiresIn: '1h' })

    // return response with token
    res.status(200).json({
      code: 200,
      success: true,
      message: 'success',
      data : {
        token: token
      }
    })
  } catch (e) {
    console.log(e)
    next(e);
  }
})

// get me
app.get('/me', tokenValidate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get user id from req object
    const { userid } = req;

    // get user detail
    const user = await User.findByPk(userid);

    // return result
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
    // get input
    const { name, email, password } = req.body;

    // find user
    const findUser = await User.findOne({ where: { email: email }});

    // throw error if user found
    if(findUser) {
      throw new Error('Email Already Exist.!');
    }

    // generate and hash password
    const salt = await genSalt(10);
    const hashPassword = await hash(password, salt);

    // create new user
    const user = await User.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    // delete password from user object
    const userData = user.toJSON();
    delete userData['password'];

    // return result
    res.status(200).json({
      code: 200,
      success: true,
      message: 'success',
      data: userData
    })
  } catch (e) {
    // return error from sequelize
    if(e.errors) {
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

    // find data by id
    const user = await User.findByPk(id)

    // throw error if data not found
    if(!user) {
      throw new Error('Data Not Found.!');
    }

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

// Update Data by ID
app.patch('/user/:id', async(req: Request, res: Response, next: NextFunction) => {
  try {
    // get parameter
    const { id } = req.params

    // get input name only
    const { name } = req.body

    // find data by id
    const user = await User.findByPk(id)

    // throw error if data not found
    if(!user) {
      throw new Error('Data Not Found.!');
    }

    // update data
    user.name = name;

    // save
    await user.save();

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


// Update Data by ID
app.delete('/user/:id', async(req: Request, res: Response, next: NextFunction) => {
  try {
    // get parameter
    const { id } = req.params

    // find data by id
    const user = await User.findByPk(id)

    // throw error if data not found
    if(!user) {
      throw new Error('Data Not Found.!');
    }

    // delete data
    await user.destroy();

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
