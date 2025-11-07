import { useNavigate } from "react-router-dom";
import "./notFound.css";

function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <main className="not-found-container">
      <section className="not-found-card" role="alert" aria-live="polite">
        <div className="not-found-hero">
          <img
            src="/ZTLogo.png"
            alt="ZarfToken logo"
            className="not-found-logo"
            width="96"
            height="96"
          />
        </div>
        <div className="not-found-content">
          <h1 className="not-found-heading">404</h1>
          <p className="not-found-subtitle">Ooooppss :'( </p>
          <p className="not-found-description">
            Sorry, but the page you're trying to access has either been removed,
            had its name changed, or is temporarily unavailable.
          </p>
          <button
            type="button"
            className="not-found-button"
            onClick={handleGoBack}
          >
            Go Back
          </button>
          <p className="not-found-contact">
            Contact <a href="tel:01222222222">01222222222</a> for
            recommendations
          </p>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
