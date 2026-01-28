'use client';

import React, { useState, useLayoutEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { MapPin, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useUserProfileWithAddress } from '@/shared/hooks/useUserProfileWithAddress';
import Footer from '@/shared/components/Footer';
import OrdersCard from '@/shared/components/OrdersCard';
import ProfileCard from '@/shared/components/ProfileCard';
import AddressCard from '@/shared/components/AddressCard';
import { generateInitials } from '@/shared/utils/imageUpload';

// Types
type ActiveCardType = 'profile' | 'address' | 'orders';

// Sub-components
interface SidebarProfileProps {
  user: any;
  activeCard: ActiveCardType;
  isLogoutClicked: boolean;
  onCardChange: (card: ActiveCardType) => void;
  onLogout: () => void;
}

const SidebarProfile = ({
  user,
  activeCard,
  isLogoutClicked,
  onCardChange,
  onLogout,
}: SidebarProfileProps) => {
  const handleShowProfile = () => onCardChange('profile');
  const handleEditAddress = () => onCardChange('address');
  const handleShowOrders = () => onCardChange('orders');

  return (
    <div className='hidden md:flex bg-white rounded-2xl shadow-lg flex-col justify-center items-start p-5 md:p-6 gap-6 w-60 h-auto'>
      {/* User Info */}
      <div
        className='flex flex-row items-center gap-2 w-full h-12 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
        onClick={handleShowProfile}
      >
        <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0'>
          {user?.profilePicture ? (
            <Image
              src={user.profilePicture}
              alt='Profile'
              width={100}
              height={100}
              className='w-full h-full object-cover rounded-full'
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <span class="text-gray-600 font-semibold text-lg">
                      ${generateInitials(user?.name || 'User')}
                    </span>
                  `;
                }
              }}
            />
          ) : (
            <span className='text-gray-600 font-semibold text-lg'>
              {generateInitials(user?.name || 'User')}
            </span>
          )}
        </div>
        <span
          className={`flex-1 min-h-8 font-nunito font-bold text-base leading-5 tracking-[-0.03em] ${
            activeCard === 'profile' ? 'text-[#C12116]' : 'text-gray-900'
          } line-clamp-2`}
        >
          {user?.name || 'User'}
        </span>
      </div>

      {/* Separator */}
      <div className='w-full h-px border border-[#E9EAEB]'></div>

      {/* Navigation Links */}
      <div className='flex flex-col gap-6 w-full'>
        {/* Delivery Address */}
        <div
          className='flex flex-row items-center gap-2 w-full h-8 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
          onClick={handleEditAddress}
        >
          <MapPin
            className='w-6 h-6'
            style={{ color: activeCard === 'address' ? '#C12116' : '#0A0D12' }}
          />
          <span
            className={`font-nunito font-medium text-base leading-8 tracking-[-0.03em] ${
              activeCard === 'address' ? 'text-[#C12116]' : 'text-gray-900'
            }`}
          >
            Delivery Address
          </span>
        </div>

        {/* My Orders */}
        <div
          className='flex flex-row items-center gap-2 w-full h-8 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
          onClick={handleShowOrders}
        >
          <FileText
            className='w-6 h-6'
            style={{ color: activeCard === 'orders' ? '#C12116' : '#0A0D12' }}
          />
          <span
            className={`font-nunito font-medium text-base leading-8 tracking-[-0.03em] ${
              activeCard === 'orders' ? 'text-[#C12116]' : 'text-gray-900'
            }`}
          >
            My Orders
          </span>
        </div>

        {/* Logout */}
        <div
          className='flex flex-row items-center gap-2 w-full h-8 cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-colors'
          onClick={onLogout}
        >
          <LogOut
            className='w-6 h-6'
            style={{ color: isLogoutClicked ? '#C12116' : '#0A0D12' }}
          />
          <span
            className={`font-nunito font-medium text-base leading-8 tracking-[-0.03em] ${
              isLogoutClicked ? 'text-[#C12116]' : 'text-gray-900'
            }`}
          >
            Logout
          </span>
        </div>
      </div>
    </div>
  );
};

interface MobileNavigationProps {
  activeCard: ActiveCardType;
  onCardChange: (card: ActiveCardType) => void;
}

const MobileNavigation = ({
  activeCard,
  onCardChange,
}: MobileNavigationProps) => {
  const tabs = [
    { id: 'profile' as ActiveCardType, label: 'Profile', icon: '👤' },
    { id: 'address' as ActiveCardType, label: 'Address', icon: '📍' },
    { id: 'orders' as ActiveCardType, label: 'Orders', icon: '📋' },
  ];

  return (
    <div className='md:hidden bg-white rounded-2xl shadow-lg p-4 mb-6'>
      <div className='flex justify-between items-center'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onCardChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeCard === tab.id ? 'bg-red-50' : 'hover:bg-gray-50'
            }`}
          >
            <span className='text-lg'>{tab.icon}</span>
            <span
              className={`font-nunito text-sm font-medium ${
                activeCard === tab.id ? 'text-[#C12116]' : 'text-gray-900'
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal = ({ isOpen, onConfirm, onCancel }: LogoutModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl p-6 max-w-sm w-full'>
        <h3 className='font-nunito font-bold text-lg text-gray-900 mb-4'>
          Confirm Logout
        </h3>
        <p className='font-nunito text-gray-600 mb-6'>
          Are you sure you want to log out?
        </p>
        <div className='flex gap-3'>
          <button
            onClick={onCancel}
            className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-nunito font-medium hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 bg-red-600 text-white py-2 rounded-lg font-nunito font-medium hover:bg-red-700 transition-colors'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ProfilePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout, user: authUser } = useAuth();
  const { data: userProfile } = useUserProfileWithAddress();

  // State
  const [activeCard, setActiveCard] = useState<ActiveCardType>('profile');
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Merge user data
  const displayUser = authUser || userProfile;

  // Handle URL parameter
  useLayoutEffect(() => {
    if (!searchParams) return;
    const tab = searchParams.get('tab');
    if (tab === 'address') {
      setActiveCard('address');
    } else if (tab === 'orders') {
      setActiveCard('orders');
    } else if (tab === 'profile') {
      setActiveCard('profile');
    }
  }, [searchParams]);

  // Event handlers
  const handleCardChange = (card: ActiveCardType) => {
    setActiveCard(card);
    // Update URL without page refresh
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('tab', card);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setIsLogoutClicked(true);
    setShowLogoutModal(false);
    logout();
    router.push('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto py-8 px-4 md:px-10 pt-24 md:pt-28 max-w-7xl'>
        <MobileNavigation
          activeCard={activeCard}
          onCardChange={handleCardChange}
        />

        <div className='flex flex-col md:flex-row gap-6 md:gap-8'>
          {/* Sidebar Profile - Desktop Only */}
          <SidebarProfile
            user={displayUser}
            activeCard={activeCard}
            isLogoutClicked={isLogoutClicked}
            onCardChange={handleCardChange}
            onLogout={handleLogout}
          />

          {/* Right Content */}
          <div className='w-full md:flex-1'>
            {/* Profile Card */}
            {activeCard === 'profile' && <ProfileCard />}

            {/* Address Card */}
            {activeCard === 'address' && <AddressCard />}

            {/* Orders Card */}
            {activeCard === 'orders' && <OrdersCard />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
};

export default ProfilePage;
