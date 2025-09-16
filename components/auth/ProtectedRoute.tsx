"use client";

import { ReactNode } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true 
}: ProtectedRouteProps) {
  if (!requireAuth) {
    return <>{children}</>;
  }

  const defaultFallback = (
    <div className="matrix-bg min-h-screen flex items-center justify-center p-6">
      <Card className="hacker-card neon-border max-w-md">
        <CardBody className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold terminal-text text-warning-red">
              ACCESS DENIED
            </h1>
            <p className="text-fluorescent-cyan text-lg">
              Authentication Required
            </p>
            <p className="text-outer-space">
              You must be signed in to access this area. Please authenticate to continue.
            </p>
          </div>
          
          <SignInButton mode="modal">
            <Button className="cyber-button" size="lg">
              AUTHENTICATE
            </Button>
          </SignInButton>
          
          <div className="text-xs text-outer-space">
            <p>🔒 Secure access control enabled</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        {fallback || defaultFallback}
      </SignedOut>
    </>
  );
}
