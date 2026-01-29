import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  fallbackText?: string;
  fallbackIcon?: React.ReactNode;
  containerClassName?: string;  // For parent container when using fill
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText = 'No Image',
  fallbackIcon,
  width,
  height,
  fill,
  containerClassName = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate that we have either dimensions OR fill prop
  if (!fill && (!width || !height)) {
    console.warn('ImageWithFallback: Either provide width/height or use fill prop');
  }

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}
      >
        {fallbackIcon || (
          <svg
            className='w-12 h-12 mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
        )}
        <span className='text-sm font-medium'>{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gray-100 z-10`}
        >
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400'></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={props.sizes || (fill ? '100vw' : undefined)}
        className={`${className} ${isLoading ? 'invisible' : 'visible'}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
