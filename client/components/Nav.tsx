'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export default function Nav(){
  const router=useRouter();
  async function logout(){
    await api('/auth/logout',{method:'POST'}).catch(()=>undefined);
    router.replace('/login');
    router.refresh();
  }
  return <header className="border-b bg-white"><div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center"><Link href="/" className="font-black text-xl">Trao Interview Kit</Link><nav className="flex items-center gap-4 text-sm"><Link href="/kits">Kits</Link><Link href="/kits/new">New Kit</Link><Link href="/login">Login</Link><button onClick={logout} className="underline">Logout</button></nav></div></header>;
}
