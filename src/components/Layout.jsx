import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, Award, Coins,
  Bell, Menu, X, LogOut, Compass, Building2, Settings, Shield
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PassLogo from './PassLogo';
import { CreditPopover, OnboardingTour } from './CreditPopover';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    base44.entities.Notification.filter({ read: false }, '-created_date', 10)
      .then(setNotifications).catch(() => {});
  }, [location.pathname]);

  const role = user?.role || 'learner';
  const balance = user?.credit_balance || 0;

  const learnerNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', path: '/my-courses', icon: BookOpen },
    { label: 'Catalogue', path: '/catalogue', icon: Compass },
    { label: 'Quizzes', path: '/quizzes', icon: ClipboardList },
    { label: 'Certificates', path: '/certificates', icon: Award },
    { label: 'Credits', path: '/credits', icon: Coins },
  ];
  const corporateNav = [
    { label: 'Team Dashboard', path: '/corporate', icon: Building2 },
  ];
  const adminNav = [
    { label: 'Admin Panel', path: '/admin', icon: Shield },
  ];

  const navItems = [
    ...learnerNav,
    ...(role === 'corporate_admin' ? corporateNav : []),
    ...(role === 'admin' ? adminNav : []),
  ];

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  const markRead = async () => {
    setShowNotifs(false);
    for (const n of notifications) {
      await base44.entities.Notification.update(n.id, { read: true });
    }
    setNotifications([]);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/dashboard"><PassLogo light className="text-xl" /></Link>
        <button className="lg:hidden text-white/60" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
      </div>

      <nav className="flex-1 space-y-1 px-3 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          const tourAttr = item.path === '/catalogue' ? 'nav-catalogue'
            : item.path === '/certificates' ? 'nav-certificates' : undefined;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              data-tour={tourAttr}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/10 p-3">
          <p className="text-xs text-white/50">Signed in as</p>
          <p className="truncate text-sm font-semibold text-white">{user?.full_name || user?.email || 'Learner'}</p>
          <p className="text-xs capitalize text-white/40">{role.replace('_', ' ')}</p>
        </div>
        <button onClick={handleLogout} className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour user={user} />
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-secondary lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-secondary animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md lg:px-8">
          <button className="lg:hidden text-secondary" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="lg:hidden"><PassLogo className="text-lg" /></div>
          <div className="flex-1" />
          <CreditPopover balance={balance} />

          <div className="relative">
            <button data-tour="notifications" onClick={() => setShowNotifs(!showNotifs)} className="relative rounded-lg p-2 text-secondary hover:bg-muted">
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lift">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold text-secondary">Notifications</span>
                  <button onClick={markRead} className="text-xs text-accent hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up 🎉</p>
                  ) : notifications.map(n => (
                    <div key={n.id} className="border-b border-border px-4 py-3 last:border-0">
                      <p className="text-sm font-medium text-secondary">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/dashboard" className="flex items-center gap-2">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {(user?.full_name || user?.email || 'L').charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <Outlet context={{ user, refreshUser: () => base44.auth.me().then(setUser) }} />
        </main>
      </div>
    </div>
  );
}