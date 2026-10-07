// Initialize map
const map = L.map('map').setView([40.7128, -74.0060], 13); // Default: New York

// Map layer definitions (all free, no API key needed)
const layers = {
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    }),
    
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/tiles/terrainclassic/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap',
        maxZoom: 17
    }),
    
    street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }),
    
    // Dark mode versions
    streetDark: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png', {
        attribution: '© Stadia Maps © Stamen Design © OpenMapTiles © OpenStreetMap contributors',
        maxZoom: 18
    }),
    
    satelliteDark: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19,
        opacity: 0.85
    }),
    
    terrainDark: L.tileLayer('https://{s}.tile.opentopomap.org/tiles/terrainclassic/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap',
        maxZoom: 17,
        opacity: 0.9
    })
};

// Trail overlay layer (OpenStreetMap trails data)
const trailLayer = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
    attribution: '© Waymarked Trails',
    opacity: 0.7,
    maxZoom: 18
});

// Set initial layer
let currentTheme = 'light';
let currentMapType = 'satellite';
layers.satellite.addTo(map);
trailLayer.addTo(map);

// Theme toggle functionality
document.getElementById('lightBtn').addEventListener('click', () => {
    switchTheme('light');
});

document.getElementById('darkBtn').addEventListener('click', () => {
    switchTheme('dark');
});

function switchTheme(theme) {
    currentTheme = theme;
    
    // Update button active state
    if (theme === 'light') {
        document.getElementById('lightBtn').classList.add('active');
        document.getElementById('darkBtn').classList.remove('active');
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        document.getElementById('darkBtn').classList.add('active');
        document.getElementById('lightBtn').classList.remove('active');
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
    
    // Update map layer based on theme and selected type
    updateMapLayer();
}

// Map type switching
document.querySelectorAll('input[name="mapType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentMapType = e.target.value;
        updateMapLayer();
    });
});

function updateMapLayer() {
    // Remove current layer
    map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer && layer !== trailLayer) {
            map.removeLayer(layer);
        }
    });
    
    // Add appropriate layer based on theme and type
    let layerToAdd;
    
    if (currentTheme === 'light') {
        if (currentMapType === 'satellite') {
            layerToAdd = layers.satellite;
        } else if (currentMapType === 'terrain') {
            layerToAdd = layers.terrain;
        } else {
            layerToAdd = layers.street;
        }
    } else {
        if (currentMapType === 'satellite') {
            layerToAdd = layers.satelliteDark;
        } else if (currentMapType === 'terrain') {
            layerToAdd = layers.terrainDark;
        } else {
            layerToAdd = layers.streetDark;
        }
    }
    
    layerToAdd.addTo(map);
    
    // Ensure trail layer stays on top
    if (document.getElementById('trailOverlay').checked) {
        trailLayer.bringToFront();
    }
}

// Trail overlay toggle
document.getElementById('trailOverlay').addEventListener('change', (e) => {
    if (e.target.checked) {
        map.addLayer(trailLayer);
        trailLayer.bringToFront();
    } else {
        map.removeLayer(trailLayer);
    }
});

// Add zoom controls
L.control.zoom({position: 'topleft'}).addTo(map);

// Add scale
L.control.scale().addTo(map);

// Prevent map tiles from being dragged outside bounds
map.setMaxBounds(map.getBounds());

// Add geolocation button
const geoButton = document.createElement('button');
geoButton.innerHTML = '📍 My Location';
geoButton.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 10px 15px;
    background: white;
    border: 2px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    z-index: 999;
    transition: all 0.2s ease;
`;

geoButton.addEventListener('mouseover', () => {
    geoButton.style.background = '#f0f0f0';
});

geoButton.addEventListener('mouseout', () => {
    geoButton.style.background = 'white';
});

geoButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        geoButton.innerHTML = '📍 Locating...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 14);
                L.marker([lat, lng]).addTo(map).bindPopup('📍 You are here');
                geoButton.innerHTML = '📍 My Location';
            },
            () => {
                geoButton.innerHTML = '📍 Location failed';
                setTimeout(() => {
                    geoButton.innerHTML = '📍 My Location';
                }, 2000);
            }
        );
    }
});

document.body.appendChild(geoButton);

// Listen for dark mode changes in body class to update geo button color
const observer = new MutationObserver(() => {
    if (document.body.classList.contains('dark-mode')) {
        geoButton.style.background = '#333';
        geoButton.style.color = '#e0e0e0';
        geoButton.style.borderColor = '#555';
    } else {
        geoButton.style.background = 'white';
        geoButton.style.color = '#333';
        geoButton.style.borderColor = '#ddd';
    }
});

observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

console.log('🗺️ Hiking Map loaded successfully!');
console.log('📍 Default location: New York. Zoom and pan to your desired area.');
console.log('Free tiles: © Esri, © OpenStreetMap, © OpenTopoMap, © Waymarked Trails');
