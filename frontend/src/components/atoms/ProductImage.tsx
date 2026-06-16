import React from 'react';
import { SvgIcon } from './svg-sprite-loader';

const CATEGORY_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  'Tuxedos':     { bg: 'linear-gradient(135deg,#1E3A5F 0%,#0F2340 100%)', color: '#D4AF37', icon: 'tuxedo' },
  'Suits':       { bg: 'linear-gradient(135deg,#2D3748 0%,#1A202C 100%)', color: '#A0AEC0', icon: 'shirt'  },
  'Shirts':      { bg: 'linear-gradient(135deg,#EBF8FF 0%,#BEE3F8 100%)', color: '#2B6CB0', icon: 'shirt'  },
  'Accessories': { bg: 'linear-gradient(135deg,#FFFBEB 0%,#FDE68A 100%)', color: '#92400E', icon: 'accessory' },
  'Shoes':       { bg: 'linear-gradient(135deg,#FFF5F0 0%,#FED7C3 100%)', color: '#7B341E', icon: 'shoe'   },
  'Services':    { bg: 'linear-gradient(135deg,#F5F3FF 0%,#DDD6FE 100%)', color: '#5B21B6', icon: 'scissors'},
  'Vests':       { bg: 'linear-gradient(135deg,#1E3A5F 0%,#2D4A6F 100%)', color: '#D4AF37', icon: 'tuxedo' },
  'Ties':        { bg: 'linear-gradient(135deg,#FFFBEB 0%,#FDE68A 100%)', color: '#92400E', icon: 'accessory' },
  'Pants':       { bg: 'linear-gradient(135deg,#2D3748 0%,#4A5568 100%)', color: '#CBD5E0', icon: 'shirt'  },
};

const DEFAULT_STYLE = { bg: 'linear-gradient(135deg,#E2E8F0 0%,#CBD5E0 100%)', color: '#4A5568', icon: 'inventory' };

interface ProductImageProps {
  imageUrl?: string;
  category?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  imageUrl, category = '', name = '', size = 'md', className = ''
}) => {
  const style = CATEGORY_STYLE[category] ?? DEFAULT_STYLE;
  const [imgError, setImgError] = React.useState(false);

  const dimensions = size === 'sm' ? 56 : size === 'lg' ? 200 : 80;
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 56 : 32;

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => { setImgError(true); }}
        style={{ width: dimensions, height: dimensions }}
        className={`object-cover rounded-[var(--radius-md)] ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: dimensions, height: dimensions, background: style.bg }}
      className={`flex items-center justify-center shrink-0 rounded-[var(--radius-md)] ${className}`}
    >
      <SvgIcon name={style.icon} width={iconSize} height={iconSize} style={{ color: style.color }} className="opacity-[0.85]" />
    </div>
  );
};
