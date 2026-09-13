import { Link } from "react-router-dom";
import Button from "~/components/ui/Button";
import { useAuth } from "~/lib/auth";
import { t } from "~/i18n";

// Placeholder until the public dashboard lands.
export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="bg-canvas text-ink flex min-h-dvh flex-col px-6">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between">
        <span className="font-display text-[17px] font-bold tracking-[-0.01em]">
          {t("home.title")}
        </span>
        <nav className="text-ink-72 flex items-center gap-5 text-[14.5px] font-medium">
          <Link to="/about" className="hover:text-ink">
            {t("nav.whatIsThis")}
          </Link>
          <Link to="/contribute" className="hover:text-ink">
            {t("nav.contribute")}
          </Link>
          {user ? (
            <button type="button" onClick={signOut} className="hover:text-ink">
              {user.email}
            </button>
          ) : (
            <Link to="/login" className="hover:text-ink">
              {t("nav.signIn")}
            </Link>
          )}
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-16">
        <p className="font-display max-w-2xl text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
          {t("home.tagline")}
        </p>
        <div className="mt-10">
          <Button size="lg" to="/contribute">
            {t("home.upload")}
          </Button>
        </div>
      </main>
    </div>
  );
}
