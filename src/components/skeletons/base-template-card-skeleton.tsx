import React from 'react';
import { Card, Skeleton, Space } from 'antd';

const BaseTemplateCardSkeleton = () => {
  return (
    <Card
      actions={[
        <Skeleton.Button key="action1" active size="small" style={{ width: 24, height: 24 }} />,
        <Skeleton.Button key="action2" active size="small" style={{ width: 24, height: 24 }} />,
        <Skeleton.Button key="action3" active size="small" style={{ width: 24, height: 24 }} />,
      ]}
    >
      <Card.Meta
        title={<Skeleton.Input active style={{ width: '80%', height: 20 }} />}
        description={
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Skeleton
              paragraph={{ rows: 2, width: ['100%', '85%'] }}
              title={false}
              active
            />
            <Space size="small">
              <Skeleton.Button active size="small" style={{ width: 60, height: 22 }} />
              <Skeleton.Button active size="small" style={{ width: 80, height: 22 }} />
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

export default BaseTemplateCardSkeleton;
