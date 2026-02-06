import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Alert, Typography, Radio, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Clock, FileCheck } from 'lucide-react';
import { BrowserPreview, BrowserPreviewSkeleton } from '../../../components/common';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useGenericStore } from '@/stores/generic.store';
import { ClientFlowData } from '@/types';

const { Text } = Typography;

/**
 * ReviewScreen - Step 4 - Final review screen
 * Shows review status and preview with consistent layout patterns
 */
interface ReviewScreenProps {}

export const ReviewScreen: React.FC<ReviewScreenProps> = () => {
  const { accountDetails } = useGenericStore();
  const { clientData, actions } = useClientFlowStore();
  
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [template, setTemplate] = useState<ClientFlowData | null>(null);

  const getPreviewTemplate = () => {
    if (clientData && clientData.length) {
      return clientData.filter(
        (template) =>
          template.devices.find((device) => device.device_type === selectedDevice) &&
          template.staging_status === 'client-review'
      );
    } else {
      return [];
    }
  };

  // Mock data for review status
  const reviewData = {
    status: 'submitted',
    submittedOn: 'Dec 15, 2024',
    templateType: 'Coupon Module',
    changesMade: '3 sections',
    estimatedTime: '24-48 hours during business days'
  };

  useEffect(() => {
    if (clientData && clientData.length) {
      const _template = getPreviewTemplate()[0];
      setTemplate(_template);
      actions.setSelectedTemplate(_template);
    }
  }, [clientData, selectedDevice]);

  return (
    <Card
      styles={{
        header: {
          backgroundColor: '#EFF6FF',
        },
      }}
      title={
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl flex items-center gap-2">
              <FileCheck className="text-blue-500" />
              <span>Review Pending from Admin</span>
            </h1>
            <p className="font-medium text-gray-500">
              Your popup customization is under review. Preview how it will look once approved.
            </p>
          </div>
          <div>
            <Tag
              color="volcano"
              className="inline-flex items-center gap-1 text-base"
            >
              <Clock size={16} /> Pending Review
            </Tag>
          </div>
        </div>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          {/* Review Status */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <ClockCircleOutlined className="text-white text-sm" />
              </div>
              <Text strong className="text-gray-800 text-base">Template Review Progress</Text>
            </div>
            
            <div className="space-y-3">
              {/* Submitted - Completed */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircleOutlined className="text-white text-xs" />
                </div>
                <Text className="text-green-700 font-medium text-sm">Submitted</Text>
              </div>
              
              {/* Under Review - In Progress */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <ClockCircleOutlined className="text-white text-xs" />
                </div>
                <Text className="text-orange-700 font-medium text-sm">Under Review</Text>
              </div>
              
              {/* Approved - Pending */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <CheckCircleOutlined className="text-gray-400 text-xs" />
                </div>
                <Text className="text-gray-500 font-medium text-sm">Approved</Text>
              </div>
            </div>

            {/* Estimated Time Card */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <Clock size={12} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <Text strong className="text-blue-700 text-sm block mb-1">Estimated Review Time</Text>
                  <Text className="text-blue-600 text-xs leading-relaxed">{reviewData.estimatedTime}</Text>
                </div>
              </div>
            </div>
          </div>

          {/* Submitted Details */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileTextOutlined className="text-blue-500" />
              <Text strong>Submitted Details</Text>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <Text type="secondary">Submitted On:</Text>
                <Text strong>{reviewData.submittedOn}</Text>
              </div>
              
              <div className="flex justify-between">
                <Text type="secondary">Template Type:</Text>
                <Text strong>{reviewData.templateType}</Text>
              </div>
              
              <div className="flex justify-between">
                <Text type="secondary">Changes Made:</Text>
                <Text strong>{reviewData.changesMade}</Text>
              </div>
            </div>
          </div>
        </Col>
        
        <Col xs={24} md={18}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Live Preview</h3>
              <Text type="secondary">Preview how your template will look once approved</Text>
            </div>
            
            <Radio.Group 
              value={selectedDevice} 
              onChange={(e) => setSelectedDevice(e.target.value)}
              size="small"
            >
              <Radio.Button value="desktop">
                <Space>
                  <span>🖥️</span>
                  Desktop
                </Space>
              </Radio.Button>
              <Radio.Button value="mobile">
                <Space>
                  <span>📱</span>
                  Mobile
                </Space>
              </Radio.Button>
            </Radio.Group>
          </div>

          <div className="w-full">
            {accountDetails ? (
              <BrowserPreview
                className="shadow-md"
                viewport={selectedDevice}
                websiteBackground={{
                  backgroundImage: {
                    desktop: 'https://debuficgraftb.cloudfront.net/dev-staging/KP_1739628284.604344.png',
                    mobile: 'https://i.ibb.co/dwfFJCCk/Screenshot-2025-08-13-180522.png',
                  },
                  websiteUrl: accountDetails.domain,
                  companyName: accountDetails.name,
                  category: accountDetails.category,
                  clientId: accountDetails.id.toString(),
                  id: accountDetails.id.toString(),
                }}
                popupTemplate={[template]}
                showBrowserChrome={true}
                interactive={false}
                scale={0.9}
                onPopupInteraction={(action) => {
                }}
              />
            ) : (
              <BrowserPreviewSkeleton viewport={selectedDevice} />
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};