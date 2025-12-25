import Providers from "../Providers";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
