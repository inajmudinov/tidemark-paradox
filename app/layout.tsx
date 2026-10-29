import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Tidemark Paradox — A duel across tomorrow',description:'A simultaneous strategy game for two players on separate devices. Anchor today. Intercept tomorrow.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
