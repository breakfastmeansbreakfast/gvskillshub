# Requirements Document

## Introduction

The system shall provide infrastructure and deployment capabilities for a client-side Next.js application hosted on AWS S3 and distributed via CloudFront.

## Requirements

### Infrastructure Requirements

**User Story:** As a DevOps engineer, I want to define and deploy AWS infrastructure using CDK, so that I can reliably host a Next.js application.

#### Acceptance Criteria

1. The system SHALL use AWS CDK to define and deploy all infrastructure components.

2. WHEN creating the CDK stack THEN the system SHALL create:

   - An S3 bucket configured for private website content storage
   - A CloudFront distribution with Origin Access Control
   - Required IAM roles and policies
   - Origin Access Control identity

3. WHILE creating the S3 bucket the system SHALL:

   - Block all public access
   - Implement bucket policy that allows access only from CloudFront OAC

4. WHILE creating CloudFront the system SHALL:

   - Configure default root object as index.html
   - Enable IPv6
   - Create and associate Origin Access Control identity
   - Configure proper cache behaviors
   - Configure SSL/TLS certificate
   - Set custom error responses to redirect to index.html for client-side routing
   - Set origin path to "/future-craft"

5. AFTER deploying infrastructure the system SHALL:
   - Export key information (S3 bucket name, CloudFront distribution ID, CloudFront URL) to a JSON/YAML file
   - Store this file in a location accessible to the deployment phase

### Build Requirements

**User Story:** As a developer, I want to build a static version of the Next.js application, so that it can be deployed to S3.

#### Acceptance Criteria

6. The system SHALL use Next.js export capability for static site generation.

7. WHEN executing build process THEN the system SHALL:
   - Run "npm ci" to install dependencies
   - Run "npm run build" to create production build
   - Run "next export" to generate static files
   - Output built files to "out" directory

### Deployment Requirements

**User Story:** As a DevOps engineer, I want to deploy the built application to AWS, so that users can access the website.

#### Acceptance Criteria

8. The system SHALL NOT use CDK for application deployment.

9. WHEN deploying application code THEN the system SHALL:

   - Read the exported infrastructure information from the JSON/YAML file
   - Use "aws s3 cp" command to sync "out" directory to the "future-craft/" prefix in the S3 bucket identified in the file
   - Include "--delete" flag to remove stale files
   - Set appropriate cache control headers

10. AFTER successful S3 deployment the system SHALL:

    - Use the AWS CLI to create a CloudFront invalidation for "/\*"
    - Use the CloudFront distribution ID from the exported file

11. IF deployment fails THEN the system SHALL:
    - Retain previous version in S3
    - Log detailed error information
    - Not execute CloudFront cache invalidation

### Pipeline Integration Requirements

**User Story:** As a DevOps engineer, I want to integrate the deployment process with CI/CD, so that deployments are automated and reliable.

#### Acceptance Criteria

12. WHERE CI/CD pipeline exists the system SHALL:
    - Separate infrastructure deployment from application deployment
    - Execute infrastructure updates only when CDK files change
    - Execute application deployment on main branch merges
