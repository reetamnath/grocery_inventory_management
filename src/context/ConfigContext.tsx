import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { loadScriptUrl, saveScriptUrl } from "@/services/storage/localStorage";

interface ConfigContextType {
  scriptUrl: string;
  setScriptUrl: (url: string) => void;
  isConfigured: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [scriptUrl, setScriptUrlState] = useState<string>("");

  useEffect(() => {
    const savedUrl = loadScriptUrl();
    if (savedUrl) {
      setScriptUrlState(savedUrl);
    }
  }, []);

  const setScriptUrl = useCallback((url: string) => {
    setScriptUrlState(url);
    saveScriptUrl(url);
  }, []);

  const isConfigured = Boolean(scriptUrl);

  return (
    <ConfigContext.Provider value={{ scriptUrl, setScriptUrl, isConfigured }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
