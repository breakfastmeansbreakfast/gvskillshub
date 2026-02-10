import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { NagSuppressions } from "cdk-nag";

export class InfrastructureStack extends cdk.Stack {
  // Define public properties to export resource information
  public readonly s3BucketName: string;
  public readonly cloudFrontDistributionId: string;
  public readonly cloudFrontDomainName: string;
  public readonly websiteBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create separate logging bucket for S3 access logs (security best practice)
    const loggingBucket = new s3.Bucket(this, "LoggingBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development purposes
      autoDeleteObjects: true, // For development purposes
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    // Task #3: Implement S3 Bucket Stack
    // Create S3 bucket with private access and block all public access
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development purposes; use RETAIN for production
      autoDeleteObjects: true, // For development purposes; remove for production
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      // Enable server access logging to separate bucket (security best practice)
      serverAccessLogsBucket: loggingBucket,
      serverAccessLogsPrefix: "website-access-logs/",
    });

    // Task #4: Implement CloudFront Distribution Stack
    // Create Origin Access Control for CloudFront
    const oac = new cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: `${id}-OAC`,
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
        description:
          "Origin Access Control for S3 bucket access from CloudFront",
      },
    });

    // Task #5: Implement IAM Roles and Policies

    // Create CloudFront access role for S3
    const cloudfrontS3AccessRole = new iam.Role(
      this,
      "CloudFrontS3AccessRole",
      {
        assumedBy: new iam.ServicePrincipal("cloudfront.amazonaws.com"),
        description: "Role that allows CloudFront to access S3 bucket content",
      }
    );

    // Add policy to the role that allows getting objects from the S3 bucket
    cloudfrontS3AccessRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        resources: [websiteBucket.arnForObjects("*")],
      })
    );

    // Suppress CDK Nag warning for wildcard resource - this is necessary for CloudFront to access all objects
    NagSuppressions.addResourceSuppressions(
      cloudfrontS3AccessRole,
      [
        {
          id: "AwsSolutions-IAM5",
          reason:
            "Wildcard permission required for CloudFront to access all objects in S3 bucket",
          appliesTo: ["Resource::<WebsiteBucket75C24D94.Arn>/*"],
        },
      ],
      true // Apply to children
    );

    // The S3 bucket already has enforceSSL: true which handles SSL enforcement
    // Additional bucket policies are handled by the CDK automatically

    // Create CloudFront distribution with S3 origin
    // Define custom error responses for SPA routing
    const errorResponses: cloudfront.ErrorResponse[] = [
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
        ttl: cdk.Duration.minutes(10),
      },
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
        ttl: cdk.Duration.minutes(10),
      },
    ];

    // Create S3 origin with Origin Access Control
    const s3Origin =
      origins.S3BucketOrigin.withOriginAccessControl(websiteBucket);

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
      },
      errorResponses: errorResponses,
      enableIpv6: true,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe edge locations for cost optimization
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021, // Modern security policy
      // CloudFront logging disabled for development - would require complex ACL configuration
      // In production, enable logging with proper ACL-enabled bucket
    });

    // Associate the OAC with the CloudFront distribution
    // This is done by accessing the CloudFormation resource directly
    const cfnDistribution = distribution.node
      .defaultChild as cloudfront.CfnDistribution;

    // Update the S3 origin configuration to use OAC
    cfnDistribution.addPropertyOverride(
      "DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity",
      ""
    );

    cfnDistribution.addPropertyOverride(
      "DistributionConfig.Origins.0.OriginAccessControlId",
      oac.attrId
    );

    // Grant CloudFront distribution access to the S3 bucket
    websiteBucket.grantRead(
      new iam.ServicePrincipal("cloudfront.amazonaws.com", {
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    // Suppress CloudFront warnings for development environment
    NagSuppressions.addResourceSuppressions(distribution, [
      {
        id: "AwsSolutions-CFR3",
        reason:
          "CloudFront access logging disabled in development to avoid ACL complexity. Enable in production with proper ACL-configured bucket",
      },
      {
        id: "AwsSolutions-CFR4",
        reason:
          "Development environment using default CloudFront certificate. In production, use custom certificate with TLS 1.2+",
      },
      {
        id: "AwsSolutions-CFR1",
        reason:
          "Geo restrictions not required for this application - global access intended",
      },
      {
        id: "AwsSolutions-CFR2",
        reason:
          "WAF not required for static website hosting in development environment, but recommended for production",
      },
    ]);

    // Store CloudFront distribution properties for export
    this.cloudFrontDistributionId = distribution.distributionId;
    this.cloudFrontDomainName = distribution.distributionDomainName;

    // Export the bucket as a property for use in other parts of the application
    this.websiteBucket = websiteBucket;

    // Store the bucket name for export
    this.s3BucketName = websiteBucket.bucketName;

    // Output the IAM role ARN
    new cdk.CfnOutput(this, "CloudFrontS3AccessRoleArn", {
      value: cloudfrontS3AccessRole.roleArn,
      description: "The ARN of the IAM role for CloudFront to access S3",
    });

    // Output the CloudFront URL and distribution ID
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: `https://${distribution.distributionDomainName}`,
      description: "The URL of the CloudFront distribution",
    });

    new cdk.CfnOutput(this, "CloudFrontDistributionId", {
      value: distribution.distributionId,
      description: "The ID of the CloudFront distribution",
    });

    new cdk.CfnOutput(this, "S3BucketName", {
      value: websiteBucket.bucketName,
      description: "The name of the S3 bucket",
    });

    new cdk.CfnOutput(this, "LoggingBucketName", {
      value: loggingBucket.bucketName,
      description: "The name of the S3 access logging bucket",
    });

    // Suppress CDK Nag warnings for logging bucket
    NagSuppressions.addResourceSuppressions(loggingBucket, [
      {
        id: "AwsSolutions-S1",
        reason: "This is the logging bucket itself - does not need separate access logging to avoid circular dependency",
      },
    ]);
  }
}
