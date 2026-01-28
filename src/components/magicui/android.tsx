import { SVGProps } from "react";

export interface AndroidProps extends SVGProps<SVGSVGElement> {
  url?: string;
  imageSrc?: string;
  videoSrc?: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
  fit?: 'cover' | 'contain';
  align?: 'top' | 'center' | 'bottom';
}

export default function Android({
  imageSrc,
  videoSrc,
  url,
  width = 433,
  height = 882,
  children,
  fit = 'cover',
  align = 'center',
  ...props
}: AndroidProps) {
  const alignMap = {
    top: 'xMidYMin',
    center: 'xMidYMid',
    bottom: 'xMidYMax',
  } as const;
  const preserve = `${alignMap[align]} ${fit === 'cover' ? 'slice' : 'meet'}`;
  
  // Use inline styles for SVG fills to ensure they work without Tailwind processing
  const frameColor = '#E5E5E5';
  const innerColor = '#FFFFFF';
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Side buttons */}
      <path
        d="M376 153H378C379.105 153 380 153.895 380 155V249C380 250.105 379.105 251 378 251H376V153Z"
        fill={frameColor}
      />
      <path
        d="M376 301H378C379.105 301 380 301.895 380 303V351C380 352.105 379.105 353 378 353H376V301Z"
        fill={frameColor}
      />
      {/* Outer frame */}
      <path
        d="M0 42C0 18.8041 18.804 0 42 0H336C359.196 0 378 18.804 378 42V788C378 811.196 359.196 830 336 830H42C18.804 830 0 811.196 0 788V42Z"
        fill={frameColor}
      />
      {/* Inner bezel */}
      <path
        d="M2 43C2 22.0132 19.0132 5 40 5H338C358.987 5 376 22.0132 376 43V787C376 807.987 358.987 825 338 825H40C19.0132 825 2 807.987 2 787V43Z"
        fill={innerColor}
      />

      {/* Screen area background */}
      <g clipPath="url(#clip0_514_20855)">
        <path
          d="M9.25 48C9.25 29.3604 24.3604 14.25 43 14.25H335C353.64 14.25 368.75 29.3604 368.75 48V780C368.75 798.64 353.64 813.75 335 813.75H43C24.3604 813.75 9.25 798.64 9.25 780V48Z"
          fill={frameColor}
          stroke={frameColor}
          strokeWidth="0.5"
        />
      </g>
      {/* Camera notch */}
      <circle
        cx="189"
        cy="28"
        r="9"
        fill={innerColor}
      />
      <circle
        cx="189"
        cy="28"
        r="4"
        fill={frameColor}
      />
      {imageSrc && (
        <>
          <image
            href={imageSrc}
            x="9"
            y="14"
            width="360"
            height="800"
            preserveAspectRatio={preserve}
            clipPath="url(#clip0_514_20855)"
            filter="url(#blur)"
          />
          {/* Black transparent overlay */}
          <rect
            x="9"
            y="14"
            width="360"
            height="800"
            fill="rgba(0, 0, 0, 0.3)"
            clipPath="url(#clip0_514_20855)"
          />
        </>
      )}
      {videoSrc && (
        <foreignObject
          x="9"
          y="14"
          width="360"
          height="800"
          clipPath="url(#clip0_514_20855)"
          preserveAspectRatio="xMidYMid slice"
        >
          <video
            className="size-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
        </foreignObject>
      )}
      {children && (
        <foreignObject x="9" y="14" width="360" height="800" clipPath="url(#clip0_514_20855)">
          <div className="w-full h-full">{children}</div>
        </foreignObject>
      )}
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <clipPath id="clip0_514_20855">
          <rect
            width="360"
            height="800"
            rx="33"
            ry="25"
            fill={innerColor}
            transform="translate(9 14)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
