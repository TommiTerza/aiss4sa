window.onload = function() {
    initMap();

    document.getElementById('thresholdInput').addEventListener('change', function() {
        let thresholdValue = parseFloat(this.value);
        if (thresholdValue < 0) {
            alert('Threshold value cannot be negative. Resetting to 0.');
            thresholdValue = 0;
            this.value = 0;
        }
        if (mode === 'data' || mode === 'normal' || mode=='set_sensor' || mode=='set_camera') {
            updateColorsAndMarkers();
        }
    });

    const modal = document.getElementById('historyModal');
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    setInterval(fetchModules, updateInterval); // Fetch updated data every 5 seconds
};

function setNormalMode() {
    mode = 'normal';
    document.getElementById('okButton').style.display = 'none';
    currentId = null; // Reset the ID
    updateColorsAndMarkers(); // Update polygons in normal mode as well
}

function setSensorMode() {
    mode = 'set_sensor';
    document.getElementById('okButton').style.display = 'inline-block';
    currentId = null; // Reset the ID
}

function setCameraMode() {
    mode = 'set_camera';
    document.getElementById('okButton').style.display = 'inline-block';
    currentId = null; // Reset the ID
}

function setDataMode() {
    mode = 'data';
    document.getElementById('okButton').style.display = 'none';
    currentId = null; // Reset the ID
    fetchModules();
}
