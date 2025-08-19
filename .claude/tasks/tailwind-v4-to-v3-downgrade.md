# Tailwind CSS v4 to v3 Downgrade Plan

## Current State Analysis

The project is currently using Tailwind CSS v4.1.11 with:
- `@tailwindcss/postcss`: ^4.1.11
- `@tailwindcss/vite`: ^4.1.11  
- CSS-first configuration in `src/styles/index.css`
- v4 syntax: `@import 'tailwindcss';`, `@plugin`, `@theme`, `@custom-variant`
- v4 PostCSS and Vite plugins

## Downgrade Plan

### 1. Dependencies Update
**Remove v4 packages:**
- `@tailwindcss/postcss`
- `@tailwindcss/vite`
- `tailwindcss` v4.1.11

**Add v3 packages:**
- `tailwindcss`: ^3.4.17
- `autoprefixer`: ^10.4.16

### 2. Configuration Files
**Create tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  corePlugins: {
    preflight: false, // Disable for component library
  },
}
```

**Create postcss.config.cjs:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 3. CSS File Updates
**Convert `src/styles/index.css` from v4 to v3 syntax:**
- Change `@import 'tailwindcss';` to v3 directives
- Remove `@plugin`, `@theme`, `@custom-variant` v4 syntax
- Keep CSS custom properties and utility classes

### 4. Build Configuration Updates
**Vite config:**
- Remove `@tailwindcss/vite` plugin
- Ensure PostCSS processes CSS files

**Rollup config:**
- Update postcss plugin to use `postcss.config.cjs`

### 5. Package Dependencies
Update package.json to remove v4 and add v3:
```json
{
  "dependencies": {
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16"
  }
}
```

## Risk Assessment
- **Low Risk**: v3 is stable and well-tested
- **CSS Variables**: Existing CSS custom properties will be preserved
- **Component Compatibility**: v3 classes are subset of v4, should work
- **Build Process**: May need minor adjustments but straightforward

## Testing Plan
1. Update dependencies
2. Create configuration files  
3. Update CSS syntax
4. Run `npm run build` to test production build
5. Run `npm run dev` to test development server
6. Verify all components render correctly
7. Check for any missing styles or build errors

## Rollback Plan
If issues occur:
1. Git stash/commit current changes
2. Restore v4 dependencies from package-lock.json backup
3. Restore v4 CSS syntax
4. Remove v3 config files

## Benefits of Downgrade
- More stable, proven technology
- Better documentation and community support  
- Broader browser compatibility
- Easier debugging and troubleshooting
- More predictable behavior in component libraries