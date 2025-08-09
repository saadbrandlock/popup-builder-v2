import React, { useEffect } from 'react';
import { Card, Button, Alert, Spin } from 'antd';
import {
  FullscreenOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { PopupPreviewProps } from '../types';
import { usePopupPreview } from '../hooks';

/**
 * PopupPreview - Component for previewing popup templates
 * Shows how the popup will look and behave in different devices
 */
export const PopupPreview: React.FC<PopupPreviewProps> = ({
  template,
  device,
  className = '',
}) => {
  const {
    isGenerating,
    previewError,
    previewData,
    generatePreview,
    getDeviceDimensions,
    exportAsHtml,
    clearError,
  } = usePopupPreview();

  // Generate preview when template or device changes
  useEffect(() => {
    if (template) {
      generatePreview(template);
    }
  }, [template, device, generatePreview]);

  const deviceDimensions = getDeviceDimensions(device);

  const handleFullscreen = () => {
    if (previewData.html && previewData.css) {
      const previewWindow = window.open('', '_blank', 'width=800,height=600');
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Popup Preview - ${template.name}</title>
            <style>${previewData.css}</style>
          </head>
          <body>
            ${previewData.html}
            <script>
              // Add basic interactivity
              document.addEventListener('DOMContentLoaded', function() {
                // Close button functionality
                const closeBtn = document.querySelector('.popup-close');
                if (closeBtn) {
                  closeBtn.addEventListener('click', function() {
                    document.querySelector('.popup-overlay').style.display = 'none';
                  });
                }
                
                // Countdown timer functionality
                document.querySelectorAll('.countdown-timer').forEach(timer => {
                  const endTime = new Date(timer.dataset.endTime).getTime();
                  
                  const updateTimer = () => {
                    const now = new Date().getTime();
                    const distance = endTime - now;
                    
                    if (distance < 0) {
                      timer.innerHTML = "EXPIRED";
                      return;
                    }
                    
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    
                    timer.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
                  };
                  
                  updateTimer();
                  setInterval(updateTimer, 1000);
                });
              });
            </script>
          </body>
          </html>
        `);
        previewWindow.document.close();
      }
    }
  };

  if (previewError) {
    return (
      <Card className={`h-full flex flex-col ${className}`}>
        <Alert
          message="Preview Error"
          description={previewError}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={clearError}>
              Dismiss
            </Button>
          }
        />
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card className={`h-full flex flex-col ${className}`}>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <Spin size="large" />
          <p className="mt-4">Generating preview...</p>
        </div>
      </Card>
    );
  }

  if (!previewData.isReady) {
    return (
      <Card className={`h-full flex flex-col ${className}`}>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p>No preview available</p>
          <Button className="mt-4" onClick={() => generatePreview(template)}>
            Generate Preview
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`h-full flex flex-col ${className}`}
      title={
        <div className="flex items-center justify-between w-full">
          <span>
            Preview - {device.charAt(0).toUpperCase() + device.slice(1)}
          </span>
          <div className="flex gap-1">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => generatePreview(template)}
              title="Refresh preview"
            />
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={exportAsHtml}
              title="Export as HTML"
            />
            <Button
              size="small"
              icon={<FullscreenOutlined />}
              onClick={handleFullscreen}
              title="Open in new window"
            />
          </div>
        </div>
      }
      bodyStyle={{
        padding: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Device frame */}
        <div
          className={`relative bg-white rounded-lg shadow-2xl overflow-hidden origin-center transition-transform duration-300 ease-in-out border-2 border-gray-300`}
          style={{
            width: `${deviceDimensions.width}px`,
            height: `${deviceDimensions.height}px`,
          }}
        >
          {/* Preview iframe */}
          <iframe
            className="w-full h-full border-0"
            srcDoc={`
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Popup Preview</title>
                <style>
                  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                  ${previewData.css}
                </style>
              </head>
              <body>
                ${previewData.html}
                <script>
                  // Prevent actual navigation
                  document.addEventListener('click', function(e) {
                    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                      e.preventDefault();
                    }
                  });
                  
                  // Countdown timer functionality
                  document.querySelectorAll('.countdown-timer').forEach(timer => {
                    const endTime = new Date(timer.dataset.endTime || Date.now() + 3600000).getTime();
                    
                    const updateTimer = () => {
                      const now = new Date().getTime();
                      const distance = endTime - now;
                      
                      if (distance < 0) {
                        timer.innerHTML = "00:00:00";
                        return;
                      }
                      
                      const hours = Math.floor(distance / (1000 * 60 * 60));
                      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                      
                      timer.innerHTML = 
                        String(hours).padStart(2, '0') + ':' +
                        String(minutes).padStart(2, '0') + ':' +
                        String(seconds).padStart(2, '0');
                    };
                    
                    updateTimer();
                    setInterval(updateTimer, 1000);
                  });
                </script>
              </body>
              </html>
            `}
            title="Popup Preview"
          />
        </div>

        {/* Device info */}
        <div className="text-xs text-gray-500 mt-2">
          <span className="device-name">
            {device.charAt(0).toUpperCase() + device.slice(1)}
          </span>
          <span className="device-dimensions">
            {deviceDimensions.width} × {deviceDimensions.height}
          </span>
        </div>
      </div>
    </Card>
  );
};
