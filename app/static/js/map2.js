let map;
let polygons = [];
let currentId = null;
let mode = 'normal';
let sensorIdsUsed = new Set(); // Set to store used Sensor IDs
let modules = [];
let cameraModules = []; // Array to store sensor data for the current camera
const updateInterval = 3000; // 5 seconds for map update
const refreshInterval = 500; // 0.5 seconds for table refresh
let currentCameraId = null; // Store the current camera ID
let promptShown = false; // Flag to indicate if the prompt has been shown

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    fetchModules();
    fetchPolygonData(); // Fetch polygon data from JSON file
    setInterval(fetchModules, updateInterval);
    setInterval(refreshSidebar, refreshInterval);
});

function initMap() {
    map = L.map('map').setView([45.490807, 8.549812], 15); // Create a map centered on Novara

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function fetchPolygonData() {
    fetch('setup.json')
        .then(response => response.json())
        .then(data => {
            drawPolygons(data);
        })
        .catch(error => console.error('Error fetching polygon data:', error));
}

function drawPolygons(polygonData) {
    polygonData.forEach((data, index) => {
        const polygon = L.polygon(data.coordinates, {
            color: 'red',
            fillOpacity: 0
        }).addTo(map);

        polygon.bindPopup(data.label);

        polygon.on('click', function(event) {
            if (promptShown) return;
            promptShown = true;

            if (mode === 'set_sensor') {
                let sensorId = prompt(`Enter sensor ID:`);
                if (sensorId && !sensorIdsUsed.has(sensorId)) {
                    const lat = event.latlng.lat;
                    const lng = event.latlng.lng;
                    const moduleData = {
                        location: { lat: lat, lng: lng },
                        camera: data.cameraId
                    };
                    updateModule(sensorId, moduleData);
                    sensorIdsUsed.add(sensorId);
                } else {
                    alert(`ERROR: Sensor ID ${sensorId} is already used or invalid.`);
                }
            } else if (mode === 'data') {
                displaySensorData(data.cameraId);
                map.fitBounds(polygon.getBounds());
            }

            setTimeout(() => promptShown = false, 500);
        });

        polygons.push({ polygon, data });
    });

    updateColorsAndMarkers();
}

function displaySensorData(cameraId) {
    currentCameraId = cameraId;
    updateCameraModules(cameraId);
    refreshSidebar();
}

function updateCameraModules(cameraId) {
    cameraModules = modules.filter(module => module.camera === cameraId);
}

function refreshSidebar() {
    if (currentCameraId !== null) {
        const sidebarTitle = document.querySelector('#sidebar h2');
        sidebarTitle.innerHTML = `Sensor Data for Camera ${currentCameraId}`;
        const tableContainer = document.getElementById('sensorDataTable');
        tableContainer.innerHTML = ''; // Clear the previous table
        if (cameraModules.length > 0) {
            const table = document.createElement('table');
            const headerRow = table.insertRow();
            headerRow.insertCell().textContent = 'Sensor ID';
            headerRow.insertCell().textContent = 'Water Level (cm)';
            headerRow.insertCell().textContent = 'Temperature (°C)';
            headerRow.insertCell().textContent = 'Location';
            cameraModules.forEach(module => {
                const row = table.insertRow();
                row.insertCell().textContent = module.id;
                row.insertCell().textContent = (module.depth * 100).toFixed(2);
                row.insertCell().textContent = module.temperature.toFixed(2);
                row.insertCell().textContent = `(${module.location.lat}, ${module.location.lng})`;
            });
            tableContainer.appendChild(table);
        } else {
            tableContainer.innerHTML = '<p>No sensors found for this camera.</p>';
        }
    }
}

function viewAverageHistory() {
    window.location.href = `/history/${currentCameraId}`;
}

function updateColorsAndMarkers() {
    let threshold = parseFloat(document.getElementById('thresholdInput').value);
    if (threshold < 0) {
        alert('Set Point value cannot be negative. Resetting to 0.');
        threshold = 0;
        document.getElementById('thresholdInput').value = 0;
    }

    polygons.forEach(({ polygon, data }) => {
        const moduleData = modules.filter(module => module.camera === data.cameraId);
        const moduleWithTemperature = moduleData.filter(mod => mod.temperature !== 0);
        if (moduleData.length > 0) {
            const avgDepth = moduleData.reduce((acc, mod) => acc + mod.depth, 0) / moduleData.length;
            const avgTemperature = moduleWithTemperature.reduce((acc, mod) => acc + mod.temperature, 0) / moduleWithTemperature.length;
            data.depth = avgDepth;
            data.temperature=avgTemperature;
            
            const fillColor = getColor(avgDepth * 100, threshold);
            polygon.setStyle({
                fillColor: fillColor,
                fillOpacity: 0.5
            });

            if (Math.abs(avgDepth * 100 - threshold) > 3) {
                polygon._path.classList.add('blinking');
            } else {
                polygon._path.classList.remove('blinking');
            }

            const popupContent = `
                <div>
                    <strong>Camera ${data.cameraId}</strong><br>
                    Average Water Level: ${(avgDepth * 100).toFixed(2)} cm<br>
                    Temperature: ${data.temperature ? data.temperature.toFixed(2) : 'N/A'} °C
                </div>
            `;
            polygon.bindPopup(popupContent).openPopup();

            polygon.on('click', () => {
                const avgDepthCm = (avgDepth * 100).toFixed(2);
                const avgTemp = data.temperature ? data.temperature.toFixed(2) : 'N/A';
                const popupContent = `
                    <div>
                        <strong>Camera ${data.cameraId}</strong><br>
                        Average Water Level: ${avgDepthCm} cm<br>
                        Temperature: ${avgTemp} °C
                    </div>
                `;
                polygon.bindPopup(popupContent).openPopup();
            });
        }
    });

    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    modules.forEach(module => {
        if (module.location && module.location.lat !== null && module.location.lng !== null) {
            const marker = L.marker([module.location.lat, module.location.lng]).addTo(map);
            marker.bindPopup(`
                <div id="popup-${module.id}">
                    Module ID: ${module.id}<br>
                    Water Level: ${(module.depth * 100).toFixed(2)} cm<br>
                    Temperature: ${module.temperature.toFixed(2)}°C<br>
                    <button onclick="deleteSensor(${module.id})">Delete</button>
                </div>
            `, { closeButton: false });

            marker.on('mouseover', function () {
                this.openPopup();
            });

            marker.on('popupopen', function () {
                const popup = this.getPopup();
                const popupElement = popup.getElement();

                const keepOpen = () => {
                    popupElement.addEventListener('mouseover', () => {
                        this.off('mouseout');
                    });
                    popupElement.addEventListener('mouseout', () => {
                        setTimeout(() => {
                            this.closePopup();
                        }, 400);
                    });
                };

                keepOpen();
            });

            module.marker = marker;
        }
    });
}

function deleteSensor(moduleId) {
    if (confirm(`Are you sure you want to delete sensor ${moduleId}?`)) {
        fetch(`/api/modules/${moduleId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Sensor deleted successfully!');
                sensorIdsUsed.delete(moduleId); // Sensor ID is no longer used
                const moduleData = {
                    location: null,
                    camera: null
                };
                updateModule(moduleId, moduleData);
                const module = modules.find(m => m.id === moduleId);
                if (module && module.marker) {
                    map.removeLayer(module.marker); // Remove the marker from the map
                }
                fetchModules(); // Refresh modules and update map
            } else {
                alert('Failed to delete sensor.');
            }
        })
        .catch(error => console.error('Error deleting sensor:', error));
    }
}

function fetchModules() {
    fetch('/api/modules')
        .then(response => response.json())
        .then(data => {
            modules = data;
            updateColorsAndMarkers(); // Update map with new data
            if (currentCameraId !== null) {
                updateCameraModules(currentCameraId); // Update cameraModules with new data
                refreshSidebar(); // Update sidebar if a camera is selected
            }
        })
        .catch(error => console.error('Error fetching modules:', error));
}

function updateModule(id, moduleData) {
    fetch(`/api/modules/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(moduleData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Module updated successfully!');
            fetchModules(); // Refresh modules and update colors
        } else {
            alert('Failed to update module.');
        }
    })
    .catch(error => console.error('Error updating module:', error));
}

function getColor(depth, threshold) {
    const ratio = Math.min(Math.abs(depth - threshold) / threshold, 1);

    if (depth < threshold) {
        const red = 255;
        const green = Math.round(255 * (1 - ratio));
        const blue = Math.round(255 * (1 - ratio));
        return `rgb(${red},${green},${blue})`;
    } else {
        const blue = 255;
        const green = Math.round(255 * (1 - ratio));
        const red = Math.round(255 * (1 - ratio));
        return `rgb(${red},${green},${blue})`;
    }
}

