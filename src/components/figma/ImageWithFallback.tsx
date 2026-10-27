import React, { useCallback, useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <FallbackImage key={`${props.src ?? ''}|${props.srcSet ?? ''}`} {...props} />;
}

const FallbackImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const [didError, setDidError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { src, alt, style, className, loading = 'lazy', decoding = 'async', fetchPriority, onLoad, onError, ...rest } = props;

  const handleImageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  return didError ? (
    <div
      className={`inline-block bg-slate-800 text-center align-middle flex items-center justify-center ${className ?? ''}`}
      style={style}
    >
      <img src={ERROR_IMG_SRC} alt="Error loading image" className="w-1/2 h-1/2 opacity-50" data-original-url={src} />
    </div>
  ) : (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      {/* 로딩 중 스켈레톤 (부드러운 맥박 효과) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse" />
      )}
      <img
        {...rest}
        {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
        ref={handleImageRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className="w-full h-full object-cover"
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setDidError(true);
          onError?.(event);
        }}
      />
    </div>
  );
};
