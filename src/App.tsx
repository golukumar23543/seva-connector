import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { MerchantConfigProvider } from './context/MerchantConfigContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { ProviderDetailModal } from './components/ProviderDetailModal.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { CustomerDashboard } from './pages/CustomerDashboard.tsx';
import { ProviderDashboard } from './pages/ProviderDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { ArrivalGuaranteePage } from './pages/ArrivalGuaranteePage.tsx';
import { CashSatisfactionPage } from './pages/CashSatisfactionPage.tsx';

import type { Booking } from './types.ts';

function MainAppContent() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Location selector state (Exclusively Patna District)
  const [selectedCity, setSelectedCity] = useState<string>('Patna');
  const [selectedArea, setSelectedArea] = useState<string>('Boring Road');

  // Navigation page routing with /admin URL sync
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        return 'admin-dashboard';
      }
      if (path === '/45-min-arrival' || hash === '#45-min-arrival') {
        return '45-min-arrival';
      }
      if (path === '/cash-satisfaction-policy' || path === '/cash-satisfaction' || hash === '#cash-satisfaction') {
        return 'cash-satisfaction-policy';
      }
    }
    return 'home';
  });
  const [searchParams, setSearchParams] = useState<{ category?: string; search?: string }>({});

  // Synchronize browser history & back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentPage('admin-dashboard');
      } else if (path === '/45-min-arrival' || hash === '#45-min-arrival') {
        setCurrentPage('45-min-arrival');
      } else if (path === '/cash-satisfaction-policy' || path === '/cash-satisfaction' || hash === '#cash-satisfaction') {
        setCurrentPage('cash-satisfaction-policy');
      } else if (path === '/' || !path) {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register-customer' | 'register-provider'>('login');

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [bookingProviderId, setBookingProviderId] = useState<string | undefined>(undefined);

  const [providerDetailOpen, setProviderDetailOpen] = useState(false);
  const [selectedProviderForDetail, setSelectedProviderForDetail] = useState<any | null>(null);

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'search' && params) {
      setSearchParams(params);
    }
    setCurrentPage(page);

    if (typeof window !== 'undefined') {
      try {
        if (page === 'admin-dashboard') {
          window.history.pushState(null, '', '/admin');
        } else if (page === '45-min-arrival') {
          window.history.pushState(null, '', '/45-min-arrival');
        } else if (page === 'cash-satisfaction-policy' || page === 'cash-satisfaction') {
          window.history.pushState(null, '', '/cash-satisfaction-policy');
        } else if (page === 'home') {
          window.history.pushState(null, '', '/');
        }
      } catch {
        // Fallback for isolated iframe environments
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (tab: 'login' | 'register-customer' | 'register-provider' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleOpenBooking = (serviceId?: string, providerId?: string) => {
    if (!user) {
      showToast('Please sign in or select a demo account to book', 'info');
      handleOpenAuth('login');
      return;
    }
    setBookingServiceId(serviceId);
    setBookingProviderId(providerId);
    setBookingModalOpen(true);
  };

  const handleOpenProviderDetail = (provider: any) => {
    setSelectedProviderForDetail(provider);
    setProviderDetailOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    showToast(`Order placed: #${booking.bookingCode}`, 'success');
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#070e14] text-slate-100 selection:bg-[#0df2a4] selection:text-slate-950">

      {/* 2. Top Navigation Bar */}
      {currentPage !== 'admin-dashboard' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
          onOpenBooking={() => handleOpenBooking()}
          selectedCity={selectedCity}
          selectedArea={selectedArea}
          onLocationChange={(city, area) => {
            setSelectedCity(city);
            setSelectedArea(area);
            showToast(`Location set to ${area}, ${city}`, 'info');
          }}
        />
      )}

      {/* 3. Main Content Router */}
      <main className={`flex-1 ${currentPage === 'admin-dashboard' ? 'flex flex-col' : ''}`}>
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            onOpenProviderDetail={handleOpenProviderDetail}
            onOpenAuth={handleOpenAuth}
            selectedCity={selectedCity}
            selectedArea={selectedArea}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage
            initialCategory={searchParams.category}
            initialSearch={searchParams.search}
            selectedCity={selectedCity}
            selectedArea={selectedArea}
            onOpenBooking={handleOpenBooking}
            onOpenProviderDetail={handleOpenProviderDetail}
          />
        )}

        {currentPage === 'customer-dashboard' && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'provider-dashboard' && (
          <ProviderDashboard />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}
        {currentPage === '45-min-arrival' && (
          <ArrivalGuaranteePage
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            selectedCity={selectedCity}
            selectedArea={selectedArea}
          />
        )}
        {currentPage === 'cash-satisfaction-policy' && (
          <CashSatisfactionPage
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
          />
        )}
      </main>

      {/* 4. Trust-Building Footer */}
      {currentPage !== 'admin-dashboard' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 5. Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setBookingServiceId(undefined);
          setBookingProviderId(undefined);
        }}
        preselectedServiceId={bookingServiceId}
        preselectedProviderId={bookingProviderId}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        onBookingSuccess={handleBookingSuccess}
      />

      <ProviderDetailModal
        isOpen={providerDetailOpen}
        onClose={() => {
          setProviderDetailOpen(false);
          setSelectedProviderForDetail(null);
        }}
        provider={selectedProviderForDetail}
        onBookNow={(providerId, serviceCat) => {
          handleOpenBooking(undefined, providerId);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MerchantConfigProvider>
          <NotificationProvider>
            <MainAppContent />
          </NotificationProvider>
        </MerchantConfigProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
