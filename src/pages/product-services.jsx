import React from 'react';
import '../css/header.css';
import '../css/footer.css';
import '../css/productservice.css';
import images from '../utils/tbsImages';
import Header from '../components/Header'
import Footer from '../components/Footer'
const Product = () => {
    return(
        <div>
            <Header activePage="/product-services" />
            <main>
  <div className="page-product-banner">
    <h1 className="page-product-banner-title">Product Services</h1>
  </div>
  <section className="product-service-paragraphs">
    <div className="product-service-paragraph">
      <p className="product-service-paragraph-text">
        At TBS, we understand the importance of providing top-notch products and services to our clients.
        Our commitment to excellence extends to every aspect of our operations.
        From traffic control solutions to safety equipment, we deliver high-quality products tailored to your needs.
      </p>
      </div>
  </section>
  <section className="section-product-service">
    <div className="product-service-container">
    <h2 className="product-service-h2">Explore Our Product Offerings</h2>
    <p className="product-service-description">
      From custom signs to safety equipment, we deliver high-quality products tailored to your needs.
    </p>
    <div className="product-con-services">
      <div className="product-con-services-button">
        <img className="flagger-img" src={images["../assets/bollards/Bollards and Wheels.jpg"].default} alt="Bollards & Wheels" />
        <a href="/bollardswheels" className="btn btn-controller">Bollards & Wheel Stops</a>
      </div>
      <div className="product-con-services-button">
        <img className="flagger-img" src={images["../assets/road signs/Speed Limit 18x24 (1).svg"].default} alt="Traffic Signs" />
        <a href="/signs" className="btn btn-controller">Traffic Signs</a>
      </div>
      <div className="product-con-services-button">
        <img className="flagger-img" src={images["../assets/ppes/radians.jpg"].default} alt="PPE" />
        <a href="/ppe" className="btn btn-controller">Personal Protective Equipment</a>
      </div>
    </div>
    </div>
  </section>
</main>
      <Footer />
        </div>
    )
}
export default Product;
