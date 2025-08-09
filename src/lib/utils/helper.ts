import { ShopperType } from '@/types';
import DOMPurify from 'dompurify';

export const shopperLookup = (shoppers: ShopperType[]) => {
  console.log(shoppers);
  return new Map<number, string>(
    shoppers.map((shopper: { id: number; name: string }) => [
      shopper.id,
      shopper.name,
    ])
  );
};

export const checkObjectDiff = (
  originalObject: any,
  modifiedObject: any,
  compareOnlyModifiedKeys: boolean = false,
  ignoredKeys: string[] = []
): boolean => {
  // Handle null/undefined cases
  if (originalObject === null && modifiedObject === null) return false;
  if (originalObject === undefined && modifiedObject === undefined)
    return false;
  if (originalObject === null || originalObject === undefined) return true;
  if (modifiedObject === null || modifiedObject === undefined) return true;

  // Handle primitive types
  if (
    typeof originalObject !== 'object' ||
    typeof modifiedObject !== 'object'
  ) {
    return originalObject !== modifiedObject;
  }

  // Handle arrays
  if (Array.isArray(originalObject) !== Array.isArray(modifiedObject)) {
    return true;
  }

  if (Array.isArray(originalObject)) {
    if (originalObject.length !== modifiedObject.length) {
      return true;
    }

    for (let i = 0; i < originalObject.length; i++) {
      if (
        checkObjectDiff(
          originalObject[i],
          modifiedObject[i],
          compareOnlyModifiedKeys,
          ignoredKeys
        )
      ) {
        return true;
      }
    }
    return false;
  }

  // Handle objects
  const originalKeys = Object.keys(originalObject);
  const modifiedKeys = Object.keys(modifiedObject);

  if (compareOnlyModifiedKeys) {
    // Compare only based on keys present in modified object
    for (const key of modifiedKeys) {
      // Skip ignored keys
      if (ignoredKeys.includes(key)) {
        continue;
      }

      if (!originalKeys.includes(key)) {
        // New key added
        return true;
      }
      if (
        checkObjectDiff(
          originalObject[key],
          modifiedObject[key],
          compareOnlyModifiedKeys,
          ignoredKeys
        )
      ) {
        return true;
      }
    }
    return false;
  } else {
    // Compare all keys (same object structure)
    // Filter out ignored keys
    const filteredOriginalKeys = originalKeys.filter(
      (key) => !ignoredKeys.includes(key)
    );
    const filteredModifiedKeys = modifiedKeys.filter(
      (key) => !ignoredKeys.includes(key)
    );

    // Check for added or removed keys (excluding ignored keys)
    const addedKeys = filteredModifiedKeys.filter(
      (key) => !filteredOriginalKeys.includes(key)
    );
    const removedKeys = filteredOriginalKeys.filter(
      (key) => !filteredModifiedKeys.includes(key)
    );

    if (addedKeys.length > 0 || removedKeys.length > 0) {
      return true;
    }

    // Check for value changes in common keys (excluding ignored keys)
    for (const key of filteredOriginalKeys) {
      if (
        checkObjectDiff(
          originalObject[key],
          modifiedObject[key],
          compareOnlyModifiedKeys,
          ignoredKeys
        )
      ) {
        return true;
      }
    }

    return false;
  }
};

export const splitByAndCapitalize = (
  str: string,
  delimiter: string = '_'
): string => {
  return str
    .split(delimiter)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const sanitizeHtml = async (dirtyHTML: string) => {
  // First sanitize
  const clean = DOMPurify.sanitize(dirtyHTML, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'div',
      'span',
      'p',
      'a',
      'img',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
      'br',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'style'],
  });

  return clean;
};
