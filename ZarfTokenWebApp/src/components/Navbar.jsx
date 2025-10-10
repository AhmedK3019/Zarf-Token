import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-5xl items-center justify-between rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="../../assets/logo.png"
            alt="Logo"
            className="h-8 w-8 rounded-full bg-primary/10 p-1"
          />
          <span className="text-base font-semibold text-primary">
            Zarf Token
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80">
          <Link
            to="/product"
            className="rounded-full bg-primary/10 px-4 py-2 text-primary shadow-inner"
          >
            Product
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-primary">
            Pricing
          </Link>
          <Link
            to="/community"
            className="transition-colors hover:text-primary"
          >
            Community
          </Link>
          <Link to="/blog" className="transition-colors hover:text-primary">
            Blog
          </Link>
          <Link to="/docs" className="transition-colors hover:text-primary">
            Docs
          </Link>
          <Link to="/company" className="transition-colors hover:text-primary">
            Company
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-sm font-medium">
          <Link
            to="/login"
            className="rounded-full border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-full border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Sign Up
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
