import React, { useState } from 'react';
import Gallery from 'react-photo-gallery';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
const photos = [
  {
    src: '../bollards/bollards.jpeg',
      width: 698,
      height: 926
  },
  {
    src: '../bollards/bollards.png',
    width: 395,
    height: 256
  },
  {
    src: '../bollards/concrete bollards.png',
    width: 1439,
    height: 1849
  },
  {
    src: '../bollards/metal bollards.png',
    width: 759,
      height: 900
  },
  {
    src: '../flaggers/flagger.jpg',
    width: 480,
    height: 640
  },
  {
    src: '../flaggers/trafficcontrolhome.jpg',
    width: 3024,
    height: 4032
  },
  {
    src: '../buffer and tapers/barrels.jpg',
    width: 4,
    height: 3
  },
  {
    src: '../buffer and tapers/setup.jpg',
    width: 768,
    height: 1024
  },
  {
    src: '../buffer and tapers/setup1.jpg',
    width: 800,
    height: 600
  },
  {
    src: '../buffer and tapers/setup2.jpg',
    width: 800,
    height: 600
  },
  {
    src: '../buffer and tapers/setup3.jpg',
    width: 800,
    height: 600
  },
  {
    src: '../buffer and tapers/setup4.jpg',
    width: 800,
    height: 600
  },
  {
    src: '../message and arrow boards/arrow board.jpg',
    width: 585,
    height: 400
  },
  {
    src: '../message and arrow boards/arrow board.png',
    width: 482,
    height: 282
  },
  {
    src: '../message and arrow boards/arrow board2.png',
    width: 650,
    height: 420
  },
  {
    src: '../message and arrow boards/message board.png',
    width: 1000,
    height: 1000
  },
  {
    src: '../ppes/PPE Sales.jpg',
    width: 3024,
    height: 4032
  },
  {
    src: '../ppes/safetyvests.jpg',
    width: 3024,
    height: 4032
  },
  {
    src: '../road signs/citylimit.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../road signs/harris art.jpg',
    width: 3024,
    height: 4032
  },
  {
    src: '../road signs/merge right.jpg',
    height: 4032,
    width: 3024
  },
  {
    src: '../road signs/no left turn.jpg',
    width: 3024,
    height: 4032
  },
  {
    src: '../road signs/road work.jpg',
    width: 3024,
    height: 4032
  },
  {
    src: '../road signs/stop.jpg',
    width: 3024,
    height: 4032
  },
  {
    src: '../road signs/street sign.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../road signs/warning sign.jpg',
    width: 3024,
    height: 4032
  },
  {
    src: '../road signs/yield.jpg',
    width: 4032,
    height: 3024
  },
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
    <div>
      <h2 className="photo-note">PHOTO GALLERY</h2>
      <div style={{ position: 'relative' }}>
        <Gallery photos={visiblePhotos} />
        {currentPhotoIndex !== 0 && (
          <button className="gallery-navigation-arrow-left" onClick={handlePrevious}>
            <FaArrowLeft />
          </button>
        )}
        {currentPhotoIndex + 3 < photos.length && (
          <button className="gallery-navigation-arrow-right" onClick={handleNext}>
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
}