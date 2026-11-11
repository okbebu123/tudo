import React, { useState, useEffect } from 'react';
import initialSeed from './data/initialSeed.json';
import { loadApplicationBundles, requireTurbopackModule } from './runtime/moduleRuntime';
import { installClientApiInterceptor } from './services/apiInterceptor';
import { usePathname, initHistoryInterceptor } from './services/routerShim';
import { StaticInfoPage } from './components/StaticInfoPages';
import { AdminPromptManager } from './components/AdminPromptModal';

installClientApiInterceptor();
initHistoryInterceptor();

export function App() {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    loadApplicationBundles()
      .then(() => {
        setReady(true);
      })
      .catch((err) => {
        console.error('Failed to load UI bundles:', err);
      });
  }, []);

  if (!ready) {
    return (
      <div className="home-loading min-h-screen flex items-center justify-center bg-[#070b14] text-white">
        <span>Đang mở Tủ Đồ AI…</span>
      </div>
    );
  }

  if (pathname === '/lien-he') {
    return <StaticInfoPage page="contact" />;
  }
  if (pathname === '/chinh-sach-bao-mat') {
    return <StaticInfoPage page="privacy" />;
  }
  if (pathname === '/dieu-khoan-su-dung') {
    return <StaticInfoPage page="terms" />;
  }

  const shellMod = requireTurbopackModule(39697);
  const StoreShellClient = shellMod?.StoreShellClient;

  return (
    <>
      {StoreShellClient ? (
        <StoreShellClient initialView={undefined} initialSeed={initialSeed} />
      ) : (
        <div className="p-8 text-center text-red-400">Không thể khởi tạo giao diện Tủ Đồ AI.</div>
      )}
      <AdminPromptManager />
    </>
  );
}
export default App;
