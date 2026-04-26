"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;

    if (!name || !email || !password) {
      alert("Semua field harus diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Akun berhasil dibuat");
        router.push("/login");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white to-emerald-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-100">

        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Register
        </h1>

        {/* NAMA */}
        <input
          className="w-full mb-3 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          placeholder="Nama"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* EMAIL */}
        <input
          className="w-full mb-3 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* PASSWORD */}
        <input
          type="password"
          className="w-full mb-5 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`
            w-full py-3 rounded-lg text-white font-semibold
            transition-all duration-200
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-blue-700 hover:from-emerald-600 hover:to-blue-800 active:scale-[0.97] hover:-translate-y-[1px] shadow-md hover:shadow-lg"
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          ) : (
            "Daftar"
          )}
        </button>

        {/* LINK KE LOGIN */}
        <p className="mt-4 text-sm text-gray-600">
          Sudah punya akun?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}