import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { Toaster } from "sonner";
import MapView from "./common/maping/mapComponent";

function App() {
  return (
    <>
      <Router>
        <Toaster position="bottom-right" />
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/map" element={<MapView/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App
