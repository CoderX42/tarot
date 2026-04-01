import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ReadingRoom from "@/pages/ReadingRoom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reading" element={<ReadingRoom />} />
      </Routes>
    </Router>
  );
}
