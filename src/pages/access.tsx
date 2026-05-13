import dynamic from 'next/dynamic';

const DashboardAccessPage = dynamic(() => import('../components/DashboardAccessPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-brand-bg text-brand-text font-mono flex items-center justify-center">
      Loading...
    </div>
  ),
});

export default function AccessPage() {
  return <DashboardAccessPage />;
}
