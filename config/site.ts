export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Hackadash",
  description: "Elite hackathon hosting platform for digital warriors.",
  navItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Hackathons",
      href: "/hackathons",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Hackathons",
      href: "/hackathons",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/hackadash/hackadash",
    twitter: "https://twitter.com/hackadash",
    docs: "https://hackadash.dev/docs",
    discord: "https://discord.gg/hackadash",
    sponsor: "https://github.com/sponsors/hackadash",
  },
};
