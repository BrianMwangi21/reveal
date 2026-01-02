'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';

const REVEAL_TYPE_OPTIONS = [
  { value: 'gender', label: 'Gender Reveal' },
  { value: 'baby', label: 'Baby Reveal' },
  { value: 'birthday', label: 'Birthday Surprise' },
  { value: 'anniversary', label: 'Anniversary Reveal' },
  { value: 'custom', label: 'Custom Event' },
];

export default function CreateRoomPage() {
  const router = useRouter();
  const [hostId, setHostId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    revealTime: '',
    revealType: 'gender' as const,
    revealContent: {
      type: 'text' as const,
      value: '',
      caption: '',
    },
    host: {
      id: '',
      nickname: '',
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    const storedHostId = localStorage.getItem('reveal_host_id');
    const storedNickname = localStorage.getItem('reveal_host_nickname');
    
    if (storedHostId) {
      setHostId(storedHostId);
      setFormData((prev) => ({
        ...prev,
        host: {
          id: storedHostId,
          nickname: storedNickname || prev.host.nickname,
        },
      }));
    }
  }, []);

  const handleChange = (field: string, value: string | Date) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const hostIdToUse = hostId || crypto.randomUUID();
      const nicknameToUse = formData.host.nickname;

      const payload = {
        ...formData,
        host: {
          id: hostIdToUse,
          nickname: nicknameToUse,
        },
      };

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          const newErrors: Record<string, string> = {};
          result.details.split('. ').forEach((error: string) => {
            const match = error.match(/(\w+)\s*-\s*(.+)/);
            if (match) {
              newErrors[match[1].toLowerCase()] = match[2];
            }
          });
          setErrors(newErrors);
        }
        throw new Error(result.error || 'Failed to create room');
      }

      localStorage.setItem('reveal_host_id', hostIdToUse);
      localStorage.setItem('reveal_host_nickname', nicknameToUse);

      setCreatedRoom({
        code: result.data.code,
        name: result.data.name,
      });

      setFormData({
        name: '',
        revealTime: '',
        revealType: 'gender',
        revealContent: {
          type: 'text',
          value: '',
          caption: '',
        },
        host: {
          id: payload.host.id,
          nickname: payload.host.nickname,
        },
      });
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (createdRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold via-pink to-blue flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6 text-6xl">🎉</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Room Created!
          </h1>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
            {createdRoom.name}
          </p>
          <div className="bg-gradient-to-r from-purple to-pink text-white rounded-2xl p-6 mb-6">
            <p className="text-sm mb-2">Share this code with your guests:</p>
            <p className="text-5xl font-bold tracking-wider">{createdRoom.code}</p>
          </div>
          <Button
            onClick={() => navigator.clipboard.writeText(createdRoom.code)}
            variant="outline"
            size="md"
            className="w-full mb-3"
          >
            Copy Code
          </Button>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push(`/rooms/${createdRoom.code}`)}
              size="lg"
              className="w-full"
            >
              Go to Room
            </Button>
            <Button
              variant="outline"
              onClick={() => setCreatedRoom(null)}
              size="md"
              className="w-full"
            >
              Create Another Room
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold via-pink to-blue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          Create Your Reveal
        </h1>
        <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
          Set up your celebration moment
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Room Name"
            placeholder="e.g., Baby Smith's Gender Reveal"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />

          <Input
            label="Your Nickname (as Host)"
            placeholder="e.g., MomToBe"
            value={formData.host.nickname}
            onChange={(e) => handleChange('host.nickname', e.target.value)}
            error={errors['host.nickname']}
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

          <Input
            label="Reveal Content"
            placeholder="e.g., It's a Boy! or the reveal message"
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

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Room...
              </span>
            ) : 'Create Room'}
          </Button>
        </form>
      </div>
    </div>
  );
}
