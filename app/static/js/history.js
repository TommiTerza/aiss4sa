let timestamps = [];
let depths = [];
let temperatures = [];
let depthChart;
let temperatureChart;

document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    fetchHistoryData();
    setInterval(fetchHistoryData, 20000); // Update every 20 seconds
});

function fetchHistoryData() {
    const timeRange = '1'; // Default to 1 day, or use a dropdown for selecting time range

    fetch(`/api/history/${cameraId}?days=${timeRange}`)
        .then(response => response.json())
        .then(data => {
            timestamps = data.map(entry => new Date(entry.timestamp));
            depths = data.map(entry => entry.depth * 100); // Convert to cm
            temperatures = data.map(entry => entry.temperature);
            updateCharts();
        })
        .catch(error => console.error('Error fetching history:', error));
}

function initializeCharts() {
    const depthCtx = document.getElementById('depthGraph').getContext('2d');
    const temperatureCtx = document.getElementById('temperatureGraph').getContext('2d');

    depthChart = new Chart(depthCtx, {
        type: 'bar',
        data: {
            labels: timestamps,
            datasets: [
                {
                    label: 'Water Level (cm)',
                    data: depths,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    yAxisID: 'y-axis-depth'
                }
            ]
        },
        options: {
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                    zoom: {
                        enabled: true,
                        mode: 'x',
                    }
                },
                tooltip: {
                    mode: 'nearest'
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: parseFloat(document.getElementById('thresholdInput') ? document.getElementById('thresholdInput').value : 0),
                            yMax: parseFloat(document.getElementById('thresholdInput') ? document.getElementById('thresholdInput').value : 0),
                            borderColor: 'rgb(255, 99, 132)',
                            borderWidth: 2,
                            label: {
                                content: 'Threshold',
                                enabled: true,
                                position: 'center'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        tooltipFormat: 'MMM D, HH:mm',
                        displayFormats: {
                            minute: 'HH:mm',
                            hour: 'MMM D, HH:mm'
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    temperatureChart = new Chart(temperatureCtx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatures,
                    borderColor: 'rgba(255, 0, 0, 1)',
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                    fill: false,
                    yAxisID: 'y-axis-temperature'
                }
            ]
        },
        options: {
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                    zoom: {
                        enabled: true,
                        mode: 'x',
                    }
                },
                tooltip: {
                    mode: 'nearest'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        tooltipFormat: 'MMM D, HH:mm',
                        displayFormats: {
                            minute: 'HH:mm',
                            hour: 'MMM D, HH:mm'
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCharts() {
    depthChart.data.labels = timestamps;
    depthChart.data.datasets[0].data = depths;
    depthChart.update();

    temperatureChart.data.labels = timestamps;
    temperatureChart.data.datasets[0].data = temperatures;
    temperatureChart.update();
}
