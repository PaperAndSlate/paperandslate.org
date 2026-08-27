import Link from "next/link";
export function BrandLogo() {
  return (
    <Link href="/" aria-label="Paper & Slate home">
      <img
        className="brand-logo light-theme-logo"
        src="/brand/paper-and-slate-horizontal-dark.svg"
        alt="Paper & Slate"
        width="188"
        height="47"
      />
      <img
        className="brand-logo dark-theme-logo"
        src="/brand/paper-and-slate-horizontal-light.svg"
        alt=""
        width="188"
        height="47"
      />
    </Link>
  );
}
