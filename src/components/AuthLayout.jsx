import React from "react";
import PassLogo from "@/components/PassLogo";

const BG_IMAGE = "https://media.base44.com/images/public/6a552d72363fc33d755650fa/ae35fdaa2_image.png";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen">
      {/* LEFT — brand illustration panel */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={BG_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-secondary/30" />
        {/* Logo top-left */}
        <div className="absolute left-8 top-8">
          <PassLogo light className="h-10" />
        </div>
        {/* Tagline bottom-left */}
        <div className="absolute bottom-10 left-8 right-8">
          <h2 className="font-heading text-3xl font-extrabold leading-tight text-white lg:text-4xl">
            Master the Skills.<br />Lead the Room.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/75">
            Professional soft-skills training for East Africa's rising leaders — by PASS.
          </p>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Logo on mobile only */}
          <div className="mb-8 flex justify-center lg:hidden">
            <PassLogo className="h-10" />
          </div>
          <div className="mb-8 text-center">
            {Icon && (
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
            <h1 className="font-heading text-2xl font-bold text-secondary">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            {children}
          </div>
          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}