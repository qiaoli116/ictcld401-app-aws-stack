import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appConfig from './appConfig.json';
import { VpcStack } from './vpcStack';
import { AutoScalingStack } from './autoScalingStack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { S3Stack } from './s3Stack';
import { CfnOutput } from 'aws-cdk-lib';


export class Ictcld401AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    console.log("### Ictcld401AppStack - start");
    console.log(`props = ${JSON.stringify(props)}`);
    // dump account number, region, AZs
    console.log(`Ictcld401AppStack - account: ${this.account}`)
    console.log(`Ictcld401AppStack - region: ${this.region}`)
    console.log(`Ictcld401AppStack - AZs: ${this.availabilityZones}`)
    // The code that defines your stack goes here


    const s3Stack = new S3Stack(this, 'S3Stack', {});
    new CfnOutput(this, 'BucketName', {
      value: s3Stack.Bucket.bucketName,
    });

    // create VPC
    console.log(`Creating VPC with cidr ${appConfig.vpc.cidr}`)
    const vpc = new VpcStack(this, 'VpcStack', { cidr: appConfig.vpc.cidr });

    // create AutoScaling
    console.log(`Creating AutoScaling`)
    const autoScalingStack = new AutoScalingStack(this, 'AutoScalingStack', {
      vpc: vpc.Vpc,
      targetGroupPort: appConfig.targetGroup.port,
      applicationLoadBalancerPort: appConfig.applicationLoadBalancer.port,
    });


    // example resource
    // const queue = new sqs.Queue(this, 'Ictcld401AppAwsStackQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    console.log("### Ictcld401AppStack - end");
  }
}
