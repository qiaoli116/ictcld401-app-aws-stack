import { Duration, Stack, StackProps, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class S3Stack extends NestedStack {
    public readonly Bucket: s3.Bucket;
    constructor(scope: Construct, id: string, props: {}) {
        super(scope, id, props);
        // create a s3 bucket with public access
        this.Bucket = new s3.Bucket(this, 'MyFirstBucket', {
            // PublicAccessBlockConfiguration all false
            blockPublicAccess: new s3.BlockPublicAccess({ blockPublicAcls: false, blockPublicPolicy: false, ignorePublicAcls: false, restrictPublicBuckets: false }),
            publicReadAccess: true,
            removalPolicy: RemovalPolicy.DESTROY,
        });


    }
}