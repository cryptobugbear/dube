import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as cdb from '../lib/dube';
import * as cdk from 'aws-cdk-lib';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class LambdasStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new cdb.CDBService(this, 'dube');
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'LambdasQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
