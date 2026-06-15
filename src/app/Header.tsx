"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="flex justify-end items-center gap-3 p-4 h-16">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition">
            Войти
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 text-sm font-bold transition">
            Регистрация
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  );
}
