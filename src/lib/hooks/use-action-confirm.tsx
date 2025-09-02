import { Modal } from 'antd';
import { ModalConfig } from 'antd/es/config-provider/context';
import { useCallback, useState } from 'react';

type UseActionConfirmOptions = {
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

export const useActionConfirm = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<UseActionConfirmOptions>({});

  const showConfirm = useCallback((newOptions: UseActionConfirmOptions) => {
    setOptions(newOptions);
    setIsVisible(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsVisible(false);
    if (options.onConfirm) {
      await options.onConfirm();
    }
  }, [options]);

  const handleCancel = useCallback(() => {
    setIsVisible(false);
    if (options.onCancel) {
      options.onCancel();
    }
  }, [options]);

  const ConfirmModal = useCallback(() => {
    return (
      <Modal
        title={options.title || 'Are you sure?'}
        open={isVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText="Confirm"
        cancelText="Cancel"
      >
        {options.content || 'This action cannot be undone.'}
      </Modal>
    );
  }, [isVisible, options, handleConfirm, handleCancel]);

  return { showConfirm, ConfirmModal };
};
