import './globals.css'; import Nav from '../components/Nav';
export default function Layout({children}:{children:React.ReactNode}){return <html><body><Nav/>{children}</body></html>}
