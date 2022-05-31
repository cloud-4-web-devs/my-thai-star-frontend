import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as vpc from 'aws-cdk-lib/aws-ec2';

export class AwsStructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, 'ecr-frontend', {
        repositoryName: 'ecr-frontend'
    });

    const vpcFrontend = new vpc.Vpc(this, "vpc-frontend", {
      cidr: "20.0.0.0/20",
      subnetConfiguration: [
        {  cidrMask: 24, subnetType: vpc.SubnetType.PUBLIC, name: "Public" },
        {  cidrMask: 24, subnetType: vpc.SubnetType.PRIVATE, name: "Private" }
        ],
      maxAzs: 3 // Default is all AZs in region

    });

  }
}
