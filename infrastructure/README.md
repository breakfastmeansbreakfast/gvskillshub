# Future Craft Infrastructure

This project contains the AWS CDK infrastructure code for deploying the Future Craft Next.js application.

## ⚠️ Development/Test Environment

**This infrastructure configuration is intended for development and testing purposes only.**

The current setup prioritizes simplicity and rapid iteration over production-grade security. Before deploying to production, review and implement the recommendations below.

### Production Recommendations (CDK-NAG Findings)

| Finding | Development Configuration | Production Recommendation |
|---------|---------------------------|---------------------------|
| **WAF Protection** | Not enabled | Enable AWS WAF with CloudFront to protect against common web exploits (SQL injection, XSS, bot traffic) |
| **Access Logging** | Disabled to avoid ACL complexity | Enable CloudFront access logging with a properly configured S3 bucket (requires ACL configuration) |
| **TLS Certificate** | Default CloudFront certificate | Use AWS Certificate Manager (ACM) custom certificate with TLS 1.2+ minimum protocol version |

### Implementation Notes

**WAF (AWS Web Application Firewall):**
```typescript
// Add to infrastructure-stack.ts
import * as waf from 'aws-cdk-lib/aws-wafv2';

const webAcl = new waf.CfnWebACL(this, 'WebACL', {
  scope: 'CLOUDFRONT',
  defaultAction: { allow: {} },
  rules: [/* AWS Managed Rules */],
});
```

**CloudFront Access Logging:**
```typescript
// Requires S3 bucket with ACL enabled
enableLogging: true,
logBucket: loggingBucket,
logFilePrefix: 'cloudfront-logs/',
```

**Custom TLS Certificate:**
```typescript
// Request certificate in us-east-1 for CloudFront
certificate: acmCertificate,
minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
```

---

## Prerequisites

- Node.js (v14.x or later)
- AWS CLI installed and configured
- AWS CDK installed globally (`npm install -g aws-cdk`)
- TypeScript knowledge

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure AWS credentials:
   - Copy `.env.example` to `.env`
   - Fill in your AWS credentials and configuration
   - Alternatively, configure AWS CLI using `aws configure`

3. Bootstrap CDK (first time only):
   ```
   cdk bootstrap
   ```

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Infrastructure Components

The infrastructure includes:

- S3 bucket for static website hosting
- CloudFront distribution for content delivery
- IAM roles and policies for secure access
- Origin Access Control for S3-CloudFront integration

## Security & IAM Permissions

### Required Administrator Permissions (Least Privilege)

For deploying and managing FutureCraft infrastructure, AWS administrators require the following scoped permissions:

#### CloudFormation & CDK
```
cloudformation:CreateStack
cloudformation:UpdateStack
cloudformation:DeleteStack
cloudformation:DescribeStacks
cloudformation:DescribeStackEvents
cloudformation:GetTemplate
sts:AssumeRole (for CDK execution role)
```

#### S3 Permissions
```
s3:CreateBucket
s3:DeleteBucket
s3:PutBucketPolicy
s3:PutBucketVersioning
s3:PutBucketEncryption
s3:PutBucketPublicAccessBlock
s3:PutObject
s3:DeleteObject
s3:GetObject
s3:ListBucket
s3:GetBucketLocation
```
**Scoped to:** `arn:aws:s3:::futurecraft-*` or your specific bucket naming pattern

#### CloudFront Permissions
```
cloudfront:CreateDistribution
cloudfront:UpdateDistribution
cloudfront:DeleteDistribution
cloudfront:GetDistribution
cloudfront:CreateInvalidation
cloudfront:CreateOriginAccessControl
cloudfront:UpdateOriginAccessControl
cloudfront:DeleteOriginAccessControl
cloudfront:GetOriginAccessControl
```

#### IAM Permissions (Scoped)
```
iam:CreateRole
iam:DeleteRole
iam:GetRole
iam:PutRolePolicy
iam:DeleteRolePolicy
iam:PassRole (for cloudfront.amazonaws.com service principal only)
iam:AttachRolePolicy
iam:DetachRolePolicy
```
**Scoped to:** `arn:aws:iam::*:role/FutureCraft*` or your role naming pattern

#### CloudWatch Logs (Read-Only)
```
logs:DescribeLogGroups
logs:DescribeLogStreams
logs:GetLogEvents
```

### Permissions NOT Required

The following permissions are **not needed** for FutureCraft and should not be granted:

- ❌ EC2 instance management (no compute resources)
- ❌ VPC/Security Group configuration (no networking)
- ❌ RDS/Database permissions (static site only)
- ❌ Lambda function management (no serverless functions)
- ❌ Route 53 DNS management (using default CloudFront domain)
- ❌ Broad "enable/disable services" permissions

### Security Best Practices

1. **Multi-Factor Authentication (MFA)**
   - MFA **must** be enabled for all AWS Console access
   - Recommended: Enforce MFA via IAM policy conditions

2. **Access Controls**
   - Use temporary credentials (STS AssumeRole) instead of long-lived access keys
   - Implement IP restrictions for Console access where applicable
   - Regular access reviews and permission audits

3. **Audit & Monitoring**
   - Enable CloudTrail for all API activity logging
   - Configure CloudWatch alarms for suspicious activities
   - Review access logs regularly (S3 and CloudFront)

4. **Deployment Credentials**
   - For CI/CD pipelines, use OIDC federation instead of access keys
   - Never commit credentials to source control
   - Rotate any accidentally exposed credentials immediately

### Example IAM Policy

A scoped IAM policy for FutureCraft deployment:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CDKDeployment",
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "sts:AssumeRole"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3Management",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:PutBucket*",
        "s3:GetBucket*",
        "s3:ListBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::futurecraft-*",
        "arn:aws:s3:::futurecraft-*/*"
      ]
    },
    {
      "Sid": "CloudFrontManagement",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:CreateInvalidation",
        "cloudfront:*OriginAccessControl"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy"
      ],
      "Resource": "arn:aws:iam::*:role/FutureCraft*"
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::*:role/FutureCraft*",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "cloudfront.amazonaws.com"
        }
      }
    },
    {
      "Sid": "CloudWatchReadOnly",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Deployment

For deployment instructions, refer to the Makefile in the root directory of the project.
