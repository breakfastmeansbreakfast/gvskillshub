import React from 'react';

interface ResponsiveContainerProps {
  /**
   * Content to be rendered inside the container
   */
  children: React.ReactNode;
  
  /**
   * Optional additional CSS classes
   */
  className?: string;
  
  /**
   * Optional ID for accessibility purposes and DOM referencing
   */
  id?: string;
  
  /**
   * Optional ARIA role if the default semantic meaning needs to be overridden
   * Only use when necessary as semantic HTML is preferred
   */
  role?: string;
  
  /**
   * Optional ARIA label for better screen reader support
   * Provides a descriptive label that is read by screen readers
   */
  ariaLabel?: string;
  
  /**
   * Optional ARIA labelledby reference
   * References the ID of another element that labels this container
   */
  ariaLabelledBy?: string;
  
  /**
   * Optional ARIA describedby reference
   * References the ID of another element that describes this container
   */
  ariaDescribedBy?: string;
  
  /**
   * Optional HTML tag to use for the container
   * Defaults to 'section' but can be changed for semantic purposes
   */
  as?: 'section' | 'article' | 'div' | 'main' | 'aside';
}

/**
 * A responsive container component that adapts to different screen sizes.
 * Takes up approximately 50% of the width on large screens and expands to fill most of the page on smaller screens.
 * 
 * Features:
 * - White background with rounded corners
 * - Responsive width (50% on large screens, ~90% on small screens)
 * - Accessible with proper semantic HTML and ARIA attributes
 * 
 * Accessibility features:
 * - Uses semantic HTML elements (configurable via 'as' prop)
 * - Ensures proper color contrast with white background
 * - Supports ARIA attributes for screen readers
 * - Follows WAI-ARIA best practices
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children,
  className = "",
  id,
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  as: Component = 'section',
}) => {
  return (
    <Component
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className={`
        bg-white 
        text-gray-900
        rounded-xl 
        shadow-lg 
        p-6 
        mx-auto 
        my-8 
        w-[90%] 
        md:w-[70%] 
        lg:w-[50%] 
        transition-all 
        duration-300
        focus-within:outline-none
        focus-within:ring-2
        focus-within:ring-blue-500
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

/**
 * Accessibility Notes:
 * 
 * 1. Semantic HTML: 
 *    - By default, this component uses a <section> element which is appropriate for a distinct section of content
 *    - The 'as' prop allows changing to other semantic elements like <article> when more appropriate
 * 
 * 2. Color Contrast:
 *    - The white background with dark text ensures WCAG AA compliant contrast ratio
 *    - The text-gray-900 class provides sufficient contrast against the white background
 * 
 * 3. ARIA Attributes:
 *    - aria-label: Provides a text description for screen readers
 *    - aria-labelledby: References another element that serves as the label
 *    - aria-describedby: References another element that provides additional description
 *    - role: Only needed when the semantic meaning needs to be overridden
 * 
 * 4. Focus Management:
 *    - focus-within styles help identify when the container has focus
 *    - This is especially helpful for keyboard navigation
 */

export default ResponsiveContainer;