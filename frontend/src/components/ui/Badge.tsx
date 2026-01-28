import { motion } from 'framer-motion';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default:
      'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700',
    success:
      'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400 border border-success-200 dark:border-success-800',
    warning:
      'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400 border border-warning-200 dark:border-warning-800',
    danger:
      'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800',
    primary:
      'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 border border-primary-200 dark:border-primary-800',
  };

  return (
    <motion.span
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </motion.span>
  );
}
