import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-6 py-4">
        <Link href="/">
          <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors">
            Chatbot Builder
          </h1>
        </Link>
      </div>
    </header>
  );
}
