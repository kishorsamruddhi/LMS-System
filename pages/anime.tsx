"use client";

import { Card } from "@/components/ui/card";

export default function AnimePage() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Anime</h1>
      <Card className="w-full aspect-[16/9]">
        <iframe
          src="https://aniwave.net.in"
          className="w-full h-full border-0"
          allow="fullscreen"
          title="Aniwave"
        />
      </Card>
    </div>
  );
}