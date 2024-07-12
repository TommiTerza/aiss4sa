let map;
let polygons = [];
let currentId = null;
let mode = 'normal';
let cameraIdsUsed = new Set();
let sensorIdsUsed = new Set();
let modules = [];
let cameraModules = []; // Array to store sensor data for the current camera
const updateInterval = 5000; // 5 seconds
const refreshInterval = 50; // 0.05 seconds for sensor refresh
const refreshSidebarInterval = 500; // 0.5 seconds for table refresh
let currentCameraId = null; // Store the current camera ID
let promptShown = false; // Flag to indicate if the prompt has been shown
let popupUpdateInterval = null; // Interval for updating popup content

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    fetchModules();
    setInterval(fetchModules, updateInterval);
    setInterval(refreshData, refreshInterval); // Refresh data every refreshInterval
    setInterval(refreshSidebar, refreshSidebarInterval); // Refresh table every 0.5 seconds
});

function initMap() {
    map = L.map('map').setView([45.490807, 8.549812], 15); // Center on Novara, near San Pietro Mosezzo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const polygonData = [
        {
            coordinates: [
                [45.487977, 8.550235],
                [45.487420, 8.550195], //4
                [45.487364, 8.548792], //3,4
                [45.487754, 8.548593],
                [45.487763, 8.548050],
                [45.488200, 8.547944],
                [45.487995, 8.546567],
                [45.489694, 8.546077], //6
                [45.489703, 8.547772], //6
                [45.492367, 8.548355], //6,7
                [45.491903, 8.549652] //7
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 1",
            cameraId: 1
        },
        {
            coordinates: [
                [45.491861, 8.549748],
                [45.491928, 8.551850],
                [45.489610, 8.552088],
                [45.489647, 8.552949],
                [45.488320, 8.552684],
                [45.487977, 8.550235]
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 2",
            cameraId: 2
        },

        {
            coordinates: [
                [45.487364, 8.548792], //1
                [45.486943, 8.548784],
                [45.486709, 8.548580],
                [45.482811, 8.549048],
                [45.483253, 8.545491],
                [45.485841, 8.545468],
                [45.485841, 8.545468],
                [45.485368, 8.547449]
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 3",
            cameraId: 3
        },

        {
            coordinates: [
                [45.487364, 8.548792], 
                [45.486943, 8.548784],
                [45.486709, 8.548580],
                [45.482811, 8.549048],
                [45.482400, 8.551546], //5
                [45.487356, 8.551321], //5
                [45.487420, 8.550195]  //1
            
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 4",
            cameraId: 4
        },

        {
            coordinates: [
                [45.482400, 8.551546], //4
                [45.487356, 8.551321], //4
                [45.487514, 8.552357],
                [45.487782, 8.554631],
                [45.486315, 8.554721],
                [45.486267, 8.554270],
                [45.483758, 8.554293],
                [45.483758, 8.556184],
                [45.482953, 8.556476],
                [45.482511, 8.556296],
                [45.481674, 8.556544]
               
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 5",
            cameraId: 5
        },

        {
            coordinates: [
                [45.496176, 8.549026], //9
                [45.496149, 8.546451],
                [45.495375, 8.546471],
                [45.489694, 8.546077], //1
                [45.489703, 8.547772], //1
                [45.492367, 8.548355], //1,7
                [45.495124, 8.548967] //7,9 
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 6",
            cameraId: 6
        },


        {
            coordinates: [
                [45.495095, 8.554192], //8, 11
                [45.492949, 8.553809], //8
                [45.493074, 8.550002],
                [45.491903, 8.549652], //1
                [45.492367, 8.548355], //1,6
                [45.495124, 8.548967], //6,9
                [45.494872, 8.549754], //9
                [45.496217, 8.550045], //9
                [45.496090, 8.552228], //9
                [45.495914, 8.553069],
                [45.495564, 8.553773] //11
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 7",
            cameraId: 7
        },

        {
            coordinates: [
                [45.490416, 8.554107],
                [45.490446, 8.555298],
                [45.495095, 8.555212], //11
                [45.495095, 8.554192], //11, //7
                [45.492949, 8.553809], //7
                [45.492145, 8.553639]
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 8",
            cameraId: 8
        },

        {
            coordinates: [
                [45.496176, 8.549026], //6
                [45.497160, 8.549321],
                [45.497242, 8.550094],
                [45.499267, 8.550371],
                [45.499195, 8.552036], //10
                [45.498821, 8.552097], //10
                [45.498475, 8.552118], //10
                [45.498432, 8.552447], //10
                [45.496090, 8.552228], //7
                [45.496217, 8.550045], //7
                [45.494872, 8.549754], //7
                [45.495124, 8.548967] //6,7    
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 9",
            cameraId: 9
        },

        {
            coordinates: [
                [45.499195, 8.552036], //9
                [45.498821, 8.552097], //9
                [45.498475, 8.552118], //9
                [45.498432, 8.552447], //9
                [45.498373, 8.553498], 
                [45.496872, 8.553413],
                [45.496872, 8.553884], //11
                [45.498704, 8.554055] //11
                
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 10",
            cameraId: 10
        },

        {
            coordinates: [
                [45.498704, 8.554055], //10
                [45.498644, 8.556048], 
                [45.497698, 8.556112],
                [45.496753, 8.556152],
                [45.495084, 8.556022],
                [45.495095, 8.555212], //8
                [45.495095, 8.554192], //8,7
                [45.495564, 8.553773] //7
                
            ],
            depth: 0,
            temperature: 0,
            label: "Camera ID: 11",
            cameraId: 11
        }
    ];

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
                        camera: data.cameraId // Associate the sensor with the camera ID
                    };
                    updateModule(sensorId, moduleData);
                    sensorIdsUsed.add(sensorId);
                } else {
                    alert(`ERROR: Sensor ID ${sensorId} is already used or invalid.`);
                }
            } else if (mode === 'set_camera') {
                let cameraId = prompt(`Enter camera ID:`);
                if (cameraId && !cameraIdsUsed.has(cameraId)) {
                    data.cameraId = cameraId;
                    cameraIdsUsed.add(cameraId);
                    data.label = `Camera ID: ${cameraId}`;
                    polygon.bindPopup(data.label).openPopup();
                } else {
                    alert(`ERROR: Camera ID ${cameraId} is already used or invalid.`);
                }
            } else if (mode === 'data') {
                displaySensorData(data.cameraId);
                map.fitBounds(polygon.getBounds());
            }

            setTimeout(() => promptShown = false, 500); // Reset the flag after 0.5 seconds
        });

        polygon.on('popupopen', function() {
            // Start the interval to update the popup content
            popupUpdateInterval = setInterval(() => {
                updatePopupContent(polygon, data);
            }, refreshInterval);
        });

        polygon.on('popupclose', function() {
            // Clear the interval when the popup is closed
            clearInterval(popupUpdateInterval);
        });

        polygons.push({ polygon, data });
    });

    // Update colors and markers initially
    updateColorsAndMarkers();
}

function updatePopupContent(polygon, data) {
    const moduleData = modules.filter(module => module.camera === data.cameraId);
    const moduleWithTemperature = moduleData.filter(mod => mod.temperature !== 0);
    if (moduleData.length > 0) {
        const avgDepth = moduleData.reduce((acc, mod) => acc + mod.depth, 0) / moduleData.length;
        data.depth = avgDepth;
        let avgTemp = 'N/A';
        if (moduleWithTemperature.length > 0) {
            const avgTemperature = moduleWithTemperature.reduce((acc, mod) => acc + mod.temperature, 0) / moduleWithTemperature.length;
            data.temperature = avgTemperature;
            avgTemp = avgTemperature.toFixed(2);
        }

        const avgDepthCm = (avgDepth * 100).toFixed(2);
        const popupContent = `
            <div>
                <strong>Camera ${data.cameraId}</strong><br>
                Average Water Level: ${avgDepthCm} cm<br>
                Temperature: ${avgTemp} °C
            </div>
        `;
        polygon.setPopupContent(popupContent);
    } else {
        const popupContent = `
            <div>
                <strong>Camera ${data.cameraId}</strong><br>
                No data available
            </div>
        `;
        polygon.setPopupContent(popupContent);
    }
}

function displaySensorData(cameraId) {
    currentCameraId = cameraId; // Store the current camera ID
    updateCameraModules(cameraId); // Update cameraModules array with the latest data
    refreshSidebar(); // Update the sidebar
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

function refreshData() {
  fetch('/api/refresh_data')
      .then(response => response.json())
      .then(data => {
          // Process the refreshed data if needed
          console.log('Data refreshed:', data);
      })
      .catch(error => console.error('Error refreshing data:', error));
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
            data.depth = avgDepth;
            if(moduleWithTemperature.length>0){
                const avgTemperature = moduleWithTemperature.reduce((acc, mod) => acc + mod.temperature, 0) / moduleWithTemperature.length;
                data.temperature=avgTemperature;
            }

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
        else {
            polygon.setStyle({
                fillOpacity: 0
            });
            polygon._path.classList.remove('blinking');
            
            polygon.on('click', () => {
                const popupContent = `
                    <div>
                        <strong>Camera ${data.cameraId}</strong><br>
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
                // Remove the marker from the map
                const module = modules.find(m => m.id === moduleId);
                if (module && module.marker) {
                    map.removeLayer(module.marker);
                }
                sensorIdsUsed.delete(moduleId.toString());
                const moduleData = {
                    location: { lat: 0, lng: 0 },
                    camera: 0 
                };
                updateModule(moduleId, moduleData);
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
        const green = Math.round(255 * (1 - ratio)); // Decrease green for more intense red
        const blue = Math.round(255 * (1 - ratio)); // Decrease blue for more intense red
        return `rgb(${red},${green},${blue})`; // Shade of red to white
    } else {
        const blue = 255;
        const green = Math.round(255 * (1 - ratio)); // Decrease green for more intense blue
        const red = Math.round(255 * (1 - ratio)); // Decrease red for more intense blue
        return `rgb(${red},${green},${blue})`; // Shade of blue to white
    }
}
