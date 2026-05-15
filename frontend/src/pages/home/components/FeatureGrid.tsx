import React, { lazy, Suspense } from 'react';

const Card = lazy(() => import('components/organisms/card'));

interface Feature {
  name: string;
  description: string;
  icon: string;
  docs: string;
  borderColor: string;
}

export const FeatureGrid: React.FC<{ features: Feature[] }> = ({ features }) => (
  <section className="container-responsive pb-16">
    <h2 className="sr-only">Features</h2>
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg h-48" />
        ))}
      </div>
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((props, index) => (
          <article key={index}>
            <Card
              title={props.name}
              description={props.description}
              icon={props.icon}
              href={props.docs}
              borderColor={props.borderColor}
            />
          </article>
        ))}
      </div>
    </Suspense>
  </section>
);
