import { Duration, Stack, StackProps, NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export interface IVpcStackProps extends StackProps {
    readonly cidr: string;
}

export class VpcStack extends NestedStack {
    public readonly Vpc: ec2.Vpc;
    constructor(scope: Construct, id: string, props: IVpcStackProps) {
        super(scope, id, props);
        // log: start of VpcStack
        console.log("### VpcStack - start");
        const cidr = props.cidr;
        console.log(`Cidr: ${props.cidr}`);
        const maxAzs = 3;
        console.log(`Max AZs set to: ${maxAzs}`);
        // Create a VPC
        this.Vpc = new ec2.Vpc(this, 'Vpc', {
            ipAddresses: ec2.IpAddresses.cidr(cidr),
            maxAzs: maxAzs,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'public-',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                // {
                //     cidrMask: 24,
                //     name: 'private-',
                //     subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                // },
                // {
                //     cidrMask: 24,
                //     name: 'private-nat-',
                //     subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                // }
            ]
        });
        console.log(`number of public subnet ${this.Vpc.publicSubnets.length}`);
        this.Vpc.publicSubnets.forEach((subnet, index) => {
            console.log(`subnet ${index} = ${subnet.subnetId} / ${subnet.availabilityZone} / ${subnet.ipv4CidrBlock}`);
        });
        console.log(`number of private subnet ${this.Vpc.isolatedSubnets.length}`);
        this.Vpc.isolatedSubnets.forEach((subnet, index) => {
            console.log(`subnet ${index} = ${subnet.subnetId} / ${subnet.availabilityZone} / ${subnet.ipv4CidrBlock}`);
        });
        console.log("### VpcStack - end")

    }
}
