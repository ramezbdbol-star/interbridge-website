import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { AdminFloatingToolbar } from '@/components/admin/AdminFloatingToolbar';
import { StandardServiceContent } from '@/components/services/StandardServiceContent';
import { TradeGuardServiceContent } from '@/components/services/TradeGuardServiceContent';
import { FurnitureServiceContent } from '@/components/services/FurnitureServiceContent';
import { ServiceDualCta } from '@/components/services/ServiceDualCta';
import NotFound from '@/pages/not-found';
import { getServiceBySlug } from '@/data/serviceData';

interface ServiceDetailProps {
  slug: string;
}

export default function ServiceDetail({ slug }: ServiceDetailProps) {
  const service = getServiceBySlug(slug);

  if (!service) {
    return <NotFound />;
  }

  const contentIdPrefix = `service-${service.id}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <AdminFloatingToolbar />
      <Navigation />

      <main>
        {service.pageVariant === 'standard' && (
          <StandardServiceContent service={service} contentIdPrefix={contentIdPrefix} />
        )}
        {service.pageVariant === 'tradeguard' && (
          <TradeGuardServiceContent contentIdPrefix={contentIdPrefix} />
        )}
        {service.pageVariant === 'furniture' && (
          <FurnitureServiceContent contentIdPrefix={contentIdPrefix} />
        )}

        <ServiceDualCta
          serviceTitle={service.title}
          serviceColor={service.color}
          contentIdPrefix={contentIdPrefix}
        />
      </main>

      <Footer />
    </div>
  );
}
