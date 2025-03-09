"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <button className="flex gap-2"></button>;

  return (
    <div className="flex gap-2">
      <Button
        variant={"outline"}
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="bg-transparent text-black dark:text-white"
      >
        {theme === "light" ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )}
        <span className="sr-only">Toggle Theme</span>
      </Button>
    </div>
  );
}
