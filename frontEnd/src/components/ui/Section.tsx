import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'dark';
  maxWidth?: 'default' | 'wide' | 'full';
}

export function Section({ 
  children, 
  className, 
  background = 'white',
  maxWidth = 'default'
}: SectionProps) {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-dark-50',
    dark: 'bg-dark-900 text-white',
  };
  
  const maxWidths = {
    default: 'max-w-7xl',
    wide: 'max-w-8xl',
    full: 'max-w-full',
  };
  
  return (
    <section className={clsx('py-20 md:py-32', backgrounds[background], className)}>
      <div className={clsx('mx-auto px-4 sm:px-6 lg:px-8', maxWidths[maxWidth])}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeader({ title, subtitle, centered = true }: SectionHeaderProps) {
  return (
    <motion.div
      className={clsx('mb-16', centered && 'text-center')}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-display-md md:text-display-lg mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-dark-600 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
