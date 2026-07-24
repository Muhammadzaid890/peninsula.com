import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'DHA PLOTS — Phase 8 Portal',
  description: 'Premier real estate portal for DHA Phase 8 Karachi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FDFBF7] text-[#0F172A] antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}