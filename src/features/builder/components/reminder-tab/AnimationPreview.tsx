import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

// CSS animations for preview
const animationStyles = `
  @keyframes slideInDemo {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeInDemo {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes bounceInDemo {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes zoomInDemo {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

interface AnimationPreviewProps {
  type: string;
  duration: string;
  onPlay: () => void;
  isPlaying: boolean;
}

const AnimationPreview: React.FC<AnimationPreviewProps> = ({ 
  type, 
  duration, 
  onPlay, 
  isPlaying 
}) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isPlaying]);

  const getAnimationStyle = (animationType: string) => {
    const baseStyle = {
      width: '60px',
      height: '40px',
      backgroundColor: '#1890ff',
      borderRadius: '4px',
      margin: '10px auto',
      transition: `all ${duration} ease-in-out`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '10px',
      fontWeight: 'bold'
    };

    if (!isPlaying) return baseStyle;

    const animations = {
      slideIn: {
        ...baseStyle,
        animation: `slideInDemo ${duration} ease-in-out forwards`,
      },
      fadeIn: {
        ...baseStyle,
        animation: `fadeInDemo ${duration} ease-in-out forwards`,
      },
      bounceIn: {
        ...baseStyle,
        animation: `bounceInDemo ${duration} ease-in-out forwards`,
      },
      zoomIn: {
        ...baseStyle,
        animation: `zoomInDemo ${duration} ease-in-out forwards`,
      },
      none: baseStyle
    };

    return animations[animationType as keyof typeof animations] || baseStyle;
  };

  return (
    <>
      {/* Inject animation styles */}
      <style>{animationStyles}</style>
      
      <div className="text-center">
        <div 
          key={animationKey}
          style={getAnimationStyle(type)}
        >
          POPUP
        </div>
        <Button 
          type="link" 
          size="small" 
          icon={<PlayCircleOutlined />}
          onClick={onPlay}
          disabled={isPlaying}
        >
          {isPlaying ? 'Playing...' : 'Preview'}
        </Button>
      </div>
    </>
  );
};

export default AnimationPreview;