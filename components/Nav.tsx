import Link from "next/link";

const LINKS = [
  { href: "/models", label: "Models" },
  { href: "/news", label: "News" },
  { href: "/papers", label: "Papers" },
  { href: "/tools", label: "Tools" },
];

export default function Nav() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-neutral-900">
          AI Pulse
        </Link>
        <nav className="flex gap-5 text-sm font-medium text-neutral-600">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-neutral-900">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
