import dynamic from 'next/dynamic';

const DashboardDetailPage = dynamic(() => import('../../components/DashboardDetailPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-brand-bg text-brand-text font-mono flex items-center justify-center">
      Loading device...
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardDetailPage />;
}
