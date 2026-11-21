import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "./store.js";
import { AuthBootstrap } from "@/features/auth/index.js";
import { ThemeBootstrap, useTheme } from "@/features/theme/index.js";

// Every app-wide provider is composed here (Router, Redux, theming...) so
// main.jsx stays a one-liner. Sonner's Toaster is a single app-wide
// instance — call the `toast()` API from anywhere, it renders here; every
// failed API call already reaches it automatically via lib/httpClient.js's
// response interceptor.
function ThemedToaster() {
  const theme = useTheme();
  return <Toaster richColors position="bottom-right" theme={theme} />;
}

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthBootstrap />
        <ThemeBootstrap />
        {children}
        <ThemedToaster />
      </BrowserRouter>
    </Provider>
  );
}
