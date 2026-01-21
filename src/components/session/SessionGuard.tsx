import React from 'react';

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  // SESSION TIMEOUT COMPLETELY DISABLED
  // Was causing constant logouts due to stale localStorage timestamps
  return <>{children}</>;
}
