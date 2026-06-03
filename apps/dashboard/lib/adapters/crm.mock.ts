import { accounts } from "../demo-data";

export async function syncMockCrmCompany(accountId: string) {
  const account = accounts.find((item) => item.id === accountId);

  if (!account) {
    return {
      ok: false,
      message: "Account not found in mock CRM adapter."
    };
  }

  return {
    ok: true,
    message: `Mock CRM company synced for ${account.name}.`,
    account
  };
}
