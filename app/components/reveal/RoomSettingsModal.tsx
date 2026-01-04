'use client';

import { useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import type { RevealType } from '@/lib/models/Room';

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: string;
    code: string;
    name: string;
    revealTime: string;
    revealType: RevealType;
    revealContent: {
      type: 'text' | 'image' | 'video';
      value: string;
      caption?: string;
    };
  };
  guestId: string;
  onUpdate: () => void;
}

const REVEAL_TYPE_OPTIONS = [
  { value: 'gender', label: 'Gender Reveal' },
  { value: 'baby', label: 'Baby Reveal' },
  { value: 'birthday', label: 'Birthday Surprise' },
  { value: 'anniversary', label: 'Anniversary Reveal' },
  { value: 'custom', label: 'Custom Event' },
];

const REVEAL_CONTENT_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image URL' },
  { value: 'video', label: 'Video URL' },
];

export default function RoomSettingsModal({
  isOpen,
  onClose,
  room,
  guestId,
  onUpdate,
}: RoomSettingsModalProps) {
  const [formData, setFormData] = useState({
    name: room.name,
    revealTime: room.revealTime.slice(0, 16),
    revealType: room.revealType,
    revealContent: {
      type: room.revealContent.type,
      value: room.revealContent.value,
      caption: room.revealContent.caption || '',
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showExtendWarning, setShowExtendWarning] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentValue = prev[parent as keyof typeof prev] as Record<string, unknown>;
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [child]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));

    if (field === 'revealTime' && value !== room.revealTime.slice(0, 16)) {
      setShowExtendWarning(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const payload = {
        guestId,
        ...formData,
        revealTime: new Date(formData.revealTime).toISOString(),
      };

      const response = await fetch(`/api/rooms/${room.code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          alert(`Validation Error: ${result.details}`);
        }
        throw new Error(result.error || 'Failed to update room');
      }

      onUpdate();
      onClose();
      alert('Room updated successfully!');
    } catch (error) {
      console.error('Error updating room:', error);
      alert(error instanceof Error ? error.message : 'Failed to update room');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Room Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Room Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />

          <Select
            label="Reveal Type"
            options={REVEAL_TYPE_OPTIONS}
            value={formData.revealType}
            onChange={(e) => handleChange('revealType', e.target.value)}
            error={errors.revealType}
          />

          <Input
            label="Reveal Date & Time"
            type="datetime-local"
            value={formData.revealTime}
            onChange={(e) => handleChange('revealTime', e.target.value)}
            error={errors.revealTime}
            required
          />

          {showExtendWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Time Change Warning</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Changing the reveal time will notify all guests in the room. Make sure this is the intended change.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Select
            label="Content Type"
            options={REVEAL_CONTENT_TYPE_OPTIONS}
            value={formData.revealContent.type}
            onChange={(e) => handleChange('revealContent.type', e.target.value)}
          />

          <Input
            label="Reveal Content"
            placeholder={formData.revealContent.type === 'text' ? 'e.g., It\'s a Boy!' : 'Enter URL'}
            value={formData.revealContent.value}
            onChange={(e) => handleChange('revealContent.value', e.target.value)}
            error={errors['revealContent.value']}
            required
          />

          <Input
            label="Caption (Optional)"
            placeholder="Add a special message..."
            value={formData.revealContent.caption}
            onChange={(e) => handleChange('revealContent.caption', e.target.value)}
          />

          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
