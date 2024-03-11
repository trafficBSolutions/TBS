import React, { useState } from 'react';

function Header() {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const toggleMenu = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <header className="header-material-worx">
    <a className="header-material-logo" href="/">
        <img alt="TBS logo" className="tbs-logo-img" src="../public/tbs_companies/TBS logo1.png" />
    </a>
    <div className="mobile-material-nav-icon">
    <button className="mobile-material-nav" onClick={toggleMenu}>
        <ion-icon className="icon-mobile-nav" name="menu-outline">---</ion-icon>
    </button>
    </div>
    <nav className={`main-material-nav ${isNavOpen ? 'active' : ''}`}>
        <ul className="main-material-nav-list">
            <li><a className="main-material-nav-link" href="/trafficcontrol">Traffic Control</a></li>
            <li><a className="main-material-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
            <li><a className="main-material-nav-link" href="/bollardswheels">Bollards & Wheel Stops</a></li>
            <li><a className="main-material-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
            <li><a className="main-material-nav-link" href="/ppe">PPE Sales</a></li>
            <li><a className="main-material-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
        </ul>
    </nav>
    <div className="header-worx-links">
    <a className="header-worx-logo" href="">
        <img className="material-worx-img"alt="Material WorX logo" src="../public/tbs_companies/material worx.png"/>
        <h1 className="material-worx-text">Custom Shop</h1>
    </a>
    </div>
</header>
    );
}

export default Header;