const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const fileNameSpan = document.querySelector('.file-name');
const controls = document.getElementById('controls');
const status = document.getElementById('status');
const downloadPanel = document.getElementById('download-panel');
const downloadLink = document.getElementById('download-link');
const splitBtn = document.getElementById('split-btn');
const partitionsInput = document.getElementById('partitions-input');
const resetBtn = document.getElementById('reset-btn');

let selectedFile = null;

// Drag and Drop
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0 && files[0].type === 'application/pdf') {
        selectedFile = files[0];
        fileNameSpan.textContent = selectedFile.name;
        
        // Hide upload, show info and controls
        dropZone.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        controls.classList.remove('hidden');
    } else {
        alert('Please select a valid PDF file.');
    }
}

splitBtn.addEventListener('click', async () => {
    const partitions = partitionsInput.value.trim();
    if (!partitions) {
        alert('Please enter partition ranges (e.g., 1-5, 6-)');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('partitions', partitions);

    // Update UI
    controls.classList.add('hidden');
    status.classList.remove('hidden');

    try {
        const response = await fetch('/split', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to split PDF');
        }

        const data = await response.json();
        
        // Show download panel
        status.classList.add('hidden');
        downloadPanel.classList.remove('hidden');
        downloadLink.href = data.zip_url;

    } catch (err) {
        alert('Error: ' + err.message);
        status.classList.add('hidden');
        controls.classList.remove('hidden');
    }
});

resetBtn.addEventListener('click', () => {
    location.reload();
});
