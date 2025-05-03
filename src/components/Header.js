import Link from 'next/link';

const Header = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 z-[999]">
      <div className="w-full px-6 h-14 flex items-center justify-between">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center gap-2.5">
          <div>
            <h1 className="text-base font-semibold text-gray-800">
              Climate Power Forecast
            </h1>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/about" className="text-gray-500 hover:text-gray-900">About</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 