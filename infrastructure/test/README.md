# Deployment Tests

This directory contains tests for the deployment process of the Future Craft application.

## Test Types

### Unit Tests

Unit tests verify the functionality of the deployment script using mock AWS services. These tests don't make actual AWS API calls and can be run without AWS credentials.

- `deploy-app.test.ts`: Tests the deployment script functionality with mocked AWS services

### End-to-End Tests

End-to-end tests verify the deployment process in a staging environment. These tests make actual AWS API calls and require AWS credentials.

- `e2e-deployment.test.ts`: Tests the deployment process in a staging environment

## Running Tests

### Unit Tests

To run the unit tests:

```bash
# Run all unit tests
npm run test:unit

# Run only deployment script tests
npm run test:unit -- -t "deploy-app"
```

### End-to-End Tests

To run the end-to-end tests:

```bash
# Run all end-to-end tests
npm run test:e2e

# Or with the environment variable directly
STAGING_ENV=true npm test -- -t "E2E Deployment Tests"
```

**Note**: End-to-end tests require:
1. Valid AWS credentials with permissions to:
   - Read/write to the S3 bucket
   - Create CloudFront invalidations
2. The infrastructure to be deployed (run `make deploy-infra` first)
3. The `STAGING_ENV=true` environment variable to be set

## Test Coverage

To generate test coverage reports:

```bash
npm test -- --coverage
```

The coverage report will be available in the `coverage` directory.

## CI/CD Integration

In CI/CD pipelines, you should:

1. Always run unit tests
2. Run end-to-end tests only in staging environments
3. Use the Makefile target `make test-deploy` for consistent execution

Example CI/CD configuration:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd infrastructure && npm ci
      - run: make test-deploy
  
  test-e2e:
    runs-on: ubuntu-latest
    environment: staging
    if: github.ref == 'refs/heads/main'
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd infrastructure && npm ci
      - run: cd infrastructure && npm run test:e2e
    env:
      STAGING_ENV: 'true'
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_REGION: 'eu-west-1'
```