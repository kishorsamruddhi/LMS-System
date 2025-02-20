import { BrowserRouter, NavLink, Outlet, Route, Routes } from "react-router-dom";
import LoginPage from "./app/login/page";
import Dashboard from "./app/Protected/Dashboard";
import Header from "./components/ui/header";
import { ErrorBoundary } from 'react-error-boundary';

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/learners/*" element={<LearnerRoutes />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

const LearnerRoutes = () => {
  return <Routes>
    <Route path="/*" element={<LearnerLayout />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="profile" element={<h2>Learner Profile</h2>} />
    </Route>
  </Routes>
}

const LearnerLayout = () => {
  return <div>
    <Header />
    <div className="p-4">
      <Outlet />
    </div>
  </div>
}
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div>
      <h1>Something went wrong:</h1>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
};
