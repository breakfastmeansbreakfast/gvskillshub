# Design Document: AWS Deployment for Next.js Application

## Overview

This design document outlines the architecture and implementation approach for deploying a client-side Next.js application to AWS using S3 for storage and CloudFront for content delivery. The solution will use AWS CDK for infrastructure provisioning and AWS CLI for application deployment, creating a separation of concerns between infrastructure and application code deployment processes. A Makefile will be used to orchestrate the various build and deployment commands, providing a consistent interface for the deployment workflow.

## Architecture

The architecture follows a modern static site hosting pattern on AWS with the following key components:

1. **Infrastructure Layer**:

   - AWS CDK for Infrastructure as Code (IaC)
   - S3 for static content storage
   - CloudFront for content delivery and edge caching
   - IAM for access control

2. **Build Layer**:

   - Next.js static site generation
   - Output to "out" directory

3. **Deployment Layer**:
   - AWS CLI for S3 synchronization
   - CloudFront cache invalidation

### Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Next.js    │────▶│  Static     │────▶│  AWS S3     │────▶│ CloudFront  │────▶ Users
│  Application│     │  Build      │     │  Bucket     │     │ Distribution│
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              ▲
                                              │
                                        ┌─────┴─────┐
                                        │           │
                                        │ IAM/OAC   │
                                        │ Policies  │
                                        │           │
                                        └───────────┘
```

## Components and Interfaces

### 1. Makefile Orchestration

- **Purpose**: Provide a consistent interface for build and deployment commands
- **Components**:
  - Infrastructure deployment targets
  - Application build targets
  - Application deployment targets
  - Utility targets (clean, help, etc.)
- **Benefits**:
  - Consistent command interface
  - Documentation of commands through help target
  - Dependency management between tasks
  - Separation of infrastructure and application deployment
  - Simplified CI/CD integration

### 2. Infrastructure Components (AWS CDK)

#### S3 Bucket

- **Purpose**: Store static website files
- **Configuration**:
  - Block all public access
  - Private bucket policy
  - Access limited to CloudFront via Origin Access Control

#### CloudFront Distribution

- **Purpose**: Deliver content with low latency via AWS edge locations
- **Configuration**:
  - Default root object: index.html
  - IPv6 enabled
  - Origin Access Control for S3 access
  - Custom error responses for SPA routing (redirect to index.html)
  - Origin path set to "/future-craft" to match application structure
  - SSL/TLS certificate configuration

#### IAM Roles and Policies

- **Purpose**: Secure access between services
- **Configuration**:
  - CloudFront service principal permissions to access S3
  - Origin Access Control identity

### 3. Build Components

#### Next.js Build Process

- **Purpose**: Generate static site files
- **Steps**:
  - Install dependencies with `npm ci`
  - Build production assets with `npm run build`
  - Export static files with `next export`
  - Output to "out" directory

### 4. Deployment Components

#### Infrastructure Deployment

- **Purpose**: Provision AWS resources
- **Implementation**: AWS CDK deployment
- **Output**: JSON/YAML file with infrastructure details

#### Application Deployment

- **Purpose**: Upload static files to S3 and invalidate CloudFront cache
- **Implementation**: AWS CLI commands
- **Input**: Infrastructure details from JSON/YAML file
- **Steps**:
  - S3 sync with `aws s3 cp` command to the "future-craft/" prefix in the S3 bucket
  - Include "--delete" flag to remove stale files
  - Set appropriate cache control headers for different file types
  - CloudFront invalidation with `aws cloudfront create-invalidation` for "/\*"

## Data Models

### Makefile Structure

```makefile
# Main targets
.PHONY: help build deploy-infra deploy-app clean

# Help target for documentation
help:
	@echo "Available targets:"
	@echo "  build         - Build the Next.js application for production"
	@echo "  deploy-infra  - Deploy AWS infrastructure using CDK"
	@echo "  deploy-app    - Deploy application to S3 and invalidate CloudFront"
	@echo "  clean         - Remove build artifacts"

# Build target
build:
	# Install dependencies and build application
	# Export static files

# Infrastructure deployment target
deploy-infra:
	# Deploy CDK stack
	# Export infrastructure details to file

# Application deployment target
deploy-app:
	# Read infrastructure details
	# Sync files to S3
	# Invalidate CloudFront cache

# Clean target
clean:
	# Remove build artifacts
```

### Infrastructure Export File (JSON/YAML)

```json
{
  "s3Bucket": "example-bucket-name",
  "cloudFrontDistributionId": "EDFDVBD6EXAMPLE",
  "cloudFrontDomain": "d111111abcdef8.cloudfront.net"
}
```

## Error Handling

### Infrastructure Deployment Errors

- CDK will handle rollback of failed deployments
- Errors will be logged with stack traces for debugging

### Application Deployment Errors

- If S3 upload fails:
  - Previous version remains intact
  - Detailed error logs will be generated
  - CloudFront invalidation will not be triggered
- Retry mechanisms for transient errors
- Error handling will ensure that failed deployments do not impact the currently deployed version

## Testing Strategy

### Infrastructure Testing

- CDK unit tests for stack definition
- CDK integration tests for resource creation
- Manual verification of created resources

### Deployment Testing

- Script testing with mock S3 and CloudFront
- End-to-end testing in a staging environment
- Validation of CloudFront cache behavior
- Verification of client-side routing
- Testing of error handling and rollback mechanisms

## CI/CD Integration

The deployment process will be integrated with CI/CD pipelines with the following approach:

1. **Infrastructure Pipeline**:

   - Triggered only when CDK files change
   - Deploys infrastructure changes using `make deploy-infra`
   - Updates the infrastructure export file
   - Stores this file in a location accessible to the deployment phase

2. **Application Pipeline**:
   - Triggered on main branch merges
   - Builds the Next.js application using `make build`
   - Deploys to S3 and invalidates CloudFront cache using `make deploy-app`

This separation ensures that infrastructure changes are deployed only when necessary, while application updates can happen more frequently without modifying the underlying infrastructure. The Makefile provides a consistent interface for both local development and CI/CD pipelines.

## Rationale for Design Decisions

1. **Using S3 + CloudFront**: This is a cost-effective, scalable, and reliable approach for hosting static websites with global distribution.

2. **Separating Infrastructure from Application Deployment**:

   - Infrastructure changes are less frequent and more impactful
   - Application deployments can happen independently and more frequently
   - Reduces risk by limiting the scope of each deployment

3. **AWS CDK for Infrastructure**:

   - Provides type safety and better developer experience than CloudFormation templates
   - Enables infrastructure testing
   - Supports higher-level constructs for common patterns

4. **AWS CLI for Application Deployment**:

   - Simple, reliable tool for S3 operations
   - Avoids unnecessary complexity of using CDK for file uploads
   - Better control over cache headers and sync options

5. **Makefile for Orchestration**:

   - Provides a consistent interface for both local and CI/CD environments
   - Self-documents the build and deployment process
   - Manages dependencies between tasks
   - Simplifies complex command sequences
   - Widely understood tool with minimal dependencies

6. **Origin Access Control**:

   - More modern approach than Origin Access Identity
   - Improved security model for S3 to CloudFront access
   - Recommended by AWS for new implementations

7. **Custom Error Responses**:
   - Enables client-side routing in a single-page application
   - Ensures proper behavior when users directly access routes
