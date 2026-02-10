import React from "react";
import { ResponsiveContainer } from "@/components/ui";
import { GameContainer } from "@/components/game";

/**
 * Home page featuring the FutureCraft game
 * within a responsive container with a green background
 */
export default function Home() {
  return (
    <div className="min-h-screen w-full bg-green-500 flex items-center justify-center p-4">
      <ResponsiveContainer
        ariaLabel="FutureCraft Game Container"
        className="h-[660px]" // Fixed height for the game container
      >
        <GameContainer />
      </ResponsiveContainer>
    </div>
  );
}
