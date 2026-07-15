import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Professional Real Estate SEO Metadata
export const metadata = {
  title: {
    default: "Peninsula Commercial | Premium Real Estate Agency in Karachi",
    template: "%s | Peninsula Commercial"
  },
  description: "Discover premium properties, residential plots, flats, and commercial offices for sale or rent in Karachi with Peninsula Commercial.",
  keywords: [
    "Real Estate Karachi", 
    "Plots for sale Karachi", 
    "Commercial property Karachi", 
    "Peninsula Commercial", 
    "Flats for rent Karachi",
    "Karachi real estate agency"
  ],
  authors: [{ name: "Peninsula Commercial" }],
  creator: "Peninsula Commercial",
  metadataBase: new URL("http://localhost:3001"), // Production domain aane par ye URL change ho jayega
  
  // Open Graph (WhatsApp/Facebook share links previews ke liye)
  openGraph: {
    title: "Peninsula Commercial | Premium Real Estate Agency",
    description: "Find your dream home, plot, or office space with Karachi's trusted real estate agency.",
    url: "/",
    siteName: "Peninsula Commercial",
    locale: "en_US",
    type: "website",
  },

  // Twitter/X Cards
  twitter: {
    card: "summary_large_image",
    title: "Peninsula Commercial",
    description: "Premium property listings in Karachi.",
  },

  // Search Engine Robots Instruction
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070F2B] text-white`}
      >
        {children}
      </body>
    </html>
  );
}