import { siteConfig } from "@/core/config";
import type { ChatSupportSettings } from "@/modules/settings/types/setting.types";
import { WhatsAppIcon } from "./support-bubble";

/** Static footer — server-renderable, brand values from core/config only. */
export function Footer({ settings }: { settings: ChatSupportSettings }) {
  const showWhatsApp =
    (settings.activePlatform === "whatsapp" || settings.activePlatform === "both") &&
    Boolean(settings.whatsappNumber);

  return (
    <footer className="border-t bg-card py-4 text-center text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1.5 px-4">
        <p className="text-sm font-extrabold text-foreground">{siteConfig.name}®</p>
        <p className="text-[10px] font-medium sm:text-xs">
          An Online Grocery Brand by {siteConfig.parentBrand}
        </p>
        {showWhatsApp && (
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(settings.whatsappMessage || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 items-center justify-center rounded-full border bg-background text-[#25D366] shadow-sm transition-all hover:bg-[#25D366] hover:text-white"
            title="WhatsApp"
          >
            <WhatsAppIcon className="size-4" />
          </a>
        )}
        <p className="text-[10px]">© 2026 All Rights Reserved.</p>
      </div>
    </footer>
  );
}
