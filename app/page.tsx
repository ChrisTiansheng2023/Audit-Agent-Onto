import { PlatformApp } from "@/components/platform-app";
import { getChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();

  return (
    <PlatformApp
      user={{
        name: user?.displayName ?? "陈经理",
        email: user?.email ?? "finance.admin@huaxia-demo.cn",
      }}
    />
  );
}
