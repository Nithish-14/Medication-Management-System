import { useState } from "react";
import AuthForm from "../components/AuthForm";

export default function Authentication() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleUpdateMode = (m) => {
    setMode(m)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFF6FD] p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          {mode === "login" ? "Login to Your Account" : "Create an Account"}
        </h1>

        <AuthForm mode={mode} updateMode={handleUpdateMode} />

        <div className="text-center text-sm">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-[#2463EB] underline">
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-[#2463EB] underline">
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
