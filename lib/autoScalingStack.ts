// class AutoScalingStack extends NetstedStack 

import { StackProps, NestedStack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
var fs = require('fs');
import { CfnOutput } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib'


export interface IAutoScalingStackProps extends StackProps {
    readonly vpc: ec2.Vpc;
    readonly targetGroupPort: number;
    readonly applicationLoadBalancerPort: number;
}

export class AutoScalingStack extends NestedStack {
    constructor(scope: Construct, id: string, props: IAutoScalingStackProps) {
        super(scope, id, props);
        // log: start of AutoScalingStack
        console.log("### AutoScalingStack - start");
        const vpc = props.vpc;

        // create a security group
        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup Instance', {
            vpc: props.vpc,
            allowAllOutbound: true,
        });
        // allow ssh access from anywhere
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'for ssh');
        // allow http access from anywhere
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(props.applicationLoadBalancerPort), 'for http port');

        // creating a target group
        const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup Instance', {
            vpc: vpc,
            port: props.targetGroupPort,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targetType: elbv2.TargetType.INSTANCE,
        });


        // create a application load balancer
        const applicationLoadBalancer = new elbv2.ApplicationLoadBalancer(this, 'ApplicationLoadBalancer Instnace', {
            vpc: vpc,
            internetFacing: true,
            vpcSubnets: {
                subnets: vpc.publicSubnets,
            },
            securityGroup: securityGroup,
        });

        // create a listener
        const listener = applicationLoadBalancer.addListener('Listener Instance', {
            port: props.applicationLoadBalancerPort,
            protocol: elbv2.ApplicationProtocol.HTTP,
            open: true,
        });
        // add target group to listener
        listener.addTargetGroups('TargetGroup to Listener', {
            targetGroups: [targetGroup],
        });
        // load user data
        const userData = ec2.UserData.forLinux(
            { shebang: "#!/bin/bash" }
        );
        const userdataScript = fs.readFileSync('./lib/userdata.sh', 'utf8');
        console.log(`userdataScript = ${userdataScript}`);
        userData.addCommands(
            userdataScript
        );


        // create a launch template
        const launchTemplate = new ec2.LaunchTemplate(this, 'Launch Template Instance', {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.latestAmazonLinux2023(),
            userData: userData,
            securityGroup: securityGroup,

        });
        // 
        const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'Auto Scaling Group Instance', {
            vpc: vpc,
            vpcSubnets: {
                subnets: vpc.publicSubnets,
            },
            launchTemplate: launchTemplate,
            minCapacity: 0,
            maxCapacity: 2,
            desiredCapacity: 1,
        });
        autoScalingGroup.attachToApplicationTargetGroup(targetGroup);

        const lableString = `${applicationLoadBalancer.loadBalancerFullName}/${targetGroup.targetGroupFullName}`;
        console.log(`lableString = ${lableString}`);
        const targetTrackingScalingPolicy = new autoscaling.TargetTrackingScalingPolicy(this, 'MyTargetTrackingScalingPolicy', {
            autoScalingGroup: autoScalingGroup,
            targetValue: 50,

            // the properties below are optional
            cooldown: cdk.Duration.minutes(1),
            disableScaleIn: false,
            estimatedInstanceWarmup: cdk.Duration.minutes(5),
            predefinedMetric: autoscaling.PredefinedMetric.ALB_REQUEST_COUNT_PER_TARGET,
            resourceLabel: lableString,
        });

        // export load balancer DNS name
        new CfnOutput(this, 'LoadBalancerDNS', {
            value: `http://${applicationLoadBalancer.loadBalancerDnsName}`,
            description: 'DNS name of the newly created load balancer'
        });

        // log: end of AutoScalingStack
        console.log("### AutoScalingStack - end");
    }

}