import React, { useId } from 'react';

interface BrandMarkProps {
  className?: string;
  size?: number | string;
  reversed?: boolean;
}

/**
 * Geometric Brand Mark: The official interlocking Circle & Rounded Square
 * Symbolizing the student-to-student peer connection.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  className = 'w-9 h-8',
  reversed = false,
}) => {
  const clipId = useId().replace(/:/g, '');

  if (reversed) {
    return (
      <svg
        viewBox="0 0 92 80"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`mark-rev-${clipId}`}>
            <circle cx="28" cy="40" r="26" />
          </clipPath>
        </defs>
        <rect x="32" y="14" width="52" height="52" rx="16" fill="#9fd6c6" />
        <circle cx="28" cy="40" r="26" fill="#ffffff" />
        <rect
          x="32"
          y="14"
          width="52"
          height="52"
          rx="16"
          fill="#006751"
          clipPath={`url(#mark-rev-${clipId})`}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 92 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`mark-std-${clipId}`}>
          <circle cx="28" cy="40" r="26" />
        </clipPath>
      </defs>
      <rect x="32" y="14" width="52" height="52" rx="16" fill="#5fb09a" />
      <circle cx="28" cy="40" r="26" fill="#006751" />
      <rect
        x="32"
        y="14"
        width="52"
        height="52"
        rx="16"
        fill="#0c2a23"
        clipPath={`url(#mark-std-${clipId})`}
      />
    </svg>
  );
};

interface BrandAppIconProps {
  className?: string;
  size?: number | string;
  variant?: 'rounded' | 'square';
}

/**
 * Official App Icon: 512x512 LAU Emerald Container with Centered Mark
 */
export const BrandAppIcon: React.FC<BrandAppIconProps> = ({
  className = 'w-10 h-10',
  variant = 'rounded',
}) => {
  return (
    <img
      src={
        variant === 'rounded'
          ? '/assets/aistudio/studentlink-app-icon-rounded_c1a88ccc.png'
          : '/assets/aistudio/studentlink-app-icon_98ad1134.svg'
      }
      alt="LAU StudentLink App Icon"
      className={`${className} object-contain shrink-0`}
      loading="eager"
    />
  );
};

interface BrandLockupProps {
  className?: string;
  markClassName?: string;
  reversed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
}

/**
 * Official Brand Lockup: Mark + "LAU" (letterspaced) + "StudentLink" (Nunito 900)
 */
export const BrandLockup: React.FC<BrandLockupProps> = ({
  className = '',
  markClassName,
  reversed = false,
  size = 'md',
  showSubtitle = true,
  subtitleText = 'Beirut & Byblos Campuses',
}) => {
  const markSizeClass =
    markClassName ||
    (size === 'sm' ? 'w-8 h-7' : size === 'lg' ? 'w-14 h-12' : 'w-10 h-9');

  const lauTextClass =
    size === 'sm'
      ? 'text-[10px] tracking-[0.38em]'
      : size === 'lg'
      ? 'text-xs tracking-[0.38em]'
      : 'text-[11px] tracking-[0.38em]';

  const titleClass =
    size === 'sm'
      ? 'text-lg font-black tracking-tight leading-none'
      : size === 'lg'
      ? 'text-2xl sm:text-3xl font-black tracking-tight leading-none'
      : 'text-xl font-black tracking-tight leading-none';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Crisp Vector Mark */}
      <BrandMark className={`${markSizeClass} shrink-0 transition-transform group-hover:scale-105`} reversed={reversed} />

      {/* Official Typography */}
      <div className="flex flex-col text-left">
        <span
          className={`font-black uppercase font-nunito leading-tight ${lauTextClass} ${
            reversed ? 'text-[#9fd6c6]' : 'text-[#006751]'
          }`}
          style={{ letterSpacing: '0.38em' }}
        >
          LAU
        </span>
        <span
          className={`font-black font-nunito ${titleClass} ${
            reversed ? 'text-white' : 'text-[#0c2a23]'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          StudentLink
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] font-normal leading-tight mt-0.5 ${
              reversed ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
