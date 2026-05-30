import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthMeta = [
    null,
    { label: "Weak",   color: "#ef4444" },
    { label: "Fair",   color: "#EF9F27" },
    { label: "Good",   color: "#5DCAA5" },
    { label: "Strong", color: "#c99b5a" },
  ];

  const strength = getStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.password || form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm)
      errs.confirm = "Passwords do not match.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        { name: form.name, email: form.email, password: form.password }
      );
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-white/[0.04] border rounded-xl px-4 py-[14px] text-[15px] text-white placeholder-white/25 outline-none font-body transition-all duration-200 focus:border-gold/50 focus:bg-gold/[0.03] ${
      errors[field] ? "border-red-500/50" : "border-white/10"
    }`;

  return (
    <>
      <Navigation />
      <div className="font-body min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden md:ml-64 pt-20 md:pt-12">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,155,90,0.11) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(80,140,170,0.09) 0%, transparent 70%)" }} />
      </div>

      {/* Card */}
      <div className="animate-fadeUp relative z-10 w-full max-w-[440px] bg-[#161616] border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl">

        {/* Header */}
        <p className="text-[11px] tracking-[.18em] uppercase text-gold font-medium mb-2 font-body">
          Get started
        </p>
        <h1 className="font-display text-[2.2rem] md:text-4xl font-light text-white leading-[1.1] mb-2">
          Create your<br />account
        </h1>
        <p className="text-sm text-white/40 font-light mb-8 leading-relaxed font-body">
          Join us — it only takes a minute.
        </p>

        {serverError && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-body">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Name */}
          <div>
            <p className="text-[11px] tracking-[.14em] uppercase text-white/40 font-medium mb-2 font-body">
              Full name
            </p>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              className={inputClass("name")}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-2 font-light font-body">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="text-[11px] tracking-[.14em] uppercase text-white/40 font-medium mb-2 font-body">
              Email
            </p>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClass("email")}
            />
            {errors.email && (
              <p className="text-[11px] text-red-400 mt-2 font-light font-body">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <p className="text-[11px] tracking-[.14em] uppercase text-white/40 font-medium mb-2 font-body">
              Password
            </p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className={`${inputClass("password")} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm"
                aria-label="Toggle password"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-400 mt-2 font-light font-body">{errors.password}</p>
            )}

            {/* Strength meter */}
            {form.password && (
              <div className="mt-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-[3px] flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: i <= strength
                          ? strengthMeta[strength]?.color
                          : "rgba(255,255,255,0.08)",
                      }}
                    />
                  ))}
                </div>
                {strengthMeta[strength] && (
                  <p
                    className="text-[11px] mt-1.5 font-light font-body"
                    style={{ color: strengthMeta[strength].color }}
                  >
                    {strengthMeta[strength].label}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <p className="text-[11px] tracking-[.14em] uppercase text-white/40 font-medium mb-2 font-body">
              Confirm password
            </p>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputClass("confirm")} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm"
                aria-label="Toggle confirm password"
              >
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-[11px] text-red-400 mt-2 font-light font-body">{errors.confirm}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.email.trim()}
            style={{ background: "linear-gradient(135deg, #c99b5a 0%, #a87c3e 100%)" }}
            className="w-full py-4 rounded-2xl text-[15px] font-medium tracking-wide text-[#0d0d0d] font-body transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
          >
            <span className="flex items-center justify-center gap-2">
              {loading && (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
              )}
              {loading ? "Creating account..." : "Create account →"}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/[0.07]" />
          <span className="text-[11px] text-white/25 tracking-widest font-body">or</span>
          <div className="flex-1 h-px bg-white/[0.07]" />
        </div>

        {/* Google */}
        <button className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 text-[13px] font-light font-body transition-all duration-150 hover:bg-gold/10 hover:border-gold/40 hover:text-white">
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-center mt-6 text-[12px] text-white/30 font-light font-body">
          Already have an account?{" "}
          <Link to="/login" className="text-gold/80 hover:text-gold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}