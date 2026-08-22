import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { SupportBubble } from "@/components/shared/support-bubble";
import { LanguageProvider } from "@/hooks/use-language";
import { CartProvider } from "@/modules/orders";
import {
  DEFAULT_CHAT_SUPPORT,
  getChatSupportSettings,
  getPublicPaymentOptions,
} from "@/modules/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Build/revalidate-time reads. Guarded: a cold database must not fail the build.
  const [chatSettings, paymentOptions] = await Promise.all([
    getChatSupportSettings().catch(() => DEFAULT_CHAT_SUPPORT),
    getPublicPaymentOptions().catch(() => ({ isBkashEnabled: false, isCoDEnabled: true })),
  ]);

  return (
    <LanguageProvider>
      <CartProvider>
        <div className="flex min-h-dvh flex-col">
          <Header paymentOptions={paymentOptions} />
          <div className="flex-grow">{children}</div>
          <SupportBubble settings={chatSettings} />
          <Footer settings={chatSettings} />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}
