import React from 'react';
import { Select, SelectProps } from 'antd';
import { ShopperType } from '@/types/common';
import { useGenericStore } from '@/stores/generic.store';

export interface ShopperSelectorProps
  extends Omit<SelectProps, 'options' | 'mode'> {
  /** Selection mode - single or multiple */
  mode?: 'single' | 'multiple';
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Show search functionality */
  showSearch?: boolean;
  /** Custom filter function */
  filterOption?: (input: string, option: any) => boolean;
  /** Value(s) - can be single number or array of numbers */
  value?: number | number[];
  /** Change handler */
  onChange?: (value: number | number[] | undefined) => void;
  /** Custom render for option labels */
  renderLabel?: (shopper: ShopperType) => string;
  /** Custom render for option values */
  renderValue?: (shopper: ShopperType) => number | string;
  /** Allow clearing selection */
  allowClear?: boolean;
  /** Size of the selector */
  size?: 'small' | 'middle' | 'large';
  /** Additional CSS classes */
  className?: string;
  /** Show shopper icons in options */
  showIcons?: boolean;
}

export const ShopperSelector: React.FC<ShopperSelectorProps> = ({
  mode = 'single',
  disabled = false,
  loading = false,
  placeholder,
  showSearch = true,
  filterOption,
  value,
  onChange,
  renderLabel,
  renderValue,
  allowClear = true,
  size = 'middle',
  className,
  showIcons = false,
  ...restProps
}) => {
  const { shoppers } = useGenericStore();
  // Default placeholder based on mode
  const defaultPlaceholder =
    mode === 'multiple' ? 'Select shoppers' : 'Select a shopper';

  // Default filter function
  const defaultFilterOption = (input: string, option: any) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  // Generate options from shoppers array
  const options = shoppers.map((shopper) => {
    const label = renderLabel ? renderLabel(shopper) : shopper.name;
    const optionValue = renderValue ? renderValue(shopper) : shopper.id;

    return {
      label:
        showIcons && shopper.icon ? (
          <div className="flex items-center gap-2">
            <img
              src={shopper.icon}
              alt={shopper.name}
              className="w-4 h-4 rounded"
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span>{label}</span>
          </div>
        ) : (
          label
        ),
      value: optionValue,
      shopper, // Keep reference to original shopper object
    };
  });

  // Handle change event
  const handleChange = (selectedValue: any) => {
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <Select
      mode={mode === 'multiple' ? 'multiple' : undefined}
      value={value}
      onChange={handleChange}
      options={options}
      placeholder={placeholder || defaultPlaceholder}
      showSearch={showSearch}
      filterOption={filterOption || defaultFilterOption}
      disabled={disabled}
      loading={loading}
      allowClear={allowClear}
      size={size}
      className={className}
      {...restProps}
    />
  );
};

// Export default for easier imports
export default ShopperSelector;
