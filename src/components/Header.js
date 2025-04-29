import Link from 'next/link';

const Header = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 z-[999]">
      <div className="w-full px-6 h-14 flex items-center justify-between">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="white" 
              className="w-5 h-5"
            >
              <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </div>
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