import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'serverless-aws-mysql',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'ap-southeast-1',
    memorySize: 256,
    apiGateway: {
      shouldStartNameWithService: true,
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    handler: {
      handler: 'handler.handler',
      events: [
        {
          http: {
            method: 'ANY',
            path: '/',
          }
        },
        {
          http: {
            method: 'ANY',
            path: '/{proxy+}',
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
