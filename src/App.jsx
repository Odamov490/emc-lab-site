import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import EMCLabUltra from "./components/EMCLabUltra";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EMCLabUltra />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
