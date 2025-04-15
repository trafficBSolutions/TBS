import React, { useState, useEffect } from 'react'; 
import images from '../../utils/tbsImages';
import { useNavigate } from 'react-router-dom';

function Header() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedAdmin = localStorage.getItem('adminUser');
        setIsAdmin(!!storedAdmin); // true if logged in
    }, []);

    const toggleMenu = () => {
        setIsNavOpen(!isNavOpen);
    };

    const handleAdminClick = () => {
        if (isAdmin) {
            // Logging out
            localStorage.removeItem('adminUser');
            setIsAdmin(false);
            navigate('/admin-login');
        } else {
            // Navigate to login
            navigate('/admin-login');
        }
    };

    return (
        <header className="header">
            <div className="mobile-nav-icon">
                <button className="mobile-nav" onClick={toggleMenu}>
                    <ion-icon className="icon-mobile-nav" name="menu-outline">---</ion-icon>
                </button>
            </div>
            
            <nav className={`main-nav ${isNavOpen ? 'active' : ''}`}>
    <a className="header-logo" href="/">
        <img alt="TBS logo" className="tbs-logo-img" src={images["../assets/tbs_companies/tbs white.svg"].default} />
    </a>

    <ul className="main-nav-list">
        <li><a className="main-nav-link-view" href="">About Us</a></li>
        <li>
            <a className="main-nav-link" href="/traffic-control-services">Traffic Control Services</a>
            <ul className="sub-nav-list">
                <li><a className="main-nav-link" href="/trafficcontrol">Traffic Control</a></li>
                <li><a className="main-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
                <li><a className="main-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
            </ul>
        </li>
        <li>
            <a className="main-nav-link" href="/product-services">Product Services</a>
            <ul className="sub-nav-list">
                <li><a className="main-nav-link" href="/bollardswheels">Bollards & Wheel Stops</a></li>
                <li><a className="main-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
                <li><a className="main-nav-link" href="/ppe">PPE Sales</a></li>
            </ul>
        </li>
        <li><a className="main-nav-link" href="/contact-us">Contact Us</a></li>
        <li><a className="main-nav-link" href="/applynow">Careers</a></li>

        {/* Admin options inside mobile menu */}
        <li className="admin-options">
            {isAdmin && (
                <a className="btn-main main-nav-link-view" href="/admin-dashboard">
                    Admin Dashboard
                </a>
            )}
            <button className="btn-main main-nav-link" onClick={handleAdminClick}>
                {isAdmin ? 'Log Out' : 'Admin Login'}
            </button>
        </li>
    </ul>
</nav>
            {/* Material WorX Logo Link */}
            <div className="phone-header">
                <a className="header-worx-logo" target="_blank" rel="noopener noreferrer" href="https://www.material-worx.com">
                    <img className="material-worx-img" alt="Material WorX logo" src={images["../assets/tbs_companies/Material WorX.svg"].default} />
                    <div className="material-worx">
                        <p className="material-worx-text">CUSTOM SHOP &#x1F80A;</p>
                        <p className="material-worx-web">www.material-worx.com</p>
                    </div>
                </a>
            </div>
        </header>
    );
}

export default Header;
