import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PortfolioForm from "./components/PortfolioForm";
import PortfolioView from "./components/PortfolioView";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/student-dashboard"
            element={
              <PrivateRoute role="student">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/recruiter-dashboard"
            element={
              <PrivateRoute role="recruiter">
                <RecruiterDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-portfolio"
            element={
              <PrivateRoute role="student">
                <PortfolioForm />
              </PrivateRoute>
            }
          />
          <Route path="/portfolio/:id" element={<PortfolioView />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
