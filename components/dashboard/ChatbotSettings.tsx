'use client';

import { Chatbot } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { HexColorPicker } from 'react-colorful';
import { useState, useEffect, useRef } from 'react';

interface ChatbotSettingsProps {
  chatbot: Chatbot;
  onUpdateColors: (colors: Chatbot['colors']) => void;
}

export default function ChatbotSettings({ chatbot, onUpdateColors }: ChatbotSettingsProps) {
  const [colors, setColors] = useState(chatbot.colors);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialColorsRef = useRef(chatbot.colors);

  // Debounced save: only call API after user stops changing colors for 800ms
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to save after 800ms of inactivity
    debounceTimerRef.current = setTimeout(() => {
      // Only save if colors have actually changed from initial
      if (
        colors.primary !== initialColorsRef.current.primary ||
        colors.secondary !== initialColorsRef.current.secondary ||
        colors.text !== initialColorsRef.current.text
      ) {
        setIsSaving(true);
        onUpdateColors(colors);
        initialColorsRef.current = colors;
        // Reset saving state after a short delay
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 800);

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [colors, onUpdateColors]);

  // Update initial colors ref when chatbot prop changes
  useEffect(() => {
    initialColorsRef.current = chatbot.colors;
    setColors(chatbot.colors);
  }, [chatbot.colors]);

  const handleColorChange = (key: keyof Chatbot['colors'], value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    // API call will happen via useEffect debouncing
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Settings</CardTitle>
          {isSaving && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chatbot Name */}
        <div>
          <Label className="text-sm font-medium">Chatbot Name</Label>
          <p className="mt-2 text-lg font-semibold">{chatbot.name}</p>
        </div>

        {/* Color Pickers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Colors</Label>
            {!isSaving && colors !== chatbot.colors && (
              <span className="text-xs text-gray-400">Unsaved changes</span>
            )}
          </div>

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
