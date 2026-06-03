export type MockNotificationInput = {
  title: string;
  body: string;
  channel?: string;
  accountName?: string;
};

export async function sendMockNotification(input: MockNotificationInput) {
  return {
    ok: true,
    channel: input.channel ?? "mock-slack",
    deliveredAt: new Date().toISOString(),
    input
  };
}
