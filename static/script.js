const fileInput = document.getElementById('file-input');
const mainSection = document.getElementById('main-section');
const uploadSection = document.getElementById('upload-section');
const fileDisplay = document.getElementById('file-display');
const splitSizeInput = document.getElementById('split-size-input');
const splitCountInput = document.getElementById('split-count-input');
const partitionsInput = document.getElementById('partitions-input');
const splitBtn = document.getElementById('split-btn');
const status = document.getElementById('status');
const downloadSection = document.getElementById('download-section');
const downloadLink = document.getElementById('download-link');
const resetBtn = document.getElementById('reset-btn');

let selectedFile = null;
let totalPages = 0;

fileInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        selectedFile = files[0];
        
        // Auto-analyze
        uploadSection.classList.add('hidden');
        status.classList.remove('hidden');
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            totalPages = data.page_count;
            
            fileDisplay.textContent = `File: ${selectedFile.name} (${totalPages} pages)`;
            status.classList.add('hidden');
            mainSection.classList.remove('hidden');
        } catch (err) {
            alert('Analysis failed: ' + err.message);
            location.reload();
        }
    }
});

// Clear other inputs when one is used
splitSizeInput.addEventListener('input', () => {
    splitCountInput.value = '';
    partitionsInput.value = '';
});

splitCountInput.addEventListener('input', () => {
    splitSizeInput.value = '';
    partitionsInput.value = '';
});

partitionsInput.addEventListener('input', () => {
    splitSizeInput.value = '';
    splitCountInput.value = '';
});

function calculatePartitions() {
    // If manual override exists, use it
    if (partitionsInput.value.trim()) {
        return partitionsInput.value.trim();
    }

    // Split by page size
    if (splitSizeInput.value) {
        const size = parseInt(splitSizeInput.value);
        if (isNaN(size) || size <= 0) return null;
        
        let ranges = [];
        for (let i = 1; i <= totalPages; i += size) {
            let end = Math.min(i + size - 1, totalPages);
            ranges.push(`${i}-${end}`);
        }
        return ranges.join(', ');
    }

    // Split by count of parts
    if (splitCountInput.value) {
        const count = parseInt(splitCountInput.value);
        if (isNaN(count) || count <= 0) return null;
        
        const size = Math.ceil(totalPages / count);
        let ranges = [];
        for (let i = 1; i <= totalPages; i += size) {
            let end = Math.min(i + size - 1, totalPages);
            if (ranges.length === count - 1) {
                ranges.push(`${i}-${totalPages}`);
                break;
            }
            ranges.push(`${i}-${end}`);
        }
        return ranges.join(', ');
    }

    return null;
}

splitBtn.addEventListener('click', async () => {
    const partitions = calculatePartitions();
    
    if (!partitions) {
        alert('Please provide a split configuration.');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('partitions', partitions);

    mainSection.classList.add('hidden');
    status.classList.remove('hidden');

    try {
        const response = await fetch('/split', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail);
        }

        const data = await response.json();
        status.classList.add('hidden');
        downloadSection.classList.remove('hidden');
        downloadLink.href = data.zip_url;

    } catch (err) {
        alert('Split failed: ' + err.message);
        status.classList.add('hidden');
        mainSection.classList.remove('hidden');
    }
});

resetBtn.addEventListener('click', () => {
    location.reload();
});
