import { message } from 'antd';
import { createAPI } from '@/api';
import { useTemplateListingStore } from '@/stores/list/templateListing.store';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useGenericStore } from '@/stores/generic.store';
import { AxiosInstance } from 'axios';
import { CleanTemplateResponse, TemplateAction, TCBTemplate } from '@/types';
import { convertMultipleUnlayerDesignsToHtml, validateUnlayerDesign, type BatchConversionItem } from '@/lib/utils/batchUnlayerConverter';

export const useTemplateListing = ({
  apiClient,
}: {
  apiClient: AxiosInstance;
}) => {
  const { navigate } = useGenericStore();

  const api = createAPI(apiClient);

  const { devices, actions: deviceActions } = useDevicesStore();
  const { actions: loadingActions } = useLoadingStore();
  const { actions } = useTemplateListingStore();

  const handleAction = async (
    action: TemplateAction,
    template: CleanTemplateResponse
  ) => {
    console.log(`Handling action ${action} for template ${template.id}`);
    try {
      switch (action) {
        case 'edit':
          console.log(`Navigating to edit template ${template.id}`, navigate);
          navigate(`/coupon-builder-v2/popup-builder/${template.id}/edit`);
          break;
        case 'preview':
          navigate(`/coupon-builder-v2/popup-builder/${template.id}/preview`);
          break;
        // case 'publish':
        //   await publishTemplate(template.id);
        //   getTemplates();
        //   break;
        case 'client-review':
          await pushTemplateToClientReview(template);
          message.success('Template pushed to client review successfully');
          getTemplates();
          break;
        case 'archive':
          await api.templates.archiveTemplate(template.id);
          message.success('Template archived successfully');
          getTemplates();
          break;
        case 'unarchive':
          await api.templates.unarchiveTemplate(template.id);
          message.success('Template unarchived successfully');
          getTemplates();
          break;
        case 'delete':
          await api.templates.deleteTemplate(template.id);
          message.success('Template deleted successfully');
          getTemplates();
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      message.error(`Failed to ${action} template`);
    }
  };

  const getTemplates = async () => {
    loadingActions.setTemplateListingLoading(true);
    try {
      const response = await api.templates.getTemplatesForUI();
      actions.setTemplates(response.templates);
      actions.setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('Failed to load templates');
    } finally {
      loadingActions.setTemplateListingLoading(false);
    }
  };

  const pushTemplateToClientReview = async (
    template: CleanTemplateResponse
  ) => {
    loadingActions.setTemplateListActionLoading(true);
    try {
      // Prepare batch conversion items
      const conversionItems: BatchConversionItem[] = [];
      
      // Helper function to prepare template for batch conversion
      const prepareTemplateForConversion = (templateData: any, templateId: string) => {
        if (!templateData.builder_state_json) return null;
        
        // Parse JSON if it's a string
        let designData = templateData.builder_state_json;
        if (typeof designData === 'string') {
          try {
            designData = JSON.parse(designData);
          } catch (parseError) {
            console.warn(`⚠️ Failed to parse builder_state_json for template ${templateId}:`, parseError);
            return null;
          }
        }

        // Validate design data
        if (designData && validateUnlayerDesign(designData)) {
          return {
            id: templateId,
            designJson: designData
          };
        } else {
          console.warn(`⚠️ Invalid or missing Unlayer design data for template ${templateId}`);
          return null;
        }
      };

      // Add parent template to batch
      const parentItem = prepareTemplateForConversion(template, template.id);
      if (parentItem) {
        conversionItems.push(parentItem);
      }

      // Add child templates to batch
      if (template.child_templates && template.child_templates.length > 0) {
        for (const childTemplate of template.child_templates) {
          const childItem = prepareTemplateForConversion(childTemplate, childTemplate.id);
          if (childItem) {
            conversionItems.push(childItem);
          }
        }
      }

      if (conversionItems.length === 0) {
        message.error(
          'No valid templates found for conversion. Please ensure templates have valid design data.'
        );
        return;
      }

      // Batch convert all templates using single editor instance
      console.log(`🔄 Starting batch conversion of ${conversionItems.length} templates...`);
      const conversionResults = await convertMultipleUnlayerDesignsToHtml(conversionItems, {
        projectId: 123,
        timeout: 30000, // 30 second total timeout
        delayBetweenConversions: 1500 // 1.5 second delay between conversions
      });

      // Prepare templates data for API
      const templatesData = conversionResults
        .filter(result => result.html && !result.error)
        .map(result => ({
          template_id: result.id,
          html_content: result.html!
        }));

      // Log any conversion failures
      const failedConversions = conversionResults.filter(result => result.error);
      if (failedConversions.length > 0) {
        console.warn('⚠️ Some templates failed to convert:', failedConversions);
      }

      // Push to client review with templates array
      if (templatesData.length > 0) {
        await api.templates.pushTemplateToClientReview(templatesData);
        
        const childCount = templatesData.length - 1;
        const failedCount = conversionResults.length - templatesData.length;
        
        let successMessage = childCount > 0 
          ? `Template and ${childCount} child template(s) published successfully`
          : 'Template published successfully';
          
        if (failedCount > 0) {
          successMessage += ` (${failedCount} template(s) failed conversion)`;
        }
        
        message.success(successMessage);
      } else {
        message.error(
          'Pushing template to client review failed. No templates could be converted to HTML. Please try again later!'
        );
      }
    } catch (error) {
      console.error('❌ Error publishing template:', error);
      message.error('Failed to publish template');
    } finally {
      loadingActions.setTemplateListActionLoading(false);
    }
  };

  // const publishTemplate = async (templateId: string) => {
  //   loadingActions.setTemplateListActionLoading(true);
  //   try {
  //     // Get template data to access builder_state_json
  //     console.log(`🚀 Publishing template ${templateId}...`);
  //     const template = await api.templates.getTemplateById(templateId);

  //     let htmlContent: string | undefined;

  //     // Check if template has design data for HTML conversion
  //     if (template.builder_state_json) {
  //       console.log('📄 Template has design data, converting to HTML...');

  //       // Parse JSON if it's a string
  //       let designData = template.builder_state_json;
  //       if (typeof designData === 'string') {
  //         try {
  //           designData = JSON.parse(designData);
  //         } catch (parseError) {
  //           console.warn('⚠️ Failed to parse builder_state_json:', parseError);
  //           // Continue without HTML conversion
  //         }
  //       }

  //       // Validate and convert design to HTML
  //       if (designData && validateUnlayerDesign(designData)) {
  //         try {
  //           console.log('🔄 Converting Unlayer design to HTML...');
  //           htmlContent = await convertUnlayerJsonToHtml(designData, {
  //             projectId: 123, // Default project ID
  //             timeout: 15000, // 15 second timeout
  //           });
  //           console.log('✅ HTML conversion successful');
  //         } catch (conversionError) {
  //           console.warn('⚠️ HTML conversion failed:', conversionError);
  //           message.warning(
  //             'HTML conversion failed, publishing without HTML content'
  //           );
  //           // Continue with publish without HTML
  //         }
  //       } else {
  //         console.warn('⚠️ Invalid or missing Unlayer design data');
  //       }
  //     } else {
  //       console.log(
  //         '📝 Template has no design data, publishing without HTML conversion'
  //       );
  //     }

  //     // Publish template with or without HTML content
  //     await api.templates.publishTemplate(templateId, htmlContent);
  //     message.success('Template published successfully');
  //   } catch (error) {
  //     console.error('❌ Error publishing template:', error);
  //     message.error('Failed to publish template');
  //   } finally {
  //     loadingActions.setTemplateListActionLoading(false);
  //   }
  // };

  const getDevices = async () => {
    if (devices.length > 0) return;

    loadingActions.setDevicesLoading(true);
    try {
      const response = await api.devices.getDevices();
      deviceActions.setDevices(response);
    } catch (error) {
      console.error('Error loading devices:', error);
      message.error('Failed to load devices');
    } finally {
      loadingActions.setDevicesLoading(false);
    }
  };

  return { handleAction, getTemplates, getDevices };
};
