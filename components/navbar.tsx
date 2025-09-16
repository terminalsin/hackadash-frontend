"use client";

import { useState, useMemo } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { GithubIcon } from "@/components/icons";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're in a hackathon-specific route
  const adminMatch = pathname.match(/^\/admin\/([^\/]+)\/(dashboard|teams|submissions|sponsors|prizes|issues)/);
  const userMatch = pathname.match(/^\/([^\/]+)\/(teams|team-details|leaderboard)/);
  const hackathonId = adminMatch ? adminMatch[1] : (userMatch ? userMatch[1] : null);
  const isInAdminHackathon = !!adminMatch;
  const isInUserHackathon = !!userMatch;
  const isInHackathon = isInAdminHackathon || isInUserHackathon;

  // Generate navigation items based on context
  const navItems = useMemo(() => {
    if (isInAdminHackathon) {
      return [
        { label: "Dashboard", href: `/admin/${hackathonId}/dashboard` },
        { label: "Teams", href: `/admin/${hackathonId}/teams` },
        { label: "Submissions", href: `/admin/${hackathonId}/submissions` },
        { label: "Sponsors", href: `/admin/${hackathonId}/sponsors` },
        { label: "Prizes", href: `/admin/${hackathonId}/prizes` },
        { label: "Issues", href: `/admin/${hackathonId}/issues` },
      ];
    } else if (isInUserHackathon) {
      return [
        { label: "Teams", href: `/${hackathonId}/teams` },
        { label: "My Team", href: `/${hackathonId}/team-details` },
        { label: "Leaderboard", href: `/${hackathonId}/leaderboard` },
      ];
    }
    return siteConfig.navItems;
  }, [isInAdminHackathon, isInUserHackathon, hackathonId]);

  const navMenuItems = useMemo(() => {
    if (isInAdminHackathon) {
      return [
        { label: "Dashboard", href: `/admin/${hackathonId}/dashboard` },
        { label: "Teams", href: `/admin/${hackathonId}/teams` },
        { label: "Submissions", href: `/admin/${hackathonId}/submissions` },
        { label: "Sponsors", href: `/admin/${hackathonId}/sponsors` },
        { label: "Prizes", href: `/admin/${hackathonId}/prizes` },
        { label: "Issues", href: `/admin/${hackathonId}/issues` },
        { label: "All Hackathons", href: "/" },
        { label: "Admin Panel", href: "/admin" },
      ];
    } else if (isInUserHackathon) {
      return [
        { label: "Teams", href: `/${hackathonId}/teams` },
        { label: "My Team", href: `/${hackathonId}/team-details` },
        { label: "Leaderboard", href: `/${hackathonId}/leaderboard` },
        { label: "All Hackathons", href: "/" },
      ];
    }
    return siteConfig.navMenuItems;
  }, [isInAdminHackathon, isInUserHackathon, hackathonId]);

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="hacker-card border-b border-hacker-green"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <div className="w-8 h-8 bg-hacker-green rounded flex items-center justify-center">
              <span className="text-black font-bold text-sm">H</span>
            </div>
            <p className="font-bold text-hacker-green terminal-text text-xl">HACKADASH</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-6 justify-start ml-8">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "font-mono text-sm font-medium transition-colors hover:text-hacker-green",
                  pathname === item.href
                    ? "text-hacker-green"
                    : "text-outer-space hover:text-fluorescent-cyan"
                )}
                href={item.href}
              >
                {item.label.toUpperCase()}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-3">
          <Chip
            variant="flat"
            color="success"
            size="sm"
            className="font-mono"
          >
            SYSTEM ONLINE
          </Chip>
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-hacker-green hover:text-fluorescent-cyan transition-colors" />
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <NextLink href="/admin">
            <Button
              className="cyber-button"
              size="sm"
            >
              ADMIN PANEL
            </Button>
          </NextLink>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-hacker-green" />
        </Link>
        <NavbarMenuToggle className="text-hacker-green" />
      </NavbarContent>

      <NavbarMenu className="hacker-card">
        <div className="mx-4 mt-4 flex flex-col gap-3">
          {navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <NextLink
                className={clsx(
                  "w-full font-mono text-lg font-medium transition-colors",
                  pathname === item.href
                    ? "text-hacker-green"
                    : "text-outer-space hover:text-fluorescent-cyan",
                  index === navMenuItems.length - 1 && "text-warning-red"
                )}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label.toUpperCase()}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
