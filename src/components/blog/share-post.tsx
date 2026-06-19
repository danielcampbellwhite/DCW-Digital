"use client";

import * as React from "react";
import {
  Share2,
  Link2,
  Check,
  Linkedin,
  Facebook,
  Twitter,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Share row for a blog post. Offers the native share sheet (mobile - includes
 * Instagram, WhatsApp, etc.), a copy-link button, and direct share links to
 * LinkedIn, Facebook, X and WhatsApp. The native button only appears when the
 * browser supports the Web Share API.
 */
export function SharePost({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = React.useState(false);
  const [canNativeShare, setCanNativeShare] = React.useState(false);

  React.useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    {
      label: "Share on LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
    {
      label: "Share on Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    {
      label: "Share on X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    },
    {
      label: "Share on WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${t}%20${u}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable - the share links still work */
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* user cancelled or unsupported */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-muted-foreground">Share</span>

      {canNativeShare && (
        <Button
          type="button"
          onClick={nativeShare}
          variant="outline"
          size="icon"
          aria-label="Share via your device"
        >
          <Share2 className="size-4" />
        </Button>
      )}

      {links.map((link) => (
        <Button
          key={link.label}
          href={link.href}
          variant="outline"
          size="icon"
          aria-label={link.label}
        >
          <link.icon className="size-4" />
        </Button>
      ))}

      <Button
        type="button"
        onClick={copy}
        variant="outline"
        size="icon"
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        {copied ? (
          <Check className="size-4 text-accent" />
        ) : (
          <Link2 className="size-4" />
        )}
      </Button>
    </div>
  );
}
