import React, { useState, lazy, Suspense } from 'react';
import Logos from 'components/atoms/logos';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { techBadges, COMMAND } from 'constants/home';

const Button = lazy(() => import('components/atoms/button'));
const ComponentLoader = () => <div className="animate-pulse bg-gray-200 rounded h-10 w-20" />;

export const Header: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <header className="pt-16 z-10 relative container-responsive text-center">
      <Logos.Vite className="w-80 h-80 m-auto mb-8" />
      <h1 className="text-6xl lg:text-7xl font-extrabold text-white mb-4">
        Vital
      </h1>
      <h2 className="text-2xl sm:text-3xl text-white/90 mb-8 font-medium">
        The Ultimate React + TypeScript + Tailwind Boilerplate
      </h2>

      {/* Technology Badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {techBadges.map((tech, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
          >
            <SvgIcon
              name={tech.icon}
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
              aria-hidden={true}
            />
            <span className="text-white font-semibold text-sm">{tech.name}</span>
          </div>
        ))}
      </div>

      {/* Call-to-Action Buttons */}
      <div className="flex flex-col gap-4 justify-center items-center mb-16">
        <a href="https://github.com/asif7774/vital">
          <Suspense fallback={<ComponentLoader />}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              <SvgIcon
                name="external-link"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
                aria-hidden={true}
              />
              Visit on Github
            </Button>
          </Suspense>
        </a>

        {/* Command Input with Copy Button */}
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl">
          <div className="flex-1 relative">
            <input
              type="text"
              readOnly
              value={COMMAND}
              className="w-full px-4 py-3 pr-24 bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60"
              aria-label="Command to install Vital"
            />
            <button
              onClick={() => { void handleCopy(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              aria-label="Copy command to clipboard"
            >
              {copied ? (
                <>
                  <SvgIcon
                    name="check"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white"
                    aria-hidden={true}
                  />
                  Copied!
                </>
              ) : (
                <>
                  <SvgIcon
                    name="clipboard"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white"
                    aria-hidden={true}
                  />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {copied && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-slide-up">
            <SvgIcon
              name="check-circle"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
              aria-hidden={true}
            />
            <span className="font-semibold">Copied to clipboard!</span>
          </div>
        )}
      </div>
    </header>
  );
};
