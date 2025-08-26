document.addEventListener('DOMContentLoaded', function() {
  const sliders = Array.from(document.querySelectorAll('.slider'));
  sliders.forEach((slider) => {
    const track = slider.querySelector('.slides');
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const prev = slider.querySelector('.prev');
    const next = slider.querySelector('.next');
    let index = 0;

    function update() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
    }

    function go(n) {
      index = (n + slides.length) % slides.length;
      update();
    }

    prev && prev.addEventListener('click', () => go(index - 1));
    next && next.addEventListener('click', () => go(index + 1));

    // Keyboard navigation
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });

    // Touch swipe
    let startX = 0, dx = 0;
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      dx = 0;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      dx = e.touches[0].clientX - startX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (Math.abs(dx) > 40) {
        if (dx < 0) go(index + 1);
        else go(index - 1);
      }
      dx = 0;
    });

    update();
  });

  // Intersection Observer for workspace text animation
  const workspaceText = document.querySelector('.workspace-text');
  if (workspaceText) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(workspaceText);
  }

  // Intersection Observer for nomad text animation
  const nomadText = document.querySelector('.nomad-text');
  if (nomadText) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(nomadText);
  }

  // Intersection Observer for after hours text animation
  const afterHoursText = document.querySelector('.after-hours-text');
  if (afterHoursText) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(afterHoursText);
  }

  // Initialize Google Maps - Monochromatic Style
  window.initMap = function() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      // UPDATE THESE COORDINATES WITH YOUR DESIRED LOCATION
      const centerCoordinates = { lat: 31.230228407198098, lng: 29.95093033076445 };
      
      const map = new google.maps.Map(mapElement, {
        center: centerCoordinates,
        zoom: 15,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#f5f5f5"
              }
            ]
          },
          {
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#f5f5f5"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#bdbdbd"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e5e5e5"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#ffffff"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#dadada"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e5e5e5"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#c9c9c9"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          }
        ],
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      });

      // Add a marker at the center coordinates
      const marker = new google.maps.Marker({
        position: centerCoordinates,
        map: map,
        title: "The Circle Workspace",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#000000",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: '<div style="padding: 10px; color: #333;"><strong>The Circle Workspace</strong><br>Alexandria, Egypt</div>'
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Automatically open info window after a delay
      setTimeout(() => {
        infoWindow.open(map, marker);
      }, 1000);
    }
  };
});
