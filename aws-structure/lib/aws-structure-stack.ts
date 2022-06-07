import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
  Protocol,
  TargetType
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {
  GatewayVpcEndpointAwsService,
  InterfaceVpcEndpoint, InterfaceVpcEndpointService,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc
} from "aws-cdk-lib/aws-ec2";
import {Repository} from "aws-cdk-lib/aws-ecr";
import {Cluster, ContainerImage, FargateService, FargateTaskDefinition, LogDriver} from "aws-cdk-lib/aws-ecs";
import {LogGroup} from "aws-cdk-lib/aws-logs";

export class AwsStructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repository = new Repository(this, 'ecr-frontend', {
        repositoryName: 'ecr-frontend'
    });

    const vpc = new Vpc(this, "vpc-frontend", {
      cidr: "20.0.0.0/20",
      subnetConfiguration: [
        {  cidrMask: 24, subnetType: SubnetType.PUBLIC, name: "Public" },
        {  cidrMask: 24, subnetType: SubnetType.PRIVATE, name: "Private" }
        ],
      gatewayEndpoints: {
              S3: {
                service: GatewayVpcEndpointAwsService.S3,
              },
            },
      maxAzs: 3
    });

    const cluster = new Cluster(this, 'cluster-frontend', {
      vpc: vpc,
      clusterName: "cluster-frontend"
    });

    const securityGroup = new SecurityGroup(this, `sg-frontend`, {
        vpc: vpc,
        allowAllOutbound: true,
        description: 'CDK Security Group'
    });
    securityGroup.addIngressRule(Peer.ipv4("20.0.0.0/20"), Port.tcp(80), "Application access");
    securityGroup.addIngressRule(Peer.ipv4("20.0.0.0/20"), Port.tcp(443), "Access to ecr");

    const targetGroup = new ApplicationTargetGroup(this, 'tg-frontend', {
      targetGroupName: 'tg-frontend',
      targetType: TargetType.IP,
      port: 80,
      vpc: vpc,
      protocol: ApplicationProtocol.HTTP,
      healthCheck: {
        interval: Duration.seconds(240),
        path: "/",
        protocol: Protocol.HTTP,
        timeout: Duration.seconds(120)
      }
    });

    const applicationLoadBalancer = new ApplicationLoadBalancer(this, 'alb-frontend', {
      vpc: vpc,
      loadBalancerName: 'alb-frontend',
      internetFacing: true
    });

    new ApplicationListener(this, 'listener-frontend', {
      port: 80,
      loadBalancer: applicationLoadBalancer,
      defaultTargetGroups: [targetGroup]
    });

    const logGroup = new LogGroup(this, 'logGroup-frontend', {
      logGroupName: 'frontend-logs'
    });

    const taskDefinition = new FargateTaskDefinition(this, 'taskDefinition-frontend', {
      cpu: 256,
      memoryLimitMiB: 512
    });

    taskDefinition.addContainer('taskDefinitionContainer', {
      image: ContainerImage.fromEcrRepository(repository),
      portMappings: [{
        containerPort: 80
      }],
      logging: LogDriver.awsLogs({
        logGroup: logGroup,
        streamPrefix: 'cdk'
      })
    });

    new FargateService(this, 'service-frontend', {
      taskDefinition: taskDefinition,
      securityGroups: [securityGroup],
      serviceName: 'frontend',
      cluster: cluster
    }).attachToApplicationTargetGroup(targetGroup);

    let endpointPrefix = "com.amazonaws.eu-central-1.";
    let endpoints = ["ecr.api", "ecr.dkr", "logs", "ssm", "rds"];

    for(var val of endpoints){
      new InterfaceVpcEndpoint(this, val,{
        vpc: vpc,
        service: new InterfaceVpcEndpointService(endpointPrefix + val),
        securityGroups: [securityGroup]
      })
    }
    
  }
}
