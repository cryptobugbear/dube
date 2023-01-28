import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { UserPoolClientIdentityProvider } from 'aws-cdk-lib/aws-cognito';

export class CDBService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const userPool = new cognito.UserPool(this, 'userpool', {
      userPoolName: `dube-api-pool`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: {email: true},
      autoVerify: {email: true},
      passwordPolicy: {
        minLength: 6,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    const readOnlyScope = new cognito.ResourceServerScope({ scopeName: 'read', scopeDescription: 'Read-only access' });
    const fullAccessScope = new cognito.ResourceServerScope({ scopeName: '*', scopeDescription: 'Full access' });

    const userServer = userPool.addResourceServer('ResourceServer', {
    identifier: 'users',
    scopes: [ readOnlyScope, fullAccessScope ],
    });

    const userPoolClient =  userPool.addClient('read-only-client', {
    // ...
    oAuth: {
      flows: {
        clientCredentials: true,
      },
    // ...
    scopes: [ cognito.OAuthScope.resourceServer(userServer, readOnlyScope) ],
    },
    generateSecret:true
    });
    const callbackUrl = 'https://savearbo.xyz';
    const googlePoolClient =  userPool.addClient('google-client', {
      generateSecret: true,
      supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
      oAuth: {
          callbackUrls: [callbackUrl],
      },
      });

    const dubeHandler = new NodejsFunction(this as any, "dubeHandler", {
      environment: {
        DYNAMODB_TABLE_ASSETS: 'dube-assets',
        DYNAMODB_TABLE_ORGS: 'dube-orgs'
      },
      entry: '/home/wizgot/my-projects/dube/lambdas/src/lambda.ts',
      handler: "handler",
      bundling: {
        minify: false, // minify code, defaults to false
        sourceMap: true, // include source map, defaults to false
        // nodeModu les: ['canvas'],
      },
      timeout:cdk.Duration.seconds(120)
    });

    //create dynamo db table
    const table = new dynamodb.Table(this, 'Table', { 
      tableName:'dube-assets',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }, 
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, 
    });

    //allow the lambda to read from dynamo db
    dubeHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:Scan','dynamodb:PutItem','dynamodb:UpdateItem'],
        resources: [table.tableArn]
      })
    );
    const httpApi = new apiGateway.HttpApi(this, 'dubeAPI', {
      apiName: `dube-logistics-api`,
    });
    const authorizer = new apiGatewayAuthorizers.HttpUserPoolAuthorizer(
      'user-pool-authorizer',
      userPool,
      {
        userPoolClients: [userPoolClient, googlePoolClient],
        identitySource: ['$request.header.Authorization'],
      },
    );
    
    // 👇 set the Authorizer on the Route
    httpApi.addRoutes({
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        'protected-fn-integration',
        dubeHandler,
      ),
      path: '/protected/inventory',
      authorizer,
    });
    httpApi.addRoutes({
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        'protected-fn-integration',
        dubeHandler,
      ),
      path: '/protected/{inventoryId}/workorder',
      authorizer,
    });
  }
}