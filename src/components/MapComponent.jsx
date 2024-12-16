import React, { useState, useRef, useEffect } from 'react';
import '../css/trafficplan.css';
import { GOOGLE_MAPS_API_KEY } from '../constants/constantapi';

const MapComponent = () => { // Changed function signature to accept props
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapContainerRef = useRef(null);
  
  const onMarkerAdd = (latLng) => {
    console.log('onMarkerAdd called');
    console.log(latLng.lat(), latLng.lng());
  
    props.onMarkerAdd(latLng.lat(), latLng.lng()); 
  }
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;

      script.onload = initMap;

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (map) {
      const clickListener = map.addListener('click', handleMapClick);
      
      return () => {
        window.google.maps.event.removeListener(clickListener);
      };
    }
  }, [map]);

  const initMap = () => {
    const googleMap = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: 34.5116, lng: -84.9479 },
      zoom: 8,
      styles: [
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#EFDEB0' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#83CCCE' }],
        },
      ],
    });
    setMap(googleMap);
  };

  const handleMapClick = (event) => {
    console.log('Map clicked');
    console.log('Map:', map);
    console.log('Marker:', marker);
    if (!marker && map) {
      const newMarker = new window.google.maps.Marker({
        position: event.latLng, // Set the marker's position to the clicked position
        map: map,
        draggable: true,
        title: "Job Site" // Set the marker's title to "Job Site"
      });

      newMarker.addListener('dragend', () => {
        handleMarkerDrag(newMarker);
      });

      setMarker(newMarker);
      console.log('Marker added:', newMarker);

      // Notify parent component about marker position
      onMarkerAdd(event.latLng.lat(), event.latLng.lng()); 
    }
  };

  const handleMarkerDrag = (marker) => {
    // You can handle marker drag here if needed
  };

  const handleAddMarkerButtonClick = () => {
    // No need to toggle isSubmitting here
    if (!marker && map) {
      const center = map.getCenter();
      const newMarker = new window.google.maps.Marker({
        position: center,
        map: map,
        draggable: true,
        title: "Job Site"
      });

      newMarker.addListener('dragend', () => {
        handleMarkerDrag(newMarker);
      });

      // Notify parent component about marker position
      onMarkerAdd(center.lat(), center.lng());
      setMarker(newMarker);
    }
  };

  return (
    <div>
      <div className="map-container" ref={mapContainerRef}></div>
      <div className="map-button">
      <button 
        type="reset"
        className="btn btn-full add-marker"
        onClick={handleAddMarkerButtonClick}
      >
        Add Marker 
      </button>
      </div>
      </div>
  );
};

export default MapComponent;
