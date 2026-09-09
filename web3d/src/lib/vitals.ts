import { onLCP, onCLS, onINP, onTTFB, onFCP } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: string;
  id: string;
  navigationType: string;
}

function sendToAnalytics(metric: VitalMetric) {
  // Use the installed analytics client; there is no shared Fleet collector.
  const posthog = (window as any).posthog;
  if (posthog && typeof posthog.capture === 'function') {
    posthog.capture('web_vital', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
      navigation_type: metric.navigationType,
    });
  }
}

export function initVitals() {
  // Local and headless sessions should not pollute production RUM or emit
  // failing cross-origin beacons while the game is being verified.
  if (import.meta.env.DEV) return;
  onLCP(sendToAnalytics);
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onFCP(sendToAnalytics);
}
