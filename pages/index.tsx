import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
     <h1>Stripe Payment</h1>
     <p>A Consultancty Session</p>
     <a href="https://buy.stripe.com/test_cN26ow2U31pP44EeUU"
     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Buy Now</a>
    </main>
  );
}
