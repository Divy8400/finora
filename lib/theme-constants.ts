export type Theme = "system" | "light" | "dark" | "emerald" | "midnight";

export interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
  iconName: "laptop" | "sun" | "moon" | "sparkles" | "leaf";
  colorPreview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "system",
    label: "System",
    description: "Automatically matches your browser & OS preference",
    iconName: "laptop",
    colorPreview: {
      bg: "#F8FAFC",
      card: "#131B2E",
      accent: "#2563EB",
      text: "#172033",
    },
  },
  {
    id: "light",
    label: "Light",
    description: "Crisp, clean daytime theme",
    iconName: "sun",
    colorPreview: {
      bg: "#F8FAFC",
      card: "#FFFFFF",
      accent: "#2563EB",
      text: "#172033",
    },
  },
  {
    id: "dark",
    label: "Dark",
    description: "Sleek midnight navy dark theme",
    iconName: "moon",
    colorPreview: {
      bg: "#0B0F19",
      card: "#131B2E",
      accent: "#3B82F6",
      text: "#F8FAFC",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    description: "Deep slate with wealth green accents",
    iconName: "leaf",
    colorPreview: {
      bg: "#061A14",
      card: "#0C2820",
      accent: "#10B981",
      text: "#ECFDF5",
    },
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Deep pitch dark theme for OLED displays",
    iconName: "sparkles",
    colorPreview: {
      bg: "#000000",
      card: "#0A0A0A",
      accent: "#6366F1",
      text: "#FAFAFA",
    },
  },
];
