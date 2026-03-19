import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation, useNavigate, Outlet, NavLink } from "react-router-dom";
import { api, getUserId, getToken } from "../api/client.js";
import {
  LayoutDashboard,
  FileText,
  Search,
  Map,
  MessageSquare,
  User as UserIcon,
  Menu,
  Info,
  LogOut,
  Loader2,
  Mic,
  Lightbulb,
  X,
  Compass,
  Bell,
  Sparkles,
  Users,
  HelpCircle,
  Linkedin,
  ChevronDown
} from "lucide-react";
import careerSaarthiLogo from "../assets/logo.png";
import BackgroundAnimation from "./UI/BackgroundAnimation.jsx";
import ChatWidget from "./UI/ChatWidget.jsx";

const DropdownMenuContext = React.createContext();

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = ({ children }) => {
  const { setIsOpen } = useContext(DropdownMenuContext);
  return <div onClick={() => setIsOpen((prev) => !prev)}>{children}</div>;
};

const DropdownMenuContent = ({ children }) => {
  const { isOpen, setIsOpen } = useContext(DropdownMenuContext);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900/80 backdrop-blur-md ring-1 ring-white/10 focus:outline-none"
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

const DropdownMenuItem = ({ children, onSelect }) => (
  <button
    onClick={onSelect}
    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-white/10"
  >
    {children}
  </button>
);
const DropdownMenuLabel = ({ children }) => (
  <div className="px-4 py-2 text-sm text-gray-400">{children}</div>
);
const DropdownMenuSeparator = () => (
  <div className="border-t border-white/10 my-1" />
);


export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        const isLandingPath = location.pathname === "/" || location.pathname === "/landing";

        if (!token && !isLandingPath) {
          navigate("/signin");
          return;
        }

        if (token && isLandingPath) {
          navigate("/dashboard");
          return;
        }

        // Fetch current user details from /me
        try {
          const userData = await api.get('/api/auth/me');
          setUser(userData);

          // Fetch profile
          const profileData = await api.get(`/api/profiles/${userData._id}`);
          setProfile(profileData);
        } catch (err) {
          console.error("Auth initialization failed:", err);
          localStorage.removeItem("careersaarthi_token");
          localStorage.removeItem("careersaarthi_user");
          if (!isLandingPath) {
            navigate("/signin");
          }
        }
      } catch (error) {
        console.error("Layout initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("careersaarthi_token");
    localStorage.removeItem("careersaarthi_user");
    localStorage.removeItem("careersaarthi_user_id");
    navigate("/");
  };

  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";

  const navigationItems = isLandingPage
    ? [
      { title: "Ecosystem", to: "#ecosystem", icon: Sparkles },
      { title: "About", to: "#team", icon: Info },
      { title: "FAQ", to: "#faq", icon: HelpCircle },
    ]
    : [
      { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { 
        title: "Resume", 
        icon: FileText,
        subItems: [
          { title: "Resume Builder", to: "/resume-builder", icon: FileText },
          { title: "Resume Analyzer", to: "/resume-analyzer", icon: Search },
        ]
      },
      { title: "Interview", to: "/interview-prep", icon: Mic },
      { title: "Career", to: "/career-explorer", icon: Map },
      { title: "LinkedIn", to: "/linkedin-optimizer", icon: Linkedin },
      { title: "Job Explorer", to: "/job-explorer", icon: Compass },
    ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const avatarUrl = profile?.profile_picture_url;
  const displayName = profile?.full_name || user?.firstName || "User";

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundAnimation />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="fixed top-0 left-0 right-0 h-20 bg-gray-950/20 backdrop-blur-sm z-50 pointer-events-none"></div>

        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl px-4 pointer-events-none text-center">
          <header className="inline-flex pointer-events-auto h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl items-center gap-8 lg:gap-16 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20 group/nav mx-auto">

            <div className="flex items-center justify-start relative z-10">
              <Link to={isLandingPage ? "#" : "/dashboard"} className={`flex items-center gap-3 active:scale-95 transition-transform group/logo ${isLandingPage ? 'cursor-default pointer-events-none' : ''}`}>
                <div className="w-8 h-8 flex items-center justify-center p-1 bg-white/5 rounded-xl border border-white/10 shadow-inner group-hover/logo:rotate-3 transition-transform">
                  <img src={careerSaarthiLogo} className="w-full h-full object-contain" alt="Logo" />
                </div>
                <h1 className="text-xl font-black text-white hidden sm:block tracking-tighter uppercase italic">
                  Career<span className="text-blue-400">Saarthi</span>
                </h1>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl relative z-10">
              {navigationItems.map((item) => {
                if (item.subItems) {
                  return (
                    <DropdownMenu key={item.title}>
                      <DropdownMenuTrigger>
                        <button className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all">
                          {item.title} <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {item.subItems.map((sub) => (
                          <DropdownMenuItem key={sub.title} onSelect={() => navigate(sub.to)}>
                            <sub.icon className="mr-2 h-4 w-4 text-blue-400" /> {sub.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return item.to.startsWith('#') ? (
                  <a
                    key={item.title}
                    href={item.to}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    {item.title}
                  </a>
                ) : (
                  <NavLink
                    key={item.title}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 relative group/link ${isActive
                        ? "text-blue-300 bg-blue-500/20 shadow-[inset_0_2px_10px_rgba(59,130,246,0.1)] active-3d"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-6 relative z-10">
              {!isLandingPage && (
                <>
                  <button className="relative p-1.5 text-gray-400 hover:text-white transition-colors group/bell">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full border-2 border-gray-950 group-hover:scale-110 transition-transform"></span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <div className="h-8 w-8 rounded-xl overflow-hidden border border-white/10 cursor-pointer bg-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform active:scale-95">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-black text-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className="p-2">
                        <DropdownMenuLabel className="p-0 text-[10px] uppercase tracking-tighter opacity-50">{user?.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => navigate("/profile")}>
                          <UserIcon className="mr-2 h-4 w-4 text-emerald-400" /> Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4 text-rose-400" /> Log out
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {isLandingPage && (
                <Link to="/signin">
                  <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                    Join Us
                  </button>
                </Link>
              )}

              <button
                className="text-gray-200 lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </header>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .active-3d {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}} />

        {isMobileMenuOpen && (
          <nav className="fixed inset-0 z-[60] bg-gray-950/90 backdrop-blur-2xl p-8 flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black uppercase tracking-tighter">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <div className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{item.title}</div>
                      {item.subItems.map((sub) => (
                        <NavLink
                          key={sub.title}
                          to={sub.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-6 px-6 py-4 rounded-[2rem] font-bold italic text-base transition-all ${isActive
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          <sub.icon className="w-5 h-5" />
                          {sub.title}
                        </NavLink>
                      ))}
                    </div>
                  ) : (
                    <NavLink
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-6 px-6 py-5 rounded-[2rem] font-bold italic text-lg transition-all ${isActive
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_10px_30px_rgba(59,130,246,0.2)]"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className="w-7 h-7" />
                      {item.title}
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          </nav>
        )}

        <main className="flex-1 overflow-y-auto relative">
          <Outlet context={{ user, profile }} />

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
            title="AI Career Assistant"
          >
            {isChatOpen ? <X className="w-8 h-8 text-white" /> : <MessageSquare className="w-8 h-8 text-white" />}
          </button>
          {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
        </main>
      </div>
    </div>
  );
}