import React, { useState } from 'react';
import images from '../utils/tbsImages';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
const photos = [
  {
    src: images['../assets/buffer and tapers/trafficset.jpg']?.default || '',
    width: 4032,
    height: 3024
  },
  {
    src: images['../assets/buffer and tapers/trafficset2.jpg']?.default || '',
    width: 3024,
    height: 4032
  },
  {
    src: images['../assets/buffer and tapers/trafficset3.jpg']?.default || '',
    width: 480,
    height: 640
  },
  {
    src: images['../assets/buffer and tapers/trafficset4.jpg']?.default || '',
    width: 2000,
    height: 1500
  },
  {
    src: images['../assets/buffer and tapers/trafficset5.jpg']?.default || '',
    width: 4032,
    height: 3024
  },
  
  {
    src: images['../assets/buffer and tapers/setup.jpg']?.default || '',
    width: 768,
    height: 1024
  },
  /*
  {
    src: '../assets/buffer and tapers/setup1.jpg']?.default || '',
    width: 800,
    height: 600
  },
  */
  {
    src: images['../assets/buffer and tapers/setup2.jpg']?.default || '',
    width: 800,
    height: 600
  },
  {
    src: images['../assets/buffer and tapers/trafficcontrolset.png']?.default || '',
    width: 960,
    height: 720
  },
  {
    src: images['../assets/buffer and tapers/setup4.jpg']?.default || '',
    width: 800,
    height: 600
  },
  {
    src: images['../assets/buffer and tapers/barrels.jpg']?.default || '',
    width: 4,
    height: 3
  },
  {
    src: images['../assets/bollards/install.jpg']?.default || '',
    width: 4032,
    height: 3024
  },
  {
    src: images['../assets/bollards/bollards.jpg']?.default || '',
      width: 698,
      height: 926
  },
  
  {
    src: images['../assets/bollards/concrete bollards.png']?.default || '',
    width: 1439,
    height: 1849
  },
  {
    src: images['../assets/bollards/metal bollards.png']?.default || '',
    width: 759,
      height: 900
  },
  /*
  {
    src: '../assets/message and arrow boards/arrow board2.png',
    width: 650,
    height: 420
  },
  {
    src: '../assets/message and arrow boards/message board.png',
    width: 1000,
    height: 1000
  },
  */
  {
    src: images['../assets/ppes/PPE Sales.jpg']?.default || '',
    width: 3024,
    height: 4032
  },
  {
    src: images['../assets/ppes/vests.jpg']?.default || '',
    width: 3024,
    height: 4032
  },
  {
    src: images['../assets/road signs/citylimit.jpg']?.default || '',
    width: 4032,
    height: 3024
  },
  {
    src: images['../assets/road signs/harris art.jpg']?.default || '',
    width: 3024,
    height: 4032
  },
  /*
  {
    src: '../assets/road signs/merge right.jpg']?.default || '',
    height: 4032,
    width: 3024
  },
  
  {
    src: '../assets/road signs/no left turn.jpg']?.default || '',
    width: 3024,
    height: 4032
  },
  
  {
    src: '../assets/road signs/road work.jpg']?.default || '',
    width: 3024,
    height: 4032
  },
  {
    src: '../assets/road signs/stop.jpg']?.default || '',
    width: 3024,
    height: 4032
  },
  {
    src: '../assets/road signs/street sign.jpg]?.default || ''
    width: 4032,
    height: 3024
  },
  {
    src: '../assets/road signs/warning sign.jpg']?.default || ''
    width: 3024,
    height: 4032
  },
  {
    src: '../assets/road signs/yield.jpg']?.default || ''
    width: 4032,
    height: 3024
  },
  */
  {
    src: images['../assets/road signs/no littering.jpg']?.default || '',
    width: 4032,
    height: 3024
  },
  {
    src: images['../assets/road signs/one way.jpg']?.default || '',
    width: 3024,
    height: 4032
  },
  /*
  {
    src: '../assets/road signs/sidewalk closed.jpg']?.default || '',
    width: 4032,
    height: 3024
  },
  */

];

export default function HomePhotoGallery() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentPhotoIndex((prevIndex) => Math.max(0, prevIndex - 2));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prevIndex) => Math.min(photos.length - 1, prevIndex + 2));
  };

  // Slice the photos array to show only three photos based on the currentPhotoIndex
  const visiblePhotos = photos.slice(currentPhotoIndex, currentPhotoIndex + 2);

  return (
    <div className="gallery-container">
      <h2 className="photo-about-note">PHOTO GALLERY</h2>
      <div className="gallery">
        {visiblePhotos.map((photo, index) => (
          <div className="gallery-item" key={index}>
            <img src={photo.src} alt={`Photo ${index}`} />
          </div>
        ))}
      </div>
      <div className="navigation-buttons">
        {currentPhotoIndex > 0 && (
          <button className="gallery-navigation-arrow-left" onClick={handlePrevious}>
            <FaArrowLeft />
          </button>
        )}
        {currentPhotoIndex + 2 < photos.length && (
          <button className="gallery-navigation-arrow-right" onClick={handleNext}>
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
}