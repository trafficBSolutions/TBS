import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../css/about.css';
import '../css/header.css';
import '../css/footer.css';
import images from '../utils/tbsImages';
import MapComponent from '../components/AboutMap';
import HomePhotoGallery from '../components/AboutPhotos'; 
const About = () => {
    return (
        <div>
            <Header activePage="/about-us" />
            <div className="page-banner">
                <video className="page-banner__bg-vid-dash" autoPlay loop muted playsInline>
                    <source src={images["../assets/videos/TBS Roadblock Video.mp4"].default} type="video/mp4"></source>
                </video>
                <div className="tbs-container">
                    <img src={images['../assets/tbs_companies/tbs white.svg'].default} alt="Material WorX Logo" />
                </div>
            </div>
            <section className="section-about">
                <div className="about-container">
                    <div className="about-text-box">
                        <h2 className="about-h2">About Us</h2>
                        <p className="about-description">
                            Traffic & Barrier Solutions, LLC is a comprehensive traffic management and safety solutions provider, specializing in a wide range of services to ensure the efficient flow of traffic and the protection of both motorists and pedestrians. From expert traffic control planning and implementation to the installation of durable bollards and the manufacturing and installation of high-quality traffic signs, our experienced team is dedicated to enhancing safety and minimizing disruptions on roadways, construction sites, and event venues. Additionally, we offer a diverse selection of personal protective equipment (PPE) for sale, as well as traffic equipment rentals and sales, providing our clients with the tools and resources they need to effectively manage traffic and ensure compliance with regulatory standards. With a commitment to excellence and customer satisfaction, Traffic & Barrier Solutions, LLC is your trusted partner for all your traffic and barrier needs.
                            </p>
                            </div>
                            </div>
                            </section>
                            <section className="section-items" id="how">
                <div className="map-about-us-container">
                    <MapComponent />
                    </div>
                    <div className="about-img-container">
                        <HomePhotoGallery />
                        </div>
                    </section>
                            <Footer />
    </div>
                            )
}
export default About
