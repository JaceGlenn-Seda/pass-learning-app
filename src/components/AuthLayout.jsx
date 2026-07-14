import React from "react";
import PassLogo from "@/components/PassLogo";

const BG_IMAGE = "https://media.base44.com/images/public/6a552d72363fc33d755650fa/b65106066_ChatGPTImageJul14202602_51_38PM.png";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT — illustration panel, no overlay, no extra logo */}
      <div className="relative hidden w-1/2 overflow-hidden bg-[#E8EDE7] lg:block">
        <img
          src={BG_IMAGE}
          alt="PASS Learning — EdTech Learning App"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* subtle right-edge shadow for depth where image meets form */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/8 to-transparent" />
      </div>

      {/* RIGHT — form panel */}
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* logo on mobile only */}
          <div className="mb-8 flex justify-center lg:hidden">
            <PassLogo className="h-12" />
          </div>
          {Icon && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon size={22} />
            </div>
          )}
          <h1 className="text-center font-heading text-2xl font-bold text-secondary">{title}</h1>
          {subtitle && <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}