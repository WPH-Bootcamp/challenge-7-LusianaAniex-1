'use client';

import React, { useState, useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store/store';
import { useAuth } from '@/shared/hooks/useAuth';
import AuthModal from './AuthModal';
import MobileProfileSidebar from './MobileProfileSidebar';
import { generateInitials } from '@/shared/utils/imageUpload';
import whiteLogo from '@/assets/images/white-logo.png';
import redLogo from '@/assets/images/red-logo.png';
import shoppingBagIcon from '@/assets/images/shoppingbag-icon.svg';

const Navbar: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [originalMode, setOriginalMode] = useState<'login' | 'register'>(
    'login'
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const navigate = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { user, isAuthenticated } = useAuth();

  const cartItemsCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Handle scroll effect
  useLayoutEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mobile detection
  useLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if we're on profile page
  const isProfilePage = pathname === '/profile';

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setOriginalMode(mode); // Store the original mode clicked
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
    setAuthMode(originalMode); // Reset to the original mode that was clicked
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode); // Update the navbar's authMode when modal switches modes
  };

  const handleCartClick = () => {
    navigate.push('/cart');
  };

  const handleLogoClick = () => {
    navigate.push('/');
  };

  const handleMobileSidebarOpen = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 navbar-fixed flex items-center justify-between w-full box-border min-w-[320px] transition-all duration-200 ${
          isProfilePage || isScrolled
            ? 'md:bg-white/80 md:backdrop-blur-md bg-transparent shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'
            : 'bg-transparent'
        } h-16 md:h-20 px-4 md:px-[clamp(16px,5vw,120px)]`}
      >
        {/* Logo - Frame 37 */}
        <div
          className='flex items-center cursor-pointer shrink-0 min-w-0'
          onClick={handleLogoClick}
        >
          {/* Logo */}
          <div className='relative w-10 h-10 md:w-[clamp(32px,4vw,42px)] md:h-[clamp(32px,4vw,42px)] flex-none order-0 grow-0'>
            <Image
              src={pathname === '/' && !isScrolled ? whiteLogo : redLogo}
              alt='Foody Logo'
              fill
              className='object-contain'
              priority
              sizes='(max-width: 768px) 40px, 42px'
            />
          </div>
          {/* Foody Text - Hidden on mobile, visible on desktop */}
          <span
            className={`hidden md:block font-nunito font-extrabold text-[clamp(20px,3vw,32px)] leading-[42px] whitespace-nowrap flex-none order-1 grow-0 ${
              pathname === '/'
                ? isScrolled
                  ? 'text-gray-900'
                  : 'text-white'
                : 'text-gray-900'
            }`}
          >
            Foody
          </span>
        </div>

        {/* Right side - Frame 38 */}
        <div className='flex items-center gap-3 md:gap-[clamp(12px,2vw,24px)] h-10 md:h-12 flex-none order-1 grow-0 min-w-0'>
          {isAuthenticated ? (
            <>
              {/* Shopping Cart Icon - Bag */}
              <button
                onClick={handleCartClick}
                className='w-7 h-7 md:w-8 md:h-8 flex-none order-0 grow-0 bg-transparent border-none cursor-pointer relative'
              >
                <Image
                  src={shoppingBagIcon}
                  alt='Shopping Cart'
                  width={32}
                  height={32}
                  className={`w-7 h-7 md:w-8 md:h-8 ${
                    pathname === '/' && !isScrolled
                      ? 'filter-none'
                      : 'filter-[invert(1)]'
                  }`}
                  style={{
                    filter:
                      pathname === '/' && !isScrolled
                        ? 'none'
                        : 'invert(1) brightness(0)',
                  }}
                />
                {cartItemsCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '10px',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* User Profile - Frame 36 */}
              <div
                className='flex items-center gap-2 md:gap-[clamp(8px,1.5vw,16px)] h-10 md:h-12 flex-none order-1 grow-0 cursor-pointer min-w-0'
                onClick={() => {
                  // On mobile, open sidebar; on desktop, navigate to profile
                  if (isMobile) {
                    handleMobileSidebarOpen();
                  } else {
                    navigate.push('/profile');
                  }
                }}
              >
                {/* User Avatar - Ellipse 3 */}
                <div className='w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-none order-0 grow-0 relative'>
                  {user?.profilePicture ||
                  (typeof window !== 'undefined'
                    ? localStorage.getItem('userProfilePicture') || ''
                    : '') ? (
                    <Image
                      src={
                        user?.profilePicture ||
                        (typeof window !== 'undefined'
                          ? localStorage.getItem('userProfilePicture') || ''
                          : '')
                      }
                      alt='Profile'
                      fill
                      sizes='(max-width: 768px) 40px, 48px'
                      className='object-cover'
                      loader={({ src }) => src} // Useful if using data URIs or external URLs without configuration
                      unoptimized={true} // For simplicity with varying external/local user uploads, or remove if configuring domains
                    />
                  ) : user?.name ? (
                    <span
                      style={{
                        fontFamily: 'Nunito',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        fontSize: '18px',
                        color: '#374151',
                      }}
                    >
                      {generateInitials(user.name)}
                    </span>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#9ca3af',
                      }}
                    />
                  )}
                </div>
                {/* User Name - John Doe - Hidden on mobile */}
                <span
                  className={`hidden md:block h-8 font-nunito font-semibold text-[clamp(14px,1.5vw,18px)] leading-8 tracking-[-0.02em] flex-none order-1 grow-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] ${
                    pathname === '/'
                      ? isScrolled
                        ? 'text-gray-900'
                        : 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {user?.name || 'User'}
                </span>
              </div>
            </>
          ) : (
            <div className='flex items-center gap-2 md:gap-3 flex-nowrap'>
              <button
                className={`px-3 md:px-4 h-8 md:h-10 border-2 border-gray-300 rounded-full bg-transparent font-bold cursor-pointer transition-all duration-200 whitespace-nowrap text-xs md:text-sm ${
                  pathname === '/'
                    ? isScrolled
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-white hover:bg-white hover:text-black'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleAuthClick('login')}
              >
                Sign In
              </button>
              <button
                className={`px-3 md:px-4 h-8 md:h-10 border-none rounded-full font-bold cursor-pointer transition-all duration-200 whitespace-nowrap text-xs md:text-sm ${
                  pathname === '/'
                    ? isScrolled
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white text-black hover:bg-gray-100'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                onClick={() => handleAuthClick('register')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialMode={authMode}
        onModeChange={handleModeChange}
      />

      {/* Mobile Profile Sidebar */}
      <MobileProfileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleMobileSidebarClose}
      />
    </>
  );
};

export default Navbar;
