document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const workspace = document.getElementById('workspace');
    const logoImage = document.getElementById('logo-image');
    
    const circle = document.getElementById('checker-circle');
    const sizeSlider = document.getElementById('size-slider');
    const weightSlider = document.getElementById('border-weight');
    const colorPicker = document.getElementById('border-color');
    const colorHex = document.getElementById('color-hex');
    const centerMark = document.querySelector('.circle-center-mark');
    
    const resetBtn = document.getElementById('reset-btn');
    const newImageBtn = document.getElementById('new-image-btn');
    const resizeHandle = document.querySelector('.resize-handle');

    let currentSize = 300;
    let isDragging = false;
    let isResizing = false;
    
    // Circle state
    let startX, startY, initialLeft, initialTop, initialSize;

    // --- File Handling ---
    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Vui lòng chọn một file ảnh!');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            logoImage.src = e.target.result;
            dropZone.style.display = 'none';
            workspace.classList.remove('hidden');
            resetCircle();
        };
        reader.readAsDataURL(file);
    };

    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if(e.target.files.length) handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if(e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    // --- Circle Dragging ---
    circle.addEventListener('mousedown', (e) => {
        if(e.target === resizeHandle) return; // Ignore if clicking resize handle
        isDragging = true;
        
        // Calculate offset from transform
        const rect = circle.getBoundingClientRect();
        
        // Update to use absolute positioning instead of transform for easier dragging
        if (circle.style.transform) {
            circle.style.left = rect.left + rect.width / 2 + 'px';
            circle.style.top = rect.top + rect.height / 2 + 'px';
            circle.style.transform = 'translate(-50%, -50%)';
        }
        
        startX = e.clientX;
        startY = e.clientY;
        
        // Extract current left/top (ignoring translate)
        const computedStyle = window.getComputedStyle(circle);
        initialLeft = parseFloat(computedStyle.left);
        initialTop = parseFloat(computedStyle.top);
    });

    // --- Circle Resizing via Handle ---
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        initialSize = currentSize;
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            circle.style.left = `${initialLeft + dx}px`;
            circle.style.top = `${initialTop + dy}px`;
        } else if (isResizing) {
            const dx = e.clientX - startX;
            // Rough mapping of mouse movement to size increase
            let newSize = initialSize + dx * 2;
            updateCircleSize(newSize);
            sizeSlider.value = newSize;
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });

    // --- Mouse Wheel Zooming on Circle ---
    circle.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = Math.sign(e.deltaY) * -1;
        let newSize = currentSize + delta * 20; // 20px per scroll click
        updateCircleSize(newSize);
        sizeSlider.value = newSize;
    });

    // --- Controls ---
    const updateCircleSize = (size) => {
        size = Math.max(50, Math.min(1000, size));
        currentSize = size;
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
    };

    sizeSlider.addEventListener('input', (e) => {
        updateCircleSize(parseInt(e.target.value));
    });

    weightSlider.addEventListener('input', (e) => {
        circle.style.borderWidth = `${e.target.value}px`;
    });

    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        circle.style.borderColor = color;
        centerMark.style.color = color;
        colorHex.textContent = color;
    });
    
    // Initialize color mark
    centerMark.style.color = colorPicker.value;

    const resetCircle = () => {
        circle.style.left = '50%';
        circle.style.top = '50%';
        circle.style.transform = 'translate(-50%, -50%)';
        updateCircleSize(300);
        sizeSlider.value = 300;
    };

    resetBtn.addEventListener('click', resetCircle);

    newImageBtn.addEventListener('click', () => {
        workspace.classList.add('hidden');
        dropZone.style.display = 'flex';
        fileInput.value = '';
    });
});
