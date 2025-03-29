import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

function Layout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Sidebar />
            <main className="pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout; 