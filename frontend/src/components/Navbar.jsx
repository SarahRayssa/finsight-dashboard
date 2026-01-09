import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full py-4 px-6 bg-dark/80 border-b border-primary flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-primary">
        FinSight
      </Link>

      <nav>
        <Link
          to="/dashboard"
          className="text-white hover:text-primary transition"
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
