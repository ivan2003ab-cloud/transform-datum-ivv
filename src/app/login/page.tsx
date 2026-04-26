"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        login(data);
        router.push("/");
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
      handleLogin();
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-100">
        
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Login
        </h1>

        {/* INPUT EMAIL */}
        <input
          className="w-full mb-3 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* INPUT PASSWORD */}
        <input
          type="password"
          className="w-full mb-5 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`
            w-full py-3 rounded-lg text-white font-semibold
            transition-all duration-200
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-700 to-emerald-500 hover:from-blue-800 hover:to-emerald-600 active:scale-[0.97] hover:-translate-y-[1px] shadow-md hover:shadow-lg"
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          ) : (
            "Login"
          )}
        </button>

        {/* LINK */}
        <p className="mt-4 text-sm text-gray-600">
          Belum punya akun?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push("/register")}
          >
            Daftar
          </span>
        </p>
      </div>
    </div>
  );
}