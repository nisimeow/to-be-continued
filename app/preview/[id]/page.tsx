'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Monitor, Tablet, Smartphone } from 'lucide-react';

type Device = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPage() {
  const router = useRouter();
  const [device, setDevice] = useState<Device>('desktop');

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editor
        </Button>

        <div className="flex gap-2">
          <Button
            variant={device === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={device === 'tablet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDevice('tablet')}
          >
            <Tablet className="w-4 h-4 mr-2" />
            Tablet
          </Button>
          <Button
            variant={device === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex items-center justify-center p-8 min-h-[calc(100vh-80px)]">
        <div
          className="bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300"
          style={{
            width: deviceSizes[device].width,
            height: deviceSizes[device].height,
            maxWidth: '100%'
          }}
        >
          <iframe
            src="/test.html"
            className="w-full h-full border-0"
            title="Chatbot Preview"
          />
        </div>
      </div>
    </div>
  );
}
