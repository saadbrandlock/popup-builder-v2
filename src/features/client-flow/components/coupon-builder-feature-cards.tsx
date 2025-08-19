import { Card, Col, Row } from 'antd';
import { GitBranch, MonitorSmartphone, PaintbrushVertical } from 'lucide-react';

const CouponBuilderFeatureCards = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card
          className="shadow-md h-full"
          styles={{
            body: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            },
          }}
        >
          <div className="flex gap-4 items-center">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <PaintbrushVertical />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Brand-Matched Design
              </div>
              <div className="text-sm text-gray-600">
                Automatically styled with your website's colors, fonts, and
                visual identity.
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card
          className="shadow-md h-full"
          styles={{
            body: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            },
          }}
        >
          <div className="flex gap-4 items-center">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <MonitorSmartphone />
            </div>
            <div>
              <div className="font-medium text-gray-900">Responsive Design</div>
              <div className="text-sm text-gray-600">
                Optimized for desktop, tablet, and mobile devices.
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card
          className="shadow-md h-full"
          styles={{
            body: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            },
          }}
        >
          <div className="flex gap-4 items-center">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <GitBranch />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Multi-Shopper Support
              </div>
              <div className="text-sm text-gray-600">
                Tailored messaging for different customer behaviors and needs.
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default CouponBuilderFeatureCards;
