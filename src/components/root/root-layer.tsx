"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { OPEN_ROOT_PANEL_EVENT, useRootSession, useRootSettings } from "@/lib/root-access";

// Only downloaded when they're actually used.
const RootPanel = dynamic(() => import("@/components/root/root-panel").then((m) => m.RootPanel), { ssr: false });
const RootEffects = dynamic(() => import("@/components/root/root-effects").then((m) => m.RootEffects), { ssr: false });

/**
 * Mounted once in the layout. Opens the root control panel on request and
 * applies the root-only site settings while a root session is active.
 */
export function RootLayer() {
  const session = useRootSession();
  const settings = useRootSettings();
  const [panelOpen, setPanelOpen] = React.useState(false);

  React.useEffect(() => {
    const open = () => setPanelOpen(true);
    window.addEventListener(OPEN_ROOT_PANEL_EVENT, open);
    return () => window.removeEventListener(OPEN_ROOT_PANEL_EVENT, open);
  }, []);

  // Terminal mode and party mode are CSS driven via attributes on <html>.
  React.useEffect(() => {
    const html = document.documentElement;
    if (session && settings.terminalMode !== "off") html.dataset.rootTheme = settings.terminalMode;
    else delete html.dataset.rootTheme;
    if (session && settings.party) html.dataset.party = "";
    else delete html.dataset.party;
    if (session && settings.crt) html.dataset.crt = "";
    else delete html.dataset.crt;
  }, [session, settings.terminalMode, settings.party, settings.crt]);

  const needsEffects = !!session && (settings.crt || settings.bugCursor || settings.party);

  return (
    <>
      {needsEffects && <RootEffects crt={settings.crt} bugCursor={settings.bugCursor} party={settings.party} />}
      {panelOpen && <RootPanel onClose={() => setPanelOpen(false)} />}
    </>
  );
}
