import '../css/header.css';
import '../css/footer.css';
import '../css/trafficservice.css';
import Header from '../components/Header'
import Footer from '../components/Footer'
import images from '../utils/tbsImages';
const TService = () => {
    return (
        <div>
            <Header activePage="/traffic-control-services" />
            <main>
                <div className="page-traffic-banner">
        <h1 className="page-traffic-banner-title">
            Traffic Control Services
            </h1>
    </div>
    <section className="section-traffic-service" id="how">
        <div className="traffic-con-services-content">
        <div className="traffic-con-services">
                <h2 className="traffic-con-h2">Make
                    your construction sites safe and efficient with our traffic control services.
                </h2>
                <p className="traffic-con-services-description">
                    At TBS, Traffic Control Services are an importance of comprehensive 
                    traffic management and safety solutions specializing 
                    in a wide range of services to ensure the efficient flow of 
                    traffic and the protection of both motorists and pedestrians. 
                    From expert traffic control planning and implementation to
                    our experienced team is dedicated to enhancing safety and minimizing 
                    disruptions on roadways, construction sites, and event venues.
                    And you can rent Traffic Control Equipment 
                    to enhance the safety and efficiency of your construction site.
            </p>
                </div>
                <div className="traffic-con-services-img">
                    <img className="traffic-service-img" src={images["../assets/flaggers/barrels.jpg"].default} alt="TBS logo" />
                    </div>
                    </div>
                </section>
                <section className="section-traffic-service-button" id="how">
                    <div className="note-div">
                        <h1 className="traffic-services-con-h1">
                            Safe and Effective Services
                        </h1>
                        <h2 className="traffic-services-con-h2">
                            You can submit a request for traffic control services
                            by clicking one of options.
                            We will contact you as soon as possible.

                        </h2>
                    </div>
                    <div className="traffic-con-services-button">
                        <img className="flagger-img" src={images["../assets/flaggers/Flagger SVG Symbol With Stop.svg"].default} alt="TBS logo" />
                        <a href="/trafficcontrol" className="btn btn-controller">Traffic Control Jobs</a>
                        </div>
                        <div className="traffic-con-services-button">
                        <img className="flagger-img" src={images["../assets/flaggers/Traffic Plan.svg"].default} alt="TBS logo" />
                        <a href="/trafficplanning" className="btn btn-controller">Traffic Control Planning</a>
                        </div>
                        <div className="traffic-con-services-button">
                        <img className="flagger-img" src={images["../assets/message and arrow boards/arrow board.jpg"].default} alt="TBS logo" />
                        <a href="/rentals" className="btn btn-controller">Traffic Control Equipment Rentals</a>
                        </div>
                        </section>
                </main>
      <Footer />
        </div>
    )
}
export default TService;
