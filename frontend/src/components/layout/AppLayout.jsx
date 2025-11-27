import React, { useLayoutEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { gsap } from "gsap";

const AppLayout = ({ children, stats, theme, onToggleTheme }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".sidebar", {
        x: -30,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.from(".card", {
        y: 20,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.06,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="app-root" ref={ref}>
      <Sidebar stats={stats} />
      <div className="main">
        <Topbar theme={theme} onToggleTheme={onToggleTheme} />
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
