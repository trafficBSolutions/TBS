import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router

const NotFoundPage = () => {
    return (
        <div>
            <header className="header">
    <a className="header-logo" href="/">
        <img alt="TBS logo" className="tbs-logo-img" src="../public/tbs_companies/TBS logo1.png" />
    </a>
    <div className="mobile-nav-icon">
    <button className="mobile-nav" onClick={toggleMenu}>
        <ion-icon className="icon-mobile-nav" name="menu-outline">---</ion-icon>
    </button>
    </div>
    <nav className={`main-nav ${isNavOpen ? 'active' : ''}`}>
        <ul className="main-nav-list">
            <li><a className="main-nav-link" href="/trafficcontrol">Traffic Control</a></li>
            <li><a className="main-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
            <li><a className="main-nav-link" href="/bollards">Bollards & Wheel Stops</a></li>
            <li><a className="main-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
            <li><a className="main-nav-link" href="/ppe">PPE Sales</a></li>
            <li><a className="main-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
        </ul>
    </nav>
    <div className="header-worx-links">
    <a className="header-worx-logo" href="/materialworx">
        <img className="material-worx-img"alt="Material WorX logo" src="../public/tbs_companies/material worx.png"/>
        <h1 className="material-worx-text">Custom Shop</h1>
    </a>
    </div>
</header>
        <div className="not-found-container">
            <h1 className="NotFound">404 - Not Found</h1>
            <p className="page-info">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
            <Link to="/">Go to Home</Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
