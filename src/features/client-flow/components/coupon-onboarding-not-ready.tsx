import React from 'react';
import { Button } from 'antd';
import { ReloadOutlined, GiftOutlined, ThunderboltOutlined, StarOutlined } from '@ant-design/icons';

interface CouponOnboardingNotReadyProps {
  accountName?: string;
  domain?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export const CouponOnboardingNotReady: React.FC<CouponOnboardingNotReadyProps> = ({
  accountName = 'Your Business',
  domain = 'yourwebsite.com',
  onRefresh,
  loading = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 border border-slate-100">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />
      
      {/* Floating icons */}
      {/* <div className="absolute top-8 left-8 w-10 h-10 rounded-xl bg-white shadow-lg shadow-blue-100 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
        <GiftOutlined className="text-blue-500 text-lg" />
      </div>
      <div className="absolute top-16 right-12 w-8 h-8 rounded-lg bg-white shadow-lg shadow-amber-100 flex items-center justify-center animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
        <StarOutlined className="text-amber-500" />
      </div>
      <div className="absolute bottom-12 right-8 w-9 h-9 rounded-xl bg-white shadow-lg shadow-blue-100 flex items-center justify-center animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>
        <ThunderboltOutlined className="text-blue-500" />
      </div> */}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-16 px-6">
        {/* Illustration */}
        <div className="relative mb-8">
          {/* Main circle */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-1 shadow-xl shadow-violet-200">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <div className="relative">
                {/* Coupon icon */}
                <svg className="w-12 h-12 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
                {/* Sparkle */}
                <div className="absolute -top-1 -right-1 w-4 h-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-amber-400 animate-pulse">
                    <path d="M12 2L13.09 8.26L19 9.27L14.55 13.97L15.82 20L12 16.77L8.18 20L9.45 13.97L5 9.27L10.91 8.26L12 2Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-30" style={{ animationDuration: '2s' }} />
        </div>

        {/* Text content */}
        <div className="text-center max-w-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Crafting Your Perfect Popup
          </h3>
          
          <p className="text-gray-500 text-base mb-8 leading-relaxed">
            Our design team is creating a stunning coupon experience tailored for{' '}
            <span className="font-semibold text-blue-600">{accountName}</span>
          </p>

          {/* Timeline progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {/* Step 1 - Complete */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2 shadow-lg shadow-green-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-600">Analyzed</span>
            </div>
            
            {/* Connector */}
            <div className="w-12 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 mb-6" />
            
            {/* Step 2 - In Progress */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2 shadow-lg shadow-blue-200 animate-pulse">
                <svg className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600">Designing</span>
            </div>
            
            {/* Connector */}
            <div className="w-12 h-0.5 bg-gray-200 mb-6" />
            
            {/* Step 3 - Pending */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-400">Review</span>
            </div>
          </div>

          {/* ETA badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm text-gray-600">
              Usually ready in <span className="font-semibold text-gray-900">1-2 days</span>
            </span>
          </div>

          {/* Action button */}
          {onRefresh && (
            <div>
              <Button
                type="primary"
                icon={<ReloadOutlined spin={loading} />}
                onClick={onRefresh}
                loading={loading}
                size="large"
                className="rounded-xl h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all"
              >
                Check Status
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponOnboardingNotReady;
