import Link from 'next/link';
import Button from '@/app/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gold via-pink to-blue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            🎉 Reveal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Create memorable reveal moments
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Gender reveals, birthdays, anniversaries, and more
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/create">
            <Button size="lg" className="w-full">
              Create a Room
            </Button>
          </Link>

          <div className="text-center text-gray-400 dark:text-gray-500">or</div>

          <div>
            <input
              type="text"
              placeholder="Enter room code..."
              className="w-full px-6 py-4 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-pink focus:ring-2 focus:ring-pink/20 outline-none transition-all text-center text-lg bg-white dark:bg-gray-800 dark:text-white mb-4"
            />
            <Button variant="secondary" size="lg" className="w-full">
              Join Room
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Host: manage your reveal, share the code, celebrate together
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Guest: join the fun, vote, guess, and watch the reveal together
          </p>
        </div>
      </div>
    </div>
  );
}
