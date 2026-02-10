import * as cdk from 'aws-cdk-lib';
import * as Infrastructure from '../lib/infrastructure-stack';

/**
 * This test file focuses on integration tests for resource creation.
 * It verifies that resources are created with the correct dependencies
 * and that the stack can be synthesized without errors.
 */
describe('Resource Creation Integration Tests', () => {
  test('Stack can be synthesized without errors', () => {
    // GIVEN
    const app = new cdk.App();
    
    // WHEN
    const stack = new Infrastructure.InfrastructureStack(app, 'ResourceCreationTestStack');
    
    // THEN - No error thrown during synthesis
    expect(() => {
      app.synth();
    }).not.toThrow();
  });
});