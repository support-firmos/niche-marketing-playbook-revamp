import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-b from-gray-900 to-black py-6">
      <div className="container mx-auto flex flex-col items-center text-center">
        <Link href="/" className="flex flex-col items-center">
          <div className="relative w-auto h-auto flex justify-center">
            <Image
              src="https://storage.googleapis.com/firmos-pics/FirmOS%20Logo%20-%20White.png"
              alt="FirmOS Logo"
              width={200}
              height={200}
              className="object-contain"
              unoptimized
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Customer Niche Marketing Playbook
          </h1>
        </Link>
      </div>
    </header>
  );
}