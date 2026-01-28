/**
 * Image Gallery Hook
 * Handles drag/swipe functionality for image gallery
 */

import { useState, useLayoutEffect, useRef } from 'react';

// Gallery configuration
const GALLERY_CONFIG = {
  IMAGE_AUTO_ADVANCE_MS: 5000,
  DRAG_THRESHOLD_PX: 50,
};

interface UseImageGalleryProps {
  images: string[];
  autoAdvance?: boolean;
}

interface UseImageGalleryReturn {
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isDragging: boolean;
  dragStartX: number;
  dragCurrentX: number;
  galleryRef: React.RefObject<HTMLDivElement | null>;
  goToImage: (index: number) => void;
  handleDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  handleDragMove: (e: React.MouseEvent | React.TouchEvent) => void;
  handleDragEnd: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
}

export function useImageGallery({
  images,
  autoAdvance = true,
}: UseImageGalleryProps): UseImageGalleryReturn {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragCurrentX(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const dragDistance = dragCurrentX - dragStartX;

    if (Math.abs(dragDistance) > GALLERY_CONFIG.DRAG_THRESHOLD_PX) {
      if (dragDistance > 0 && currentImageIndex > 0) {
        // Swipe right - go to previous image
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (dragDistance < 0 && currentImageIndex < images.length - 1) {
        // Swipe left - go to next image
        setCurrentImageIndex(currentImageIndex + 1);
      }
    }

    setIsDragging(false);
    setDragStartX(0);
    setDragCurrentX(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e);
  };

  // Auto-advance images
  useLayoutEffect(() => {
    if (!autoAdvance || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, GALLERY_CONFIG.IMAGE_AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [images.length, autoAdvance]);

  return {
    currentImageIndex,
    setCurrentImageIndex,
    isDragging,
    dragStartX,
    dragCurrentX,
    galleryRef,
    goToImage: setCurrentImageIndex,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
  };
}
