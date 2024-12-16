import React, { useState } from 'react';
import Gallery from 'react-photo-gallery';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
const photos = [
  {
    src: '../public/MX/Banner BBQ.JPG',
    width: 960,
    height: 720
  },
  {
    src: '../public/MX/mallory.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/mallory2.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/danco Trailer.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/Nance.JPG',
    width: 2048,
    height: 1536
  },
  {
    src: '../public/MX/Nance 2.JPG',
    width: 2048,
    height: 1536
  },
  {
    src: '../public/MX/jt.jpg',
    height: 4032,
    width: 3024
  },
  {
    src: '../public/MX/magnets.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/mr.JPG',
    width: 2048,
    height: 1536
  },
  {
    src: '../public/MX/mr2.JPG',
    width: 2048,
    height: 1536
  },
  {
    src: '../public/MX/mr3.JPG',
    width: 2048,
    height: 1536
  },
  {
    src: '../public/MX/homesolution.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/box truck.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/church table.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/church signs.JPG',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/shaw.JPG',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/btr.JPG',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/trinity.JPG',
    width: 4032,
    height: 3024
  },
  {
    src: '../public/MX/muse.JPG',
    width: 1599,
    height: 702
  },
  {
    src: '../public/MX/muse2.JPG',
    width: 1599,
    height: 702
  },
  {
    src: '../public/MX/muse3.JPG',
    width: 1599,
    height: 702
  },
  {
    src: '../public/MX/jdf shirt.JPG',
    width: 4032,
    height: 3024
  },
];

export default function MXPhotoGallery() {
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
      <h2 className="photo-mx-note">PHOTO GALLERY</h2>
      <div style={{ position: 'relative' }}>
        <Gallery photos={visiblePhotos} />
        {currentPhotoIndex !== 0 && (
          <button className="gallery-mx-navigation-arrow-left" onClick={handlePrevious}>
            <FaArrowLeft />
          </button>
        )}
        {currentPhotoIndex + 3 < photos.length && (
          <button className="gallery-mx-navigation-arrow-right" onClick={handleNext}>
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
}