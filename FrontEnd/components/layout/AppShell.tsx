import Sidebar    from './Sidebar';
import Header     from './Header';
import RouteGuard from '@/components/auth/RouteGuard';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <RouteGuard>
      <div
        className="flex min-h-screen"
        style={{ backgroundColor: 'var(--bg-base)', transition: 'background-color 0.25s ease' }}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
};

export default AppShell;
