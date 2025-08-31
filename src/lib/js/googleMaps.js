export function initializeGoogleMap(mapElement, options = {}) {
	if (!mapElement || typeof google === 'undefined') return null;

	const {
		center = { lat: 31.230228407198098, lng: 29.95093033076445 },
		zoom = 15,
		title = 'The Circle Workspace',
		infoContent = '<div style="padding: 10px; color: #333;"><strong>The Circle Workspace</strong><br>Alexandria, Egypt</div>'
	} = options;

	const map = new google.maps.Map(mapElement, {
		center,
		zoom,
		styles: [
			{
				elementType: 'geometry',
				stylers: [{ color: '#f5f5f5' }]
			},
			{
				elementType: 'labels.icon',
				stylers: [{ visibility: 'off' }]
			},
			{
				elementType: 'labels.text.fill',
				stylers: [{ color: '#616161' }]
			},
			{
				elementType: 'labels.text.stroke',
				stylers: [{ color: '#f5f5f5' }]
			},
			{
				featureType: 'administrative.land_parcel',
				elementType: 'labels.text.fill',
				stylers: [{ color: '#bdbdbd' }]
			},
			{
				featureType: 'poi',
				elementType: 'geometry',
				stylers: [{ color: '#eeeeee' }]
			},
			{
				featureType: 'poi',
				elementType: 'labels.text.fill',
				stylers: [{ color: '#757575' }]
			},
			{
				featureType: 'poi.park',
				elementType: 'geometry',
				stylers: [{ color: '#e5e5e5' }]
			},
			{
				featureType: 'poi.park',
				elementType: 'labels.text.fill',
				stylers: [{ color: '#9e9e9e' }]
			},
			{
				featureType: 'road',
				elementType: 'geometry',
				stylers: [{ color: '#ffffff' }]
			},
			{
				featureType: 'road.arterial',
				elementType: 'labels.text.fill',
				stylers: [{ color: '#757575' }]
			},
			{
				featureType: 'road.highway',
				elementType: 'geometry',
				stylers: [{ color: '#dadada' }]
			},
			{
				featureType: 'road.highway',
				elementType: 'labels.text.fill',
				stylers: [{ color: '#616161' }]
			},
			{
				featureType: 'road.local',
				elementType: 'labels.text.fill',
				stylers: [{ color: '#9e9e9e' }]
			},
			{
				featureType: 'transit.line',
				elementType: 'geometry',
				stylers: [{ color: '#e5e5e5' }]
			},
			{
				featureType: 'transit.station',
				elementType: 'geometry',
				stylers: [{ color: '#eeeeee' }]
			},
			{
				featureType: 'water',
				elementType: 'geometry',
				stylers: [{ color: '#c9c9c9' }]
			},
			{
				featureType: 'water',
				elementType: 'labels.text.fill',
				stylers: [{ color: '#9e9e9e' }]
			}
		],
		disableDefaultUI: true,
		zoomControl: false,
		streetViewControl: false,
		mapTypeControl: false,
		fullscreenControl: false
	});

	// Add marker
	const marker = new google.maps.Marker({
		position: center,
		map: map,
		title: title,
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 12,
			fillColor: '#000000',
			fillOpacity: 1,
			strokeColor: '#FFFFFF',
			strokeWeight: 3
		}
	});

	// Add info window
	const infoWindow = new google.maps.InfoWindow({
		content: infoContent
	});

	marker.addListener('click', () => {
		infoWindow.open(map, marker);
	});

	// Auto-open info window
	setTimeout(() => {
		infoWindow.open(map, marker);
	}, 1000);

	return { map, marker, infoWindow };
}
