'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar({
  workspaceHref = '/login',
  workspaceLabel = 'Login',
  othersHref = '/other-modules',
  isOthersActive = false,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: workspaceLabel, href: workspaceHref, external: false },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-15 h-15 flex items-center justify-center bg-transparent transform transition-transform group-hover:rotate-12">
              <Image
                src="/assets/logo_color.png"
                alt="BNC logo"
                width={100}
                height={100}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="text-xl font-bold text-dark">TaskSphere</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1 rounded-full border border-gray-100 backdrop-blur-sm">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-dark hover:bg-dark hover:text-white rounded-full transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={othersHref}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                isOthersActive ? 'bg-dark text-white' : 'text-dark hover:bg-dark hover:text-white'
              }`}
            >
              Others
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-dark"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4 flex flex-col gap-4 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-medium text-dark py-2 px-4 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href={othersHref}
            className={`text-left text-base font-medium py-2 px-4 rounded-lg transition-colors ${
              isOthersActive ? 'bg-dark text-white' : 'text-dark hover:bg-gray-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Others
          </Link>
        </div>
      )}
    </nav>
  );
}
