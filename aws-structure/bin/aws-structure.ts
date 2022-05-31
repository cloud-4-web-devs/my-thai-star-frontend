#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsStructureStack } from '../lib/aws-structure-stack';

const app = new cdk.App();
new AwsStructureStack(app, 'infra-frontend', {});

