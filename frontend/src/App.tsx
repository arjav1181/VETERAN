import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-primary-dark text-text-primary antialiased">
      <Outlet />
    </div>
  );
}
