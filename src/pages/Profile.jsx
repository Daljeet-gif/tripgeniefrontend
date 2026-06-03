import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getProfileAPI, updateProfileAPI, deleteAccountAPI } from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!localStorage.getItem("accessToken")) {
        navigate("/login");
        return;
      }
      const { data } = await getProfileAPI();
      setUser(data.user);
      setForm({ name: data.user.name, email: data.user.email });
    } catch {
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await updateProfileAPI(form);
      setMessage("Profile updated successfully!");
      setUser({ ...user, ...form });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccountAPI(user._id || user.id);
      localStorage.removeItem("accessToken");
      navigate("/register");
    } catch {
      setMessage("Failed to delete account");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="font-body min-h-screen px-4 py-12 relative overflow-hidden md:ml-64 pt-20 md:pt-12">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,155,90,0.11) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(80,140,170,0.09) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-[500px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-[11px] text-white/30 uppercase tracking-widest font-body hover:text-gold transition-colors mb-6 flex items-center gap-2"
          >
            ← Back
          </button>
          <p className="text-[11px] tracking-[.18em] uppercase text-gold font-medium mb-2 font-body">
            Profile
          </p>
          <h1 className="font-display text-[2.6rem] md:text-5xl font-light text-white leading-[1.1]">
            Your Account
          </h1>
        </div>

        {/* Card */}
        <div className="bg-[#161616] border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl">

          {message && (
            <div className={`mb-5 px-4 py-3 rounded-xl text-[13px] font-body ${
              message.includes("success") 
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Name */}
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-white/40 font-medium mb-2 font-body">
                Full Name
              </p>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-[14px] text-[15px] text-white outline-none font-body transition-all duration-200 focus:border-gold/50 focus:bg-gold/[0.03]"
              />
            </div>

            {/* Email */}
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-white/40 font-medium mb-2 font-body">
                Email
              </p>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-[14px] text-[15px] text-white outline-none font-body transition-all duration-200 focus:border-gold/50 focus:bg-gold/[0.03]"
              />
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={updating}
              style={{ background: "linear-gradient(135deg, #c99b5a 0%, #a87c3e 100%)" }}
              className="w-full py-4 rounded-2xl text-[15px] font-medium tracking-wide text-[#0d0d0d] font-body transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {updating ? "Updating..." : "Update Profile"}
            </button>
          </form>

          <div className="h-px bg-white/[0.07] my-6" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 text-[13px] font-light font-body transition-all duration-150 hover:bg-white/[0.08] hover:text-white mb-3"
          >
            Sign Out
          </button>

          {/* Delete Account */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400/70 text-[13px] font-light font-body transition-all duration-150 hover:bg-red-500/10 hover:text-red-400"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[12px] text-white/40 text-center font-body">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 text-[13px] font-light font-body transition-all duration-150 hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-[13px] font-light font-body transition-all duration-150 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-[11px] text-white/20 font-light font-body">
          Member since {new Date(user?.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    </>
  );
}
