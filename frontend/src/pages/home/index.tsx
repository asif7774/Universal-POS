import React, { useMemo } from 'react';
import { features } from 'constants/home';
import { Header } from './components/Header';
import { FeatureGrid } from './components/FeatureGrid';

const Home: React.FC = () => {
  const memoizedFeatures = useMemo(() => features, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-purple-600 via-purple-500 to-blue-600">
      <Header />
      <FeatureGrid features={memoizedFeatures} />

      {/* Footer */}
      <footer className="pb-8 container-responsive text-right">
        <a
          href="https://github.com/asif7774"
          className="text-white/70 hover:text-white transition-colors font-semibold"
        >
          Asif Ansari @ {new Date().getFullYear()}
        </a>
      </footer>
    </main>
  );
};

export default Home;
