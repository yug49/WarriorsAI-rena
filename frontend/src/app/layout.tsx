import type { Metadata } from "next";
import "./globals.css";
import {Providers} from "./providers";
import {ReactNode} from "react";
import Header from "../components/Header";
import Footer from "@/components/Footer";
import WarriorAssistant from "@/components/WarriorAssistant";
import { WarriorMessageProvider } from "@/contexts/WarriorMessageContext";

export const metadata: Metadata = {
  title: "WarriorsAI-rena",
};

export default function RootLayout(props: {children: ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" 
          rel="stylesheet" 
        />
        <link rel="icon" href="/Rann1.png" type="image/png" />
      </head>
      <body>
        <Providers>
          <WarriorMessageProvider>
            <Header />
            {props.children}
            <Footer />
            <WarriorAssistant />
          </WarriorMessageProvider>
        </Providers>
      </body>
    </html>
  );
}
