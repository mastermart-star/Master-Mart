import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BkashSettingsForm,
  ChatSettingsForm,
  DeliverySettingsForm,
  getBkashSettings,
  getChatSupportSettingsAdmin,
  getDeliverySettings,
} from "@/modules/settings";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const [bkash, delivery, chat] = await Promise.all([
    getBkashSettings(),
    getDeliverySettings(),
    getChatSupportSettingsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Payment gateways, courier services and customer chat support.
        </p>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="courier">Courier</TabsTrigger>
          <TabsTrigger value="chat">Chat support</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>bKash merchant & payment methods</CardTitle>
              <CardDescription>
                Controls which payment methods the storefront checkout offers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BkashSettingsForm initial={bkash} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courier">
          <Card>
            <CardHeader>
              <CardTitle>Courier service</CardTitle>
              <CardDescription>
                Steadfast / Pathao credentials used when dispatching orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliverySettingsForm initial={delivery} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat support</CardTitle>
              <CardDescription>
                The floating Messenger / WhatsApp bubble on the storefront.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatSettingsForm initial={chat} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
