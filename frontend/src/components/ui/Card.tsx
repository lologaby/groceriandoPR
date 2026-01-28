import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

export interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, glass = false, className = '', ...props }, ref) => {
    const baseStyles = 'rounded-xl transition-all duration-300';
    const glassStyles = glass
      ? 'glass'
      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800';
    const hoverStyles = hover
      ? 'hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer'
      : 'shadow-sm';

    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
