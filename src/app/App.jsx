import { Suspense } from "react";
import "../styles/App.css";
import AppRoutes from "../routes/index.jsx";
import { PageLoader } from "@/components/common/loader/index.js";

// App stays small; navigation decisions belong in the routes folder.
// One Suspense boundary here covers every lazy-loaded page route, so
// individual routes never need to wrap themselves in <Suspense>.
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;
