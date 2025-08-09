# Integrate CustomPropertyPanel with UnlayerMain using Tailwind CSS

## Task Overview
Modify `src/features/builder/components/UnlayerMain.tsx` to include CustomPropertyPanel component with Tailwind styling instead of inline styles.

## Implementation Plan

### Phase 1: Analysis and Discovery
1. **Read UnlayerMain.tsx** - Understand current layout structure and positioning
2. **Locate CustomPropertyPanel** - Verify the component exists and understand its props interface
3. **Analyze existing layout** - Determine best integration point without breaking Unlayer functionality

### Phase 2: Style Conversion Planning
Convert the provided inline styles to Tailwind equivalents:

**Desktop Styles (default)**:
- `position: absolute` → `absolute`
- `top: 16px` → `top-4`
- `right: 16px` → `right-4`
- `zIndex: 1000` → `z-[1000]`
- `maxWidth: 320px` → `max-w-80`
- `minWidth: 280px` → `min-w-70`
- `boxShadow: 0 4px 12px rgba(0,0,0,0.15)` → `shadow-lg`

**Responsive Styles (max-width: 1200px)**:
- Use `max-xl:` prefix for screens smaller than 1280px (closest to 1200px)
- `position: relative` → `max-xl:relative`
- `right: auto` → `max-xl:right-auto`
- `top: auto` → `max-xl:top-auto`
- `marginTop: 16px` → `max-xl:mt-4`
- `maxWidth: 100%` → `max-xl:max-w-full`
- `boxShadow: none` → `max-xl:shadow-none`

### Phase 3: Implementation
1. **Import CustomPropertyPanel** - Add import statement at top of file
2. **Integrate component** - Add CustomPropertyPanel to JSX with proper Tailwind classes
3. **Position correctly** - Ensure it doesn't interfere with existing Unlayer layout
4. **Apply responsive classes** - Implement mobile-first responsive behavior

### Phase 4: Validation
1. **Visual positioning** - Verify correct absolute positioning on desktop
2. **Responsive behavior** - Confirm proper layout changes on smaller screens
3. **Z-index layering** - Ensure panel appears above other elements
4. **Existing functionality** - Verify Unlayer canvas remains functional

## Key Considerations

### Integration Points
- Must not interfere with Unlayer's canvas area
- Should be positioned as overlay on desktop, inline on mobile
- Maintain proper z-index stacking context

### Responsive Design
- Desktop (xl): Absolute positioned overlay with shadow
- Mobile/Tablet (max-xl): Relative positioned inline element without shadow

### Tailwind Classes to Use
```css
absolute top-4 right-4 z-[1000] 
max-w-80 min-w-70 
shadow-lg
xl:absolute xl:top-4 xl:right-4 xl:shadow-lg
max-xl:relative max-xl:right-auto max-xl:top-auto max-xl:mt-4 max-xl:max-w-full max-xl:shadow-none
custom-property-overlay
```

## Success Criteria
- CustomPropertyPanel properly integrated into UnlayerMain
- Uses only Tailwind CSS classes (no inline styles)
- Maintains same visual appearance and responsive behavior
- Doesn't break existing Unlayer functionality
- Proper positioning at different screen sizes

## Potential Risks
- Breaking existing Unlayer canvas layout
- Z-index conflicts with Unlayer's internal components
- Responsive breakpoint misalignment
- CSS class conflicts

## Next Steps
1. Read and analyze current UnlayerMain.tsx structure
2. Implement the integration with Tailwind classes
3. Test positioning and responsiveness
4. Validate no functionality is broken