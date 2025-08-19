import React from 'react';
import { Spin } from 'antd';
import type { WebsiteBackgroundProps } from '../types/clientFlow';

/**
 * WebsiteBackground - Renders client website background
 * Supports both dummy images and future API-driven content
 */
export const WebsiteBackground: React.FC<WebsiteBackgroundProps> = ({
  websiteData,
  viewport,
  loading = false,
  fallbackImage = '/dummy-assets/generic-website.jpg',
  className = '',
}) => {
  const isMobile = viewport === 'mobile';

  if (loading) {
    return (
      <div className={`flex items-center justify-center  ${className}`}>
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading website...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${websiteData.backgroundImage || fallbackImage})`,
        }}
      >
        {/* Overlay for better popup visibility */}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      </div>

      {/* Website Content Mockup */}
      <div className="relative z-10 h-full">
        {isMobile ? (
          <MobileWebsiteContent websiteData={websiteData} />
        ) : (
          <DesktopWebsiteContent websiteData={websiteData} />
        )}
      </div>
    </div>
  );
};

/**
 * Desktop website content mockup
 */
const DesktopWebsiteContent: React.FC<{ websiteData: any }> = ({
  websiteData,
}) => {
  return (
    <div className="h-full bg-white bg-opacity-95">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            {websiteData.logo && (
              <img
                src={websiteData.logo}
                alt={websiteData.companyName}
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback if logo fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <h1
              className="text-xl font-bold"
              style={{ color: websiteData.brandColors.primary }}
            >
              {websiteData.companyName}
            </h1>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-gray-900">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900">
              Products
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900">
              About
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to {websiteData.companyName}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {getIndustryDescription(websiteData.category)}
            </p>
            <button
              className="px-8 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: websiteData.brandColors.primary }}
            >
              Get Started
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md p-6">
                <div
                  className="w-full h-32 rounded-lg mb-4"
                  style={{ backgroundColor: websiteData.brandColors.secondary }}
                ></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Feature {item}
                </h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Mobile website content mockup
 */
const MobileWebsiteContent: React.FC<{ websiteData: any }> = ({
  websiteData,
}) => {
  return (
    <div className="h-full bg-white bg-opacity-95">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {websiteData.logo && (
              <img
                src={websiteData.logo}
                alt={websiteData.companyName}
                className="h-6 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <h1
              className="text-lg font-bold"
              style={{ color: websiteData.brandColors.primary }}
            >
              {websiteData.companyName}
            </h1>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="w-5 h-0.5 bg-gray-600"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
          </div>
        </div>
      </header>

      {/* Mobile Main Content */}
      <main className="px-4 py-6">
        {/* Mobile Hero */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to {websiteData.companyName}
          </h2>
          <p className="text-gray-600 mb-6">
            {getIndustryDescription(websiteData.category)}
          </p>
          <button
            className="w-full px-6 py-3 rounded-lg text-white font-semibold"
            style={{ backgroundColor: websiteData.brandColors.primary }}
          >
            Get Started
          </button>
        </div>

        {/* Mobile Content Stack */}
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md p-4">
              <div
                className="w-full h-24 rounded-lg mb-3"
                style={{ backgroundColor: websiteData.brandColors.secondary }}
              ></div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Feature {item}
              </h3>
              <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

/**
 * Get industry-specific description
 */
const getIndustryDescription = (category: string): string => {
  const descriptions = {
    'E-commerce': 'Discover amazing products and exclusive deals',
    SaaS: 'Powerful tools to boost your productivity',
    Blog: 'Latest insights and expert knowledge',
    Corporate: 'Professional solutions for your business',
    Other: 'Quality services tailored for you',
  };

  return (
    descriptions[category as keyof typeof descriptions] || descriptions.Other
  );
};
