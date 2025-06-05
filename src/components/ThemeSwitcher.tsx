import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// DaisyUI themes with their color schemes
const themes = [
  {
    name: "light",
    colors: ["#4B6BFB", "#7B92B2", "#D3D3D3", "#191D24"]
  },
  {
    name: "dark",
    colors: ["#4B6BFB", "#3D4451", "#2A303C", "#1F2937"]
  },
  {
    name: "cupcake",
    colors: ["#65C3C8", "#EF9FBC", "#FAF7F5", "#291334"]
  },
  {
    name: "bumblebee",
    colors: ["#F9D72F", "#E0A82E", "#F9E44C", "#191D24"]
  },
  {
    name: "emerald",
    colors: ["#66CC8A", "#377CFB", "#E3E3E3", "#333333"]
  },
  {
    name: "corporate",
    colors: ["#4B6BFB", "#627D98", "#E3E3E3", "#191D24"]
  },
  {
    name: "synthwave",
    colors: ["#E779C1", "#58C7F3", "#2D1B69", "#1A103C"]
  },
  {
    name: "retro",
    colors: ["#EF9995", "#A4CBB4", "#E4D8B4", "#2C1810"]
  },
  {
    name: "cyberpunk",
    colors: ["#FF7598", "#75D1F0", "#F6D860", "#1A1A1A"]
  },
  {
    name: "valentine",
    colors: ["#E96D7B", "#A991F7", "#F0D6E8", "#1F2937"]
  },
  {
    name: "halloween",
    colors: ["#FF7598", "#6D3A9C", "#F28C18", "#212121"]
  },
  {
    name: "garden",
    colors: ["#5C7F67", "#E84977", "#ECFCCB", "#1A1A1A"]
  },
  {
    name: "forest",
    colors: ["#1EB854", "#1DB88E", "#171212", "#1A1A1A"]
  },
  {
    name: "aqua",
    colors: ["#09ECF3", "#966FB3", "#E2F6F7", "#1A1A1A"]
  },
  {
    name: "lofi",
    colors: ["#808080", "#4A4A4A", "#FFFFFF", "#1A1A1A"]
  },
  {
    name: "pastel",
    colors: ["#66CC8A", "#F472B6", "#FFF1F2", "#1A1A1A"]
  },
  {
    name: "fantasy",
    colors: ["#6E0B75", "#007EBD", "#FFFFFF", "#1A1A1A"]
  },
  {
    name: "wireframe",
    colors: ["#B8B8B8", "#9E9E9E", "#FFFFFF", "#1A1A1A"]
  },
  {
    name: "black",
    colors: ["#333333", "#666666", "#000000", "#1A1A1A"]
  },
  {
    name: "luxury",
    colors: ["#FFFFFF", "#966919", "#171212", "#000000"]
  },
  {
    name: "dracula",
    colors: ["#FF7AC6", "#9580FF", "#22212C", "#282A36"]
  },
  {
    name: "cmyk",
    colors: ["#45AEEE", "#E8488A", "#FFF1F2", "#1A1A1A"]
  },
  {
    name: "autumn",
    colors: ["#8C0327", "#D85251", "#FBECEC", "#1A1A1A"]
  },
  {
    name: "business",
    colors: ["#1C4E80", "#7C909A", "#FFFFFF", "#1A1A1A"]
  },
  {
    name: "acid",
    colors: ["#FF00F4", "#FF7A00", "#FBECEC", "#1A1A1A"]
  },
  {
    name: "lemonade",
    colors: ["#519903", "#E9E92E", "#FFFFFF", "#1A1A1A"]
  },
  {
    name: "night",
    colors: ["#38BDF8", "#818CF8", "#1F2937", "#0F172A"]
  },
  {
    name: "coffee",
    colors: ["#DB924B", "#263E3F", "#F5E6D3", "#1A1A1A"]
  },
  {
    name: "winter",
    colors: ["#047AFF", "#463AA1", "#E2E2E2", "#1A1A1A"]
  }
] as const;

type Theme = (typeof themes)[number]["name"];

interface ThemeSwitcherProps {
  pageId?: string; // Optional page ID for per-page themes
}

export function ThemeSwitcher({ pageId }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isOpen, setIsOpen] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const key = pageId ? `theme-${pageId}` : 'theme';
    const savedTheme = localStorage.getItem(key) as Theme;
    if (savedTheme && themes.find(t => t.name === savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Set default theme based on system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
      document.documentElement.setAttribute("data-theme", systemTheme);
    }
  }, [pageId]);

  // Update theme
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    const key = pageId ? `theme-${pageId}` : 'theme';
    localStorage.setItem(key, newTheme);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 gap-1.5",
          isOpen && "bg-base-200"
        )}
      >
        <div className="flex gap-1">
          {themes.find(t => t.name === theme)?.colors.map((color, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="capitalize">{theme}</span>
      </Button>

      {/* Theme Sidebar */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-80 bg-base-100 shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Choose Theme</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                updateTheme(t.name);
                setIsOpen(false);
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:scale-105",
                theme === t.name ? "border-primary" : "border-base-200"
              )}
            >
              <div className="flex gap-2">
                {t.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium capitalize">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 