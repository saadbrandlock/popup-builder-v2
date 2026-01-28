import React, { useEffect, useState } from 'react';
import { useClientFlow } from '../hooks/use-client-flow';
import { useGenericStore } from '@/stores/generic.store';
import { AxiosInstance } from 'axios';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useLoadingStore } from '@/stores/common/loading.store';
import { Card, Typography, Button, Modal, Carousel, Image, Divider, Tabs, Tooltip, Collapse } from 'antd';
import { ShopperDetails as TShopperDetails } from '@/types';
import { shopperDetailsDummyData } from '../utils/shopper-details-dummy-data';
import { ShopperDescriptionSkeleton } from '@/components/skeletons';
import { Users, AlertCircle, CheckCircle, Eye, FileText, Activity, Lightbulb } from 'lucide-react';

const { Text, Title, Paragraph } = Typography;

interface ShopperDetailsProps {
  apiClient: AxiosInstance;
  compact?: boolean;
  displayMode?: 'compact' | 'full' | 'legacy';
}

const ShopperDetails: React.FC<ShopperDetailsProps> = ({ apiClient, compact = false, displayMode }) => {
  const { getShopperDetails } = useClientFlow({ apiClient });

  const { activeContentShopper, shopperDetails } = useClientFlowStore();
  const { shopperDetailsLoading } = useLoadingStore();

  const [shopperDetailsData, setShopperDetailsData] =
    useState<TShopperDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState('overview');

  useEffect(() => {
    if (shopperDetails) {
      setShopperDetailsData(shopperDetails);
    } else {
      setShopperDetailsData(shopperDetailsDummyData.data[0]);
    }
  }, [shopperDetails]);

  if (shopperDetailsLoading) {
    return (
      <Card>
        <ShopperDescriptionSkeleton />
      </Card>
    );
  }

  // Determine which mode to use
  const mode = displayMode || (compact ? 'compact' : 'legacy');

  if (mode === 'full') {
    // Full content card version for CopyReview - Collapsible
    return (
      <>
        <Collapse
          defaultActiveKey={['1']}
          items={[
            {
              key: '1',
              label: (
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  <span style={{ fontSize: '16px', fontWeight: 500 }}>
                    {activeContentShopper?.content?.name || 'Shopper Group'}
                  </span>
                </div>
              ),
              children: (
                <div>
                  {shopperDetailsData?.ui_template.props.data.overview.map((item, idx) => (
                    <div key={item.header} className="mb-4">
                      <div className="flex items-start gap-2">
                        {idx === 0 && <Users size={18} className="text-blue-500 mt-1" />}
                        {idx === 1 && <AlertCircle size={18} className="text-orange-500 mt-1" />}
                        {idx === 2 && <CheckCircle size={18} className="text-green-500 mt-1" />}
                        <Title level={5} className="mb-0">{item.header}</Title>
                      </div>
                      <Paragraph className="!text-justify ml-7" style={{ fontSize: '14px' }}>
                        {item.description}
                      </Paragraph>
                    </div>
                  ))}

                  <Divider />

                  {/* Action buttons at bottom */}
                  <div className="flex justify-between items-center">
                      <Button
                        type="text"
                        size="large"
                        className='w-full !rounded-none'
                        icon={<Activity size={14} />}
                        onClick={() => {
                          setModalActiveTab('behavior');
                          setIsModalVisible(true);
                        }}
                      >Behavior</Button>
                      <Button
                        type="text"
                        size="large"
                        className='w-full !rounded-none'
                        icon={<Lightbulb size={14} />}
                        onClick={() => {
                          setModalActiveTab('solution');
                          setIsModalVisible(true);
                        }}
                      >Solution</Button>
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* Enhanced Modal with Tabs */}
        <Modal
          title={`${activeContentShopper?.content?.name || 'Shopper'} Details`}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={900}
          centered
        >
          <Tabs
            activeKey={modalActiveTab}
            onChange={setModalActiveTab}
            items={[
              {
                key: 'behavior',
                label: shopperDetailsData?.ui_template.props.primaryBtnText || 'Behavior',
                children: (
                  <div className="p-4">
                    {shopperDetailsData?.ui_template.props.data.problemSS &&
                      shopperDetailsData.ui_template.props.data.problemSS.length > 0 ? (
                      <Carousel
                        arrows={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                        dots={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                        autoplay={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                      >
                        {shopperDetailsData.ui_template.props.data.problemSS.map(
                          (screenshot, index) => (
                            <div key={index} className="text-center">
                              <Image
                                src={screenshot.url}
                                alt={screenshot.title || `Problem Screenshot ${index + 1}`}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '500px',
                                  objectFit: 'contain',
                                }}
                                preview={false}
                              />
                              {screenshot.title && (
                                <Text className="block mt-2 text-gray-600">
                                  {screenshot.title}
                                </Text>
                              )}
                            </div>
                          )
                        )}
                      </Carousel>
                    ) : (
                      <div className="text-center py-8">
                        <Text type="secondary">No screenshots available for shopper behavior</Text>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'solution',
                label: shopperDetailsData?.ui_template.props.outlinedBtnText || 'Solutions',
                children: (
                  <div className="p-4">
                    {shopperDetailsData?.ui_template.props.data.solutionSS &&
                      shopperDetailsData.ui_template.props.data.solutionSS.length > 0 ? (
                      <Carousel
                        arrows={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                        dots={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                        autoplay={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                      >
                        {shopperDetailsData.ui_template.props.data.solutionSS.map(
                          (screenshot, index) => (
                            <div key={index} className="text-center">
                              <Image
                                src={screenshot.url}
                                alt={screenshot.title || `Solution Screenshot ${index + 1}`}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '500px',
                                  objectFit: 'contain',
                                }}
                                preview={false}
                              />
                              {screenshot.title && (
                                <Text className="block mt-2 text-gray-600">
                                  {screenshot.title}
                                </Text>
                              )}
                            </div>
                          )
                        )}
                      </Carousel>
                    ) : (
                      <div className="text-center py-8">
                        <Text type="secondary">No screenshots available for solution</Text>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Modal>
      </>
    );
  }

  if (mode === 'compact') {
    // Compact sidebar version
    return (
      <>
        <Card
          title={
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              <span style={{ fontSize: '14px' }}>Shopper Info</span>
            </div>
          }
          styles={{ body: { padding: '12px' } }}
          actions={[
            <Tooltip title="View Full Details" key="view-details">
              <Button
                type="text"
                size="small"
                icon={<Eye size={14} />}
                onClick={() => {
                  setModalActiveTab('overview');
                  setIsModalVisible(true);
                }}
              />
            </Tooltip>,
            <Tooltip title={shopperDetailsData?.ui_template.props.primaryBtnText || 'Shopper Behavior'} key="behavior">
              <Button
                type="text"
                size="small"
                icon={<Activity size={14} />}
                onClick={() => {
                  setModalActiveTab('behavior');
                  setIsModalVisible(true);
                }}
              />
            </Tooltip>,
            <Tooltip title={shopperDetailsData?.ui_template.props.outlinedBtnText || 'View Solutions'} key="solutions">
              <Button
                type="text"
                size="small"
                icon={<Lightbulb size={14} />}
                onClick={() => {
                  setModalActiveTab('solution');
                  setIsModalVisible(true);
                }}
              />
            </Tooltip>
          ]}
        >

          {/* Compact sections */}
          {shopperDetailsData?.ui_template.props.data.overview.map((item, idx) => (
            <div key={item.header} className="mb-3">
              <div className="flex items-start gap-2 mb-1">
                {idx === 0 && <Users size={14} className="text-blue-500 mt-0.5" />}
                {idx === 1 && <AlertCircle size={14} className="text-orange-500 mt-0.5" />}
                {idx === 2 && <CheckCircle size={14} className="text-green-500 mt-0.5" />}
                <Text strong style={{ fontSize: '13px' }}>
                  {item.header}
                </Text>
              </div>
              <Paragraph
                ellipsis={{ rows: 2, expandable: false }}
                style={{ fontSize: '12px', marginBottom: 0, color: '#666' }}
              >
                {item.description}
              </Paragraph>
            </div>
          ))}
        </Card>

        {/* Enhanced Modal with Tabs */}
        <Modal
          title={`${activeContentShopper?.content?.name || 'Shopper'} Details`}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={900}
          centered
        >
          <Tabs
            activeKey={modalActiveTab}
            onChange={setModalActiveTab}
            items={[
              {
                key: 'overview',
                label: 'Overview',
                children: (
                  <div className="p-4">
                    {shopperDetailsData?.ui_template.props.data.overview.map((item) => (
                      <div key={item.header} className="mb-4">
                        <Title level={5}>{item.header}</Title>
                        <Text>{item.description}</Text>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: 'behavior',
                label: shopperDetailsData?.ui_template.props.primaryBtnText || 'Behavior',
                children: (
                  <div className="p-4">
                    {shopperDetailsData?.ui_template.props.data.problemSS &&
                      shopperDetailsData.ui_template.props.data.problemSS.length > 0 ? (
                      <Carousel
                        arrows={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                        dots={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                        autoplay={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                      >
                        {shopperDetailsData.ui_template.props.data.problemSS.map(
                          (screenshot, index) => (
                            <div key={index} className="text-center">
                              <Image
                                src={screenshot.url}
                                alt={screenshot.title || `Problem Screenshot ${index + 1}`}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '500px',
                                  objectFit: 'contain',
                                }}
                                preview={false}
                              />
                              {screenshot.title && (
                                <Text className="block mt-2 text-gray-600">
                                  {screenshot.title}
                                </Text>
                              )}
                            </div>
                          )
                        )}
                      </Carousel>
                    ) : (
                      <div className="text-center py-8">
                        <Text type="secondary">No screenshots available for shopper behavior</Text>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'solution',
                label: shopperDetailsData?.ui_template.props.outlinedBtnText || 'Solutions',
                children: (
                  <div className="p-4">
                    {shopperDetailsData?.ui_template.props.data.solutionSS &&
                      shopperDetailsData.ui_template.props.data.solutionSS.length > 0 ? (
                      <Carousel
                        arrows={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                        dots={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                        autoplay={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                      >
                        {shopperDetailsData.ui_template.props.data.solutionSS.map(
                          (screenshot, index) => (
                            <div key={index} className="text-center">
                              <Image
                                src={screenshot.url}
                                alt={screenshot.title || `Solution Screenshot ${index + 1}`}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '500px',
                                  objectFit: 'contain',
                                }}
                                preview={false}
                              />
                              {screenshot.title && (
                                <Text className="block mt-2 text-gray-600">
                                  {screenshot.title}
                                </Text>
                              )}
                            </div>
                          )
                        )}
                      </Carousel>
                    ) : (
                      <div className="text-center py-8">
                        <Text type="secondary">No screenshots available for solution</Text>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Modal>
      </>
    );
  }

  // Legacy full-width version (fallback)
  return (
    <>
      <Card>
        {shopperDetailsData?.ui_template.props.data.overview.map((item, idx) => (
          <div
            key={item.header}
            className={
              idx === shopperDetailsData?.ui_template.props.data.overview.length - 1
                ? 'mb-0'
                : 'mb-4'
            }
          >
            <Title level={4}>{item.header}</Title>
            <Text className="!text-justify">{item.description}</Text>
          </div>
        ))}
        <div className="text-end mt-4">
          <Button
            type="primary"
            size="large"
            className="mr-4"
            onClick={() => {
              setModalActiveTab('behavior');
              setIsModalVisible(true);
            }}
          >
            {shopperDetailsData?.ui_template.props.primaryBtnText ||
              `${activeContentShopper?.content?.name || 'Shopper'} Behavior`}
          </Button>
          <Button
            size="large"
            onClick={() => {
              setModalActiveTab('solution');
              setIsModalVisible(true);
            }}
          >
            {shopperDetailsData?.ui_template.props.outlinedBtnText || 'Solutions'}
          </Button>
        </div>
      </Card>

      {/* Modal for legacy mode */}
      <Modal
        title={`${activeContentShopper?.content?.name || 'Shopper'} Details`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        centered
      >
        <Tabs
          activeKey={modalActiveTab}
          onChange={setModalActiveTab}
          items={[

            {
              key: 'behavior',
              label: shopperDetailsData?.ui_template.props.primaryBtnText || 'Behavior',
              children: (
                <div className="p-4">
                  {shopperDetailsData?.ui_template.props.data.problemSS &&
                    shopperDetailsData.ui_template.props.data.problemSS.length > 0 ? (
                    <Carousel
                      arrows={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                      dots={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                      autoplay={shopperDetailsData.ui_template.props.data.problemSS.length > 1}
                    >
                      {shopperDetailsData.ui_template.props.data.problemSS.map(
                        (screenshot, index) => (
                          <div key={index} className="text-center">
                            <Image
                              src={screenshot.url}
                              alt={screenshot.title || `Problem Screenshot ${index + 1}`}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '500px',
                                objectFit: 'contain',
                              }}
                              preview={false}
                            />
                            {screenshot.title && (
                              <Text className="block mt-2 text-gray-600">
                                {screenshot.title}
                              </Text>
                            )}
                          </div>
                        )
                      )}
                    </Carousel>
                  ) : (
                    <div className="text-center py-8">
                      <Text type="secondary">No screenshots available for shopper behavior</Text>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'solution',
              label: shopperDetailsData?.ui_template.props.outlinedBtnText || 'Solutions',
              children: (
                <div className="p-4">
                  {shopperDetailsData?.ui_template.props.data.solutionSS &&
                    shopperDetailsData.ui_template.props.data.solutionSS.length > 0 ? (
                    <Carousel
                      arrows={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                      dots={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                      autoplay={shopperDetailsData.ui_template.props.data.solutionSS.length > 1}
                    >
                      {shopperDetailsData.ui_template.props.data.solutionSS.map(
                        (screenshot, index) => (
                          <div key={index} className="text-center">
                            <Image
                              src={screenshot.url}
                              alt={screenshot.title || `Solution Screenshot ${index + 1}`}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '500px',
                                objectFit: 'contain',
                              }}
                              preview={false}
                            />
                            {screenshot.title && (
                              <Text className="block mt-2 text-gray-600">
                                {screenshot.title}
                              </Text>
                            )}
                          </div>
                        )
                      )}
                    </Carousel>
                  ) : (
                    <div className="text-center py-8">
                      <Text type="secondary">No screenshots available for solution</Text>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default ShopperDetails;
