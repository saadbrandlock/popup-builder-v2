import React from 'react';
import { Card, Col, Row, Skeleton, Button } from 'antd';

const ShopperDescriptionSkeleton = () => {
  return (
    <Card>
      <Row gutter={[16, 16]}>
        {/* Icon/Image skeleton */}
        <Col xs={24} md={8}>
          <Card
            styles={{
              body: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          >
            <Skeleton.Image style={{ width: 120, height: 120 }} />
          </Card>
        </Col>
        
        {/* Content skeleton */}
        <Col xs={24} md={16}>
          {/* Overview items skeleton */}
          {[1, 2, 3].map((item) => (
            <div key={item} className={item === 3 ? 'mb-0' : 'mb-4'}>
              <Skeleton.Input 
                style={{ width: '60%', height: 24, marginBottom: 8 }} 
                active 
              />
              <Skeleton 
                paragraph={{ 
                  rows: 2, 
                  width: ['100%', '85%'] 
                }} 
                title={false} 
                active 
              />
            </div>
          ))}
        </Col>
        
        {/* Action buttons skeleton */}
        <Col xs={24} className="text-end">
          <Button 
            type="primary" 
            size="large" 
            className="mr-4" 
            loading
          >
            Loading...
          </Button>
          <Button 
            size="large" 
            loading
          >
            Loading...
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default ShopperDescriptionSkeleton;