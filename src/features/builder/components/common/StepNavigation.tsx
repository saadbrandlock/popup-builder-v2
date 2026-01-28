import React from 'react';
import { Button, Space } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

export interface NavigationButton {
  key: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  htmlType?: 'button' | 'submit' | 'reset';
  size?: 'small' | 'middle' | 'large';
}

export interface StepNavigationProps {
  /** Left side buttons (typically back/previous) */
  leftButtons?: NavigationButton[];
  /** Right side buttons (typically next/save/submit) */
  rightButtons?: NavigationButton[];
  /** Custom className for the container */
  className?: string;
  /** Custom style for the container */
  style?: React.CSSProperties;
  /** Whether to show the navigation at all */
  visible?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  leftButtons = [],
  rightButtons = [],
  className = '',
  style,
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  const renderButton = (button: NavigationButton) => (
    <Button
      key={button.key}
      type={button.type || 'default'}
      icon={button.icon}
      loading={button.loading}
      disabled={button.disabled}
      onClick={button.onClick}
      htmlType={button.htmlType}
      size={button.size || 'large'}
    >
      {button.label}
    </Button>
  );

  return (
    <div
      className={`flex justify-between items-center ${className}`}
      style={style}
    >
      <div>
        {leftButtons.length > 0 && (
          <Space>{leftButtons.map(renderButton)}</Space>
        )}
      </div>
      <div>
        {rightButtons.length > 0 && (
          <Space>{rightButtons.map(renderButton)}</Space>
        )}
      </div>
    </div>
  );
};

export default StepNavigation;

// Utility functions for common button configurations
export const createBackButton = (
  onClick: () => void,
  options?: Partial<NavigationButton>
): NavigationButton => ({
  key: 'back',
  label: 'Back',
  icon: <ArrowLeftOutlined />,
  onClick,
  ...options,
});

export const createNextButton = (
  onClick: () => void,
  options?: Partial<NavigationButton>
): NavigationButton => ({
  key: 'next',
  label: 'Next',
  icon: <ArrowRightOutlined />,
  type: 'primary',
  onClick,
  ...options,
});

export const createSaveButton = (
  onClick: () => void,
  options?: Partial<NavigationButton>
): NavigationButton => ({
  key: 'save',
  label: 'Save',
  icon: <SaveOutlined />,
  type: 'primary',
  onClick,
  ...options,
});

export const createPreviousButton = (
  onClick: () => void,
  label: string = 'Previous',
  options?: Partial<NavigationButton>
): NavigationButton => ({
  key: 'previous',
  label,
  icon: <ArrowLeftOutlined />,
  onClick,
  ...options,
});

export const createSubmitButton = (
  onClick: () => void,
  label: string = 'Submit',
  options?: Partial<NavigationButton>
): NavigationButton => ({
  key: 'submit',
  label,
  type: 'primary',
  htmlType: 'submit',
  onClick,
  ...options,
});
