import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveContainer from '../ResponsiveContainer';

describe('ResponsiveContainer', () => {
  // Test 1: Component renders without errors
  it('renders without crashing', () => {
    render(<ResponsiveContainer>Test content</ResponsiveContainer>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  // Test 2: Component renders children correctly
  it('renders children correctly', () => {
    render(
      <ResponsiveContainer>
        <div data-testid="child-element">Child content</div>
      </ResponsiveContainer>
    );
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  // Test 3: Component applies default styling
  it('applies default styling', () => {
    const { container } = render(<ResponsiveContainer>Test content</ResponsiveContainer>);
    const element = container.firstChild;
    
    // Check that the component has the expected classes
    expect(element).toHaveClass('bg-white');
    expect(element).toHaveClass('rounded-xl');
    expect(element).toHaveClass('w-[90%]');
    expect(element).toHaveClass('md:w-[70%]');
    expect(element).toHaveClass('lg:w-[50%]');
  });

  // Test 4: Component accepts and applies additional className
  it('accepts and applies additional className', () => {
    const { container } = render(<ResponsiveContainer className="test-class">Test content</ResponsiveContainer>);
    const element = container.firstChild;
    
    expect(element).toHaveClass('test-class');
    expect(element).toHaveClass('bg-white'); // Still has default classes
  });

  // Test 5: Component uses correct semantic element
  it('uses section as default semantic element', () => {
    const { container } = render(<ResponsiveContainer>Test content</ResponsiveContainer>);
    const element = container.firstChild;
    
    expect(element?.nodeName).toBe('SECTION');
  });

  // Test 6: Component allows changing semantic element
  it('allows changing semantic element via as prop', () => {
    const { container } = render(<ResponsiveContainer as="article">Test content</ResponsiveContainer>);
    const element = container.firstChild;
    
    expect(element?.nodeName).toBe('ARTICLE');
  });

  // Test 7: Component applies accessibility attributes
  it('applies accessibility attributes correctly', () => {
    const { container } = render(
      <ResponsiveContainer 
        id="test-id" 
        role="region" 
        ariaLabel="Test label"
        ariaLabelledBy="test-label-id"
        ariaDescribedBy="test-desc-id"
      >
        Test content
      </ResponsiveContainer>
    );
    
    const element = container.firstChild;
    
    expect(element).toHaveAttribute('id', 'test-id');
    expect(element).toHaveAttribute('role', 'region');
    expect(element).toHaveAttribute('aria-label', 'Test label');
    expect(element).toHaveAttribute('aria-labelledby', 'test-label-id');
    expect(element).toHaveAttribute('aria-describedby', 'test-desc-id');
  });

  // Test 8: Component has responsive width classes for different screen sizes
  describe('Responsive behavior', () => {
    it('has responsive width classes for different screen sizes', () => {
      const { container } = render(<ResponsiveContainer>Test content</ResponsiveContainer>);
      const element = container.firstChild;
      
      // Default/mobile width (90%)
      expect(element).toHaveClass('w-[90%]');
      
      // Medium screens width (70%)
      expect(element).toHaveClass('md:w-[70%]');
      
      // Large screens width (50%)
      expect(element).toHaveClass('lg:w-[50%]');
    });
    
    it('applies transition for smooth width changes', () => {
      const { container } = render(<ResponsiveContainer>Test content</ResponsiveContainer>);
      const element = container.firstChild;
      
      expect(element).toHaveClass('transition-all');
      expect(element).toHaveClass('duration-300');
    });
  });
  
  // Test 9: Component has proper accessibility features
  describe('Accessibility features', () => {
    it('uses semantic HTML structure', () => {
      // Test different semantic elements
      const semanticElements = ['section', 'article', 'main', 'aside', 'div'] as const;
      
      semanticElements.forEach(element => {
        const { container, unmount } = render(
          <ResponsiveContainer as={element}>Test content</ResponsiveContainer>
        );
        const containerElement = container.firstChild;
        expect(containerElement?.nodeName.toLowerCase()).toBe(element);
        unmount();
      });
    });
    
    it('has sufficient color contrast', () => {
      const { container } = render(<ResponsiveContainer>Test content</ResponsiveContainer>);
      const element = container.firstChild;
      
      // White background
      expect(element).toHaveClass('bg-white');
      
      // Dark text for contrast
      expect(element).toHaveClass('text-gray-900');
    });
    
    it('has focus indicators for keyboard navigation', () => {
      const { container } = render(<ResponsiveContainer>Test content</ResponsiveContainer>);
      const element = container.firstChild;
      
      // Focus styles
      expect(element).toHaveClass('focus-within:outline-none');
      expect(element).toHaveClass('focus-within:ring-2');
      expect(element).toHaveClass('focus-within:ring-blue-500');
    });
    
    it('supports all required ARIA attributes', () => {
      const { container } = render(
        <ResponsiveContainer 
          id="test-id" 
          role="region" 
          ariaLabel="Test label"
          ariaLabelledBy="test-label-id"
          ariaDescribedBy="test-desc-id"
        >
          Test content
        </ResponsiveContainer>
      );
      
      const element = container.firstChild;
      
      // Check all ARIA attributes are applied correctly
      expect(element).toHaveAttribute('aria-label', 'Test label');
      expect(element).toHaveAttribute('aria-labelledby', 'test-label-id');
      expect(element).toHaveAttribute('aria-describedby', 'test-desc-id');
      expect(element).toHaveAttribute('role', 'region');
    });
  });
});