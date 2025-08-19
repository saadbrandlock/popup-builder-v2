import { useGenericStore } from '@/stores/generic.store';
import { BaseProps } from '@/types/props';
import { message, Steps } from 'antd';
import React, { useEffect, useState } from 'react';
import ConfigStep from './ConfigStep';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useBuilderStore } from '@/stores/builder.store';
import { UnlayerMain } from './UnlayerMain';
import ReminderTabStep from './ReminderTabStep';
import { TemplateConfig } from '@/types';
import { checkObjectDiff } from '@/lib/utils/helper';
import { useBuilderMain } from '../hooks/useBuilderMain';
import { useTemplateListing } from '@/features/template-builder/hooks/use-template-listing';
import { UnlayerOptions } from 'react-email-editor';
import { useSyncGenericContext } from '@/lib/hooks/use-sync-generic-context';

interface BuilderMainProps extends BaseProps {
  unlayerConfig: UnlayerOptions;
  templateId?: string;
}

const BuilderMain: React.FC<BuilderMainProps> = ({
  apiClient,
  navigate,
  shoppers,
  accountDetails,
  accounts,
  authProvider,
  templateId,
  unlayerConfig,
}) => {
  const {
    createTemplate,
    updateTemplate,
    assignTemplateToShoppers,
    getTemplateFields,
    loadTemplate,
  } = useBuilderMain({ apiClient });
  const { getDevices } = useTemplateListing({ apiClient });

  const { adminBuilderStep, templateState, actions } = useBuilderStore();
  const { actions: loadingActions } = useLoadingStore();

  // Sync generic context (account, auth, shoppers, navigate) into global store once
  useSyncGenericContext({
    accountDetails,
    authProvider,
    shoppers,
    navigate,
    accounts,
  });

  const handleConfigSubmit = async (data: TemplateConfig) => {
    loadingActions.setConfigSaving(true);
    try {
      if (templateId) {
        // Edit mode - just store config and proceed
        actions.setTemplateConfig(data);

        if (checkObjectDiff(templateState, data, true, ['device_type_id'])) {
          await updateTemplate(templateId, data);
          actions.setTemplateState((prevState: any) => ({
            ...prevState,
            name: data.name,
            description: data.description,
            device_ids: data.device_ids,
            status: data.status,
            shopper_ids: data.shopper_ids,
            account_ids: data.account_ids,
            is_generic: data.is_generic,
          }));
        }

        actions.setAdminBuilderStep(1);
      } else {
        // Create mode - create new template
        const deviceIds =
          data.device_ids && data.device_ids.length > 0
            ? data.device_ids
            : data.device_type_id
              ? [data.device_type_id]
              : [];

        if (deviceIds.length === 0) {
          message.error('Please select at least one device type');
          return;
        }

        const newTemplate = await createTemplate({
          name: data.name,
          description: data.description,
          device_ids: deviceIds,
          builder_state_json: {},
          canvas_type: 'single-row',
          is_generic: data.is_generic || false,
          account_ids: data.account_ids,
          device_type_id: data.device_type_id,
        });

        // MIGRATED: Update the template ID in Zustand store
        actions.setCurrentTemplateId(newTemplate.id);

        let shopperIds = data.is_generic
          ? shoppers.map((s) => s.id)
          : data.shopper_ids;

        await assignTemplateToShoppers(newTemplate.id, shopperIds);

        // Store config data for later use
        actions.setTemplateConfig(data);
        message.success('Template created successfully!');

        navigate(`/coupon-builder-v2/popup-builder/${newTemplate.id}/edit`);
      }
    } catch (error) {
      message.error('Failed to create template.');
      console.error('Config submit error:', error);
    } finally {
      loadingActions.setConfigSaving(false);
    }
  };

  useEffect(() => {
    getDevices();
    getTemplateFields();
  }, []);

  useEffect(() => {
    console.log('currentTemplateId', templateId, adminBuilderStep);
    if (!!templateId && adminBuilderStep === 0) {
      actions.setAdminBuilderStep(1);
    }
    if (templateId) {
      actions.setCurrentTemplateId(templateId);
      // Load template data including reminder tab config
      loadTemplate(templateId).catch(error => {
        console.error('Failed to load template:', error);
      });
    }
  }, [templateId]);

  return (
    <>
      <div className="mb-6">
        <Steps current={adminBuilderStep} style={{ margin: 0 }}>
          <Steps.Step title="Config" />
          <Steps.Step title="Builder" />
          <Steps.Step title="Reminder Tab" />
        </Steps>
      </div>

      {adminBuilderStep === 0 && (
        <ConfigStep
          handleFinalSave={handleConfigSubmit}
          isEditMode={!!templateId}
          templateEditState={templateState}
        />
      )}
      {adminBuilderStep === 1 && (
        <UnlayerMain
          unlayerConfig={unlayerConfig}
          apiClient={apiClient}
          enableCustomImageUpload={true}
        />
      )}
      {adminBuilderStep === 2 && (
        <ReminderTabStep
          onNext={() => {
            message.success('Reminder tab setup completed!');
            // Could navigate to a different page or show completion message
          }}
          onBack={() => actions.setAdminBuilderStep(1)}
          onSave={async (config) => {
            // Save reminder tab config to template
            console.log('Saving reminder tab config:', config);
            // TODO: Add API call to save config to template
          }}
          apiClient={apiClient}
        />
      )}
    </>
  );
};

export default BuilderMain;
