import React from 'react';
import '../css/error.css';
import '../css/header.css';
import '../css/footer.css';
import images from '../utils/tbsImages';
import Header from '../components/Header'
import Footer from '../components/Footer'

const Error = () => {
    return (
        <div>
            <Header />
            <main className="error-main">
                <div className="error-img">
                    <img className="error-img-1" alt="error" src={images["../assets/tbs cone.svg"].default}/>
                </div>
                <div className="not-found-container">
                    <h1 className="NotFound">404 - Not Found</h1>
                    <p className="page-info">The page you are looking for might have been removed, had its name changed, or does not exist.</p>
                    <button className="btn btn--full link-button" onClick={() => window.location.href = "/"}>Back to Home Page</button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Error;
