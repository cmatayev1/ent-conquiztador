import Link from "next/link";

export default function Home() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-8"
      style={{ background: "#0c2832" }}
    >
      <div className="text-center max-w-xl">
        <h1
          className="text-5xl font-black tracking-tight sm:text-7xl"
          style={{ color: "#f5b82e" }}
        >
          ENT-Бәйге
        </h1>
        <p className="mt-3 text-lg font-semibold text-[#9fd0db]">
          Скачки по степи знаний
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#7fb0bd]">
          Отвечай на вопросы ЕНТ быстрее соперников и веди своего скакуна через
          Казахстан к финишу.
        </p>
        <Link
          href="/play"
          className="mt-8 inline-block rounded-2xl px-10 py-4 text-lg font-black uppercase tracking-wide transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ background: "#f5b82e", color: "#0c2832" }}
        >
          Играть
        </Link>
      </div>
    </main>
  );
}
