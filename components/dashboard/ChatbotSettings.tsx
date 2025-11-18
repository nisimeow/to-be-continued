'use client';

import { Chatbot } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

interface ChatbotSettingsProps {
  chatbot: Chatbot;
  onUpdateColors: (colors: Chatbot['colors']) => void;
}

export default function ChatbotSettings({ chatbot, onUpdateColors }: ChatbotSettingsProps) {
  const [colors, setColors] = useState(chatbot.colors);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const handleColorChange = (key: keyof Chatbot['colors'], value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    onUpdateColors(newColors);
    // Toast removed - color change is immediately visible in UI
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chatbot Name */}
        <div>
          <Label className="text-sm font-medium">Chatbot Name</Label>
          <p className="mt-2 text-lg font-semibold">{chatbot.name}</p>
        </div>

        {/* Color Pickers */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Colors</Label>

          {/* Primary Color */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Primary Color</span>
              <button
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                style={{ backgroundColor: colors.primary }}
                onClick={() =>
                  setActiveColorPicker(activeColorPicker === 'primary' ? null : 'primary')
                }
              />
            </div>
            {activeColorPicker === 'primary' && (
              <div className="mt-2">
                <HexColorPicker
                  color={colors.primary}
                  onChange={(value) => handleColorChange('primary', value)}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Secondary Color */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Secondary Color</span>
              <button
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                style={{ backgroundColor: colors.secondary }}
                onClick={() =>
                  setActiveColorPicker(activeColorPicker === 'secondary' ? null : 'secondary')
                }
              />
            </div>
            {activeColorPicker === 'secondary' && (
              <div className="mt-2">
                <HexColorPicker
                  color={colors.secondary}
                  onChange={(value) => handleColorChange('secondary', value)}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Color */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Text Color</span>
              <button
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                style={{ backgroundColor: colors.text }}
                onClick={() =>
                  setActiveColorPicker(activeColorPicker === 'text' ? null : 'text')
                }
              />
            </div>
            {activeColorPicker === 'text' && (
              <div className="mt-2">
                <HexColorPicker
                  color={colors.text}
                  onChange={(value) => handleColorChange('text', value)}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={colors.text}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
