# Makefile for Future Craft Deployment
# This Makefile orchestrates the build and deployment process for the Future Craft application

# Configuration parameters
AWS_REGION ?= eu-west-1
currentDir := $(shell pwd)

# Declare all phony targets (targets that don't represent files)
.PHONY: help all build deploy-infra deploy-app clean test test-infra test-deploy

# Default target when running 'make' without arguments
.DEFAULT_GOAL := help

# Help target - displays available commands with descriptions
help:
	@echo "Future Craft Deployment"
	@echo "======================="
	@echo ""
	@echo "Available targets:"
	@echo ""
	@echo "  help         - Display this help message"
	@echo "  all          - Build, deploy infrastructure, and deploy application"
	@echo "  build        - Build the Next.js application for production"
	@echo "  deploy-infra - Deploy AWS infrastructure using CDK"
	@echo "  deploy-app   - Deploy application to S3 and invalidate CloudFront cache"
	@echo "  clean        - Remove build artifacts"
	@echo "  test         - Run all tests"
	@echo "  test-infra   - Run infrastructure tests"
	@echo "  test-deploy  - Run deployment tests"
	@echo ""
	@echo "Usage examples:"
	@echo "  make all             - Complete end-to-end deployment"
	@echo "  make build           - Build the application"
	@echo "  make deploy-infra    - Deploy infrastructure only"
	@echo "  make deploy-app      - Deploy application only"
	@echo "  make clean build     - Clean and rebuild"
	@echo ""

# All target - builds, deploys infrastructure, and deploys application
all: build deploy-infra deploy-app

# Build target - builds the Next.js application
build:
	@echo "Building Next.js application..."
	@echo "Step 1: Installing dependencies..."
	cd future-craft && npm ci
	@echo "Step 2: Building and exporting static files..."
	cd future-craft && npm run build
	@echo "Build completed successfully. Static files are in future-craft/out directory."

# Infrastructure deployment target - deploys AWS infrastructure using CDK
deploy-infra:
	@echo "Deploying infrastructure with AWS CDK..."
	@echo "Step 1: Installing dependencies..."
	cd infrastructure && npm ci
	@echo "Step 2: Building TypeScript code..."
	cd infrastructure && npm run build
	@echo "Step 3: Deploying CDK stack..."
	cd infrastructure && CDK_DEFAULT_REGION=$(AWS_REGION) npm run deploy -- --require-approval never
	@echo "Step 4: Exporting CloudFormation outputs..."
	aws cloudformation describe-stacks --stack-name FutureCraftInfrastructureStack --query 'Stacks[0].Outputs' > cfn.outputs
	@echo "Infrastructure deployment completed successfully."
	@echo "CloudFormation outputs exported to cfn.outputs"

# Application deployment target - deploys application to S3 and invalidates CloudFront
deploy-app:
	@echo "Deploying application to S3 and invalidating CloudFront cache..."
	@echo "Step 1: Checking for CloudFormation outputs..."
	@test -f cfn.outputs || (echo "Error: CloudFormation outputs not found. Run 'make deploy-infra' first." && exit 1)
	@echo "Step 2: Checking for build directory..."
	@test -d future-craft/out || (echo "Error: Build directory not found. Run 'make build' first." && exit 1)
	@echo "Step 3: Syncing files to S3..."
	aws s3 sync future-craft/out s3://$(shell node get_cfn_output.js S3BucketName)/ --delete
	@echo "Step 4: Creating CloudFront invalidation..."
	aws cloudfront create-invalidation --distribution-id $(shell node get_cfn_output.js CloudFrontDistributionId) --paths '/*'
	@echo "Application deployment and CloudFront invalidation completed successfully."
	@echo "You can view your application at $(shell node get_cfn_output.js CloudFrontURL)"

# Clean target - removes build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@echo "Removing Next.js build artifacts..."
	-rm -rf future-craft/.next
	-rm -rf future-craft/out
	@echo "Removing infrastructure build artifacts..."
	-rm -rf infrastructure/lib/*.js infrastructure/lib/*.d.ts
	-rm -rf infrastructure/bin/*.js infrastructure/bin/*.d.ts
	-rm -rf infrastructure/scripts/*.js infrastructure/scripts/*.d.ts
	-rm -rf infrastructure/test/*.js infrastructure/test/*.d.ts
	-rm -f infrastructure/.infrastructure-config.json
	@echo "Build artifacts cleaned successfully."

# Test targets
test: test-infra test-deploy
	@echo "All tests completed"

test-infra:
	@echo "Running infrastructure tests..."
	cd infrastructure && npm test -- -t "InfrastructureStack"
	@echo "Infrastructure tests completed successfully."

test-deploy:
	@echo "Running deployment tests..."
	@echo "Step 1: Running unit tests for deployment script..."
	cd infrastructure && npm test -- -t "deploy-app"
	@echo "Step 2: Running end-to-end tests (skipped by default)..."
	@echo "To run E2E tests, use: cd infrastructure && npm run test:e2e"
	@echo "Deployment tests completed successfully."