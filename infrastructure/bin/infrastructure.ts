#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AwsSolutionsChecks } from "cdk-nag";
import { InfrastructureStack } from "../lib/infrastructure-stack";

const app = new cdk.App();

// Configure AWS environment using environment variables
// This allows the stack to use the AWS account and region from the current CLI configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || "eu-west-1", // Default to eu-west-1 if not specified
};

new InfrastructureStack(app, "FutureCraftInfrastructureStack", {
  env,
  description: "Infrastructure for Future Craft Next.js application",
});

// Apply CDK Nag with AWS Solutions rule pack for security and best practices
// This must be done AFTER creating all stacks so CDK Nag can analyze them
cdk.Aspects.of(app).add(
  new AwsSolutionsChecks({
    verbose: true,
    logIgnores: true,
    reports: true
  })
);
