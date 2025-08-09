import React from 'react';
import type { LucideProps } from 'lucide-react';

const loadedIcons: {
  [key: string]: React.LazyExoticComponent<React.ComponentType<LucideProps>>;
} = {};

const dynamicImportLucideIcon = (
  iconName: string
): React.LazyExoticComponent<React.ComponentType<LucideProps>> => {
  if (loadedIcons[iconName]) {
    return loadedIcons[iconName];
  }

  // Dynamically load the icon from lucide-react library
  const lazyIcon = React.lazy(() =>
    import('lucide-react').then((icons) => {
      const Icon = icons[iconName as keyof typeof icons] as
        | React.ComponentType<LucideProps>
        | undefined;
      if (!Icon) {
        throw new Error(`Icon ${iconName} not found in lucide-react`);
      }
      return { default: Icon };
    })
  );

  // Cache the icon for subsequent usage
  loadedIcons[iconName] = lazyIcon;

  return lazyIcon;
};

export default dynamicImportLucideIcon;
