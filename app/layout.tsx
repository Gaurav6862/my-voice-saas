import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="p-4 bg-gray-100">
        <Link href="/">
          <span className="text-blue-500 cursor-pointer">Home</span>
        </Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
