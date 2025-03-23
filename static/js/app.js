document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const svgItems = document.querySelectorAll(".svg-item");
  const uploadSvgInput = document.getElementById("upload-svg");
  const canvas = document.getElementById("canvas");
  const svgSizeSlider = document.getElementById("svg-size");
  const svgSizeInput = document.getElementById("svg-size-input");
  const svgColorInput = document.getElementById("svg-color");
  const cutoutModeCheckbox = document.getElementById("cutout-mode");
  const svgOpacitySlider = document.getElementById("svg-opacity");
  const svgOpacityInput = document.getElementById("svg-opacity-input");
  const canvasWidthInput = document.getElementById("canvas-width");
  const canvasHeightInput = document.getElementById("canvas-height");
  const bgColorInput = document.getElementById("bg-color");
  const transparentBgCheckbox = document.getElementById("transparent-bg");
  const positionXInput = document.getElementById("position-x");
  const positionYInput = document.getElementById("position-y");
  const positionCenter = document.getElementById("position-center");
  const positionHCenter = document.getElementById("position-h-center");
  const positionVCenter = document.getElementById("position-v-center");
  const positionTop = document.getElementById("position-top");
  const positionBottom = document.getElementById("position-bottom");
  const positionLeft = document.getElementById("position-left");
  const positionRight = document.getElementById("position-right");
  const uploadBgImageInput = document.getElementById("upload-bg-image");
  const resetBgImageBtn = document.getElementById("reset-bg-image");
  const canvasSizeControls = document.querySelectorAll(".canvas-size-control");
  const exportFormatSelect = document.getElementById("export-format");
  const exportBtn = document.getElementById("export-btn");

  // Custom color picker elements
  const customSvgColorBtn = document.getElementById("custom-svg-color-btn");
  const svgColorCustomContainer = document.getElementById(
    "svg-color-custom-container"
  );
  const svgColorHex = document.getElementById("svg-color-hex");

  const customBgColorBtn = document.getElementById("custom-bg-color-btn");
  const bgColorCustomContainer = document.getElementById(
    "bg-color-custom-container"
  );
  const bgColorHex = document.getElementById("bg-color-hex");

  // State
  let currentState = {
    selectedSvg: null,
    svgElement: null,
    svgSize: 20, // Hard-coded to 20% default size
    originalSvgWidth: 100,
    originalSvgHeight: 100,
    svgWidth: 100,
    svgHeight: 100,
    svgColor: svgColorInput.value,
    svgOpacity: parseFloat(svgOpacitySlider.value) / 100,
    cutoutMode: cutoutModeCheckbox.checked,
    canvasWidth: parseInt(canvasWidthInput.value),
    canvasHeight: parseInt(canvasHeightInput.value),
    bgColor: bgColorInput.value,
    transparentBg: transparentBgCheckbox.checked,
    bgImage: null,
    bgImageUrl: null,
    position: { x: 0, y: 0 },
    exportFormat: exportFormatSelect.value,
  };

  // Initialize canvas size
  updateCanvasSize();

  // Ensure slider and input display the correct default value
  svgSizeSlider.value = 20;
  svgSizeInput.value = 20;

  // Event listeners
  svgItems.forEach((item) => {
    item.addEventListener("click", () => selectSVG(item.dataset.filename));
  });

  uploadSvgInput.addEventListener("change", uploadSVG);

  // Sync size slider and input
  svgSizeSlider.addEventListener("input", () => {
    const size = parseFloat(svgSizeSlider.value);
    svgSizeInput.value = size;
    updateSVGSize(size);
  });

  svgSizeInput.addEventListener("change", () => {
    let size = parseFloat(svgSizeInput.value);
    // Ensure value is within range
    size = Math.max(10, Math.min(100, size));
    svgSizeInput.value = size;
    svgSizeSlider.value = size;
    updateSVGSize(size);
  });

  function updateSVGSize(sizePercent) {
    currentState.svgSize = sizePercent;
    // Calculate SVG dimensions based on canvas size (not original SVG size)
    currentState.svgWidth = (currentState.canvasWidth * sizePercent) / 100;
    currentState.svgHeight = (currentState.canvasHeight * sizePercent) / 100;
    updateSVG();
  }

  // Custom color picker toggle functionality
  customSvgColorBtn.addEventListener("click", () => {
    svgColorCustomContainer.style.display =
      svgColorCustomContainer.style.display === "none" ? "block" : "none";
    if (svgColorCustomContainer.style.display === "block") {
      // Just set the hex value
      svgColorHex.value = svgColorInput.value;
    }
  });

  customBgColorBtn.addEventListener("click", () => {
    bgColorCustomContainer.style.display =
      bgColorCustomContainer.style.display === "none" ? "block" : "none";
    if (bgColorCustomContainer.style.display === "block") {
      // Just set the hex value
      bgColorHex.value = bgColorInput.value;
    }
  });

  // Color input event handlers for SVG color
  svgColorInput.addEventListener("input", () => {
    currentState.svgColor = svgColorInput.value;
    updateSVG();

    // Update custom color input if visible
    if (svgColorCustomContainer.style.display === "block") {
      svgColorHex.value = svgColorInput.value;
    }
  });

  svgColorHex.addEventListener("input", () => {
    if (isValidHex(svgColorHex.value)) {
      svgColorInput.value = svgColorHex.value;
      currentState.svgColor = svgColorHex.value;
      updateSVG();
    }
  });

  // Color input event handlers for background color
  bgColorInput.addEventListener("input", () => {
    currentState.bgColor = bgColorInput.value;
    updateCanvasBackground();

    // Update custom color input if visible
    if (bgColorCustomContainer.style.display === "block") {
      bgColorHex.value = bgColorInput.value;
    }
  });

  bgColorHex.addEventListener("input", () => {
    if (isValidHex(bgColorHex.value)) {
      bgColorInput.value = bgColorHex.value;
      currentState.bgColor = bgColorHex.value;
      updateCanvasBackground();
    }
  });

  // Replace existing bgColorInput event listener
  bgColorInput.removeEventListener("change", () => {
    currentState.bgColor = bgColorInput.value;
    updateCanvasBackground();
  });

  // Color utility functions
  function isValidHex(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
  }

  cutoutModeCheckbox.addEventListener("change", () => {
    currentState.cutoutMode = cutoutModeCheckbox.checked;

    // If cutout mode is enabled, disable the color picker and opacity controls
    if (currentState.cutoutMode) {
      svgColorInput.disabled = true;
      svgOpacitySlider.disabled = true;
      svgOpacityInput.disabled = true;
    } else {
      svgColorInput.disabled = false;
      svgOpacitySlider.disabled = false;
      svgOpacityInput.disabled = false;
    }

    updateSVG();
  });

  // Sync opacity slider and input
  svgOpacitySlider.addEventListener("input", () => {
    const opacity = parseFloat(svgOpacitySlider.value);
    svgOpacityInput.value = opacity;
    currentState.svgOpacity = opacity / 100;
    updateSVG();
  });

  svgOpacityInput.addEventListener("change", () => {
    let opacity = parseFloat(svgOpacityInput.value);
    // Ensure value is within range
    opacity = Math.max(0, Math.min(100, opacity));
    svgOpacityInput.value = opacity;
    svgOpacitySlider.value = opacity;
    currentState.svgOpacity = opacity / 100;
    updateSVG();
  });

  canvasWidthInput.addEventListener("change", () => {
    currentState.canvasWidth = parseInt(canvasWidthInput.value);
    updateCanvasSize();
  });

  canvasHeightInput.addEventListener("change", () => {
    currentState.canvasHeight = parseInt(canvasHeightInput.value);
    updateCanvasSize();
  });

  transparentBgCheckbox.addEventListener("change", () => {
    currentState.transparentBg = transparentBgCheckbox.checked;

    // Disable/enable background color picker based on transparent bg setting
    if (currentState.transparentBg) {
      bgColorInput.disabled = true;
    } else {
      bgColorInput.disabled = false;
    }

    updateCanvasBackground();
  });

  // Position X and Y event listeners
  positionXInput.addEventListener("change", () => {
    const x = parseInt(positionXInput.value);
    // Keep within canvas bounds
    const maxX = currentState.canvasWidth - currentState.svgWidth;
    currentState.position.x = Math.max(0, Math.min(x, maxX));
    positionXInput.value = currentState.position.x;
    updateSVGPosition();
  });

  positionYInput.addEventListener("change", () => {
    const y = parseInt(positionYInput.value);
    // Keep within canvas bounds
    const maxY = currentState.canvasHeight - currentState.svgHeight;
    currentState.position.y = Math.max(0, Math.min(y, maxY));
    positionYInput.value = currentState.position.y;
    updateSVGPosition();
  });

  // Background image functionality
  uploadBgImageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create FormData to send to server
    const formData = new FormData();
    formData.append("file", file);

    // Show loading state (could add a loading indicator here)

    fetch("/upload-bg-image", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        // Set the background image URL from server response
        currentState.bgImageUrl = data.url;

        // Create an image element to get dimensions
        const img = new Image();
        img.onload = function () {
          currentState.bgImage = img;

          // Save old canvas dimensions to calculate size ratio
          const oldWidth = currentState.canvasWidth;
          const oldHeight = currentState.canvasHeight;

          // Set canvas dimensions to match the image
          currentState.canvasWidth = img.width;
          currentState.canvasHeight = img.height;

          // Update inputs
          canvasWidthInput.value = img.width;
          canvasHeightInput.value = img.height;

          // Disable canvas size controls
          canvasSizeControls.forEach((control) => {
            control.classList.add("disabled");
          });

          // If we already have an SVG loaded, update its size relative to the new canvas
          if (currentState.svgElement) {
            // Maintain the same percentage of canvas size
            // The SVG width and height will be updated inside updateSVGSize
            updateSVGSize(currentState.svgSize);

            // Center the SVG on the new canvas
            centerSVG();
          }

          // Update canvas with new background
          updateCanvasSize();
          updateCanvasBackground();
        };

        img.src = currentState.bgImageUrl;
      })
      .catch((error) => {
        console.error("Error uploading background image:", error);
        alert("Error uploading background image. Please try again.");
      });
  });

  resetBgImageBtn.addEventListener("click", () => {
    // Reset background image
    currentState.bgImage = null;
    currentState.bgImageUrl = null;

    // Re-enable canvas size controls
    canvasSizeControls.forEach((control) => {
      control.classList.remove("disabled");
    });

    // Reset the file input
    uploadBgImageInput.value = "";

    // Update canvas background
    updateCanvasBackground();
  });

  positionCenter.addEventListener("click", centerSVG);
  positionHCenter.addEventListener("click", () => positionSVG("h-center"));
  positionVCenter.addEventListener("click", () => positionSVG("v-center"));
  positionTop.addEventListener("click", () => positionSVG("top"));
  positionBottom.addEventListener("click", () => positionSVG("bottom"));
  positionLeft.addEventListener("click", () => positionSVG("left"));
  positionRight.addEventListener("click", () => positionSVG("right"));

  exportFormatSelect.addEventListener("change", () => {
    currentState.exportFormat = exportFormatSelect.value;
  });

  exportBtn.addEventListener("click", exportImage);

  // Implement drag-and-drop positioning
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  canvas.addEventListener("mousedown", (e) => {
    // Only proceed if we have an SVG element
    if (!currentState.svgElement) return;

    // Get the SVG container
    const svgContainer = canvas.querySelector(".svg-container");
    if (!svgContainer) return;

    // Check if the click is within the SVG container bounds
    const svgRect = svgContainer.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    if (
      e.clientX >= svgRect.left &&
      e.clientX <= svgRect.right &&
      e.clientY >= svgRect.top &&
      e.clientY <= svgRect.bottom
    ) {
      isDragging = true;

      // Calculate the scale ratio between actual canvas size and displayed size
      const scaleX = currentState.canvasWidth / canvasRect.width;

      // Calculate proper offsets considering the scaling
      dragOffsetX = (e.clientX - svgRect.left) * scaleX;
      dragOffsetY = (e.clientY - svgRect.top) * scaleX;

      e.preventDefault();
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging || !currentState.svgElement) return;

    const canvasRect = canvas.getBoundingClientRect();

    // Calculate the scale ratio between actual canvas size and displayed size
    const scaleX = currentState.canvasWidth / canvasRect.width;
    const scaleY = currentState.canvasHeight / canvasRect.height;

    // Adjust the mouse position based on scaling
    const adjustedX = (e.clientX - canvasRect.left) * scaleX;
    const adjustedY = (e.clientY - canvasRect.top) * scaleY;

    // Calculate new position considering the scaling
    const newX = adjustedX - dragOffsetX;
    const newY = adjustedY - dragOffsetY;

    // Keep within canvas bounds
    const maxX = currentState.canvasWidth - currentState.svgWidth;
    const maxY = currentState.canvasHeight - currentState.svgHeight;

    currentState.position.x = Math.max(0, Math.min(newX, maxX));
    currentState.position.y = Math.max(0, Math.min(newY, maxY));

    // Update position
    updateSVGPosition();

    e.preventDefault();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Functions
  function selectSVG(filename) {
    // Clear active class from all items
    svgItems.forEach((item) => item.classList.remove("active"));

    // Add active class to selected item
    const selectedItem = document.querySelector(
      `.svg-item[data-filename="${filename}"]`
    );
    if (selectedItem) {
      selectedItem.classList.add("active");
    }

    // Save current position before loading new SVG
    const previousPosition = { ...currentState.position };

    // ALWAYS treat as first SVG for sizing purposes to ensure 20% size is applied
    const isFirstSvg = true;

    // Update state
    currentState.selectedSvg = filename;

    // Remove any existing SVG-related elements
    const existingSvgContainer = canvas.querySelector(".svg-container");
    if (existingSvgContainer) {
      canvas.removeChild(existingSvgContainer);
    }

    // Load SVG
    fetch(`/svgs/${filename}`)
      .then((response) => response.text())
      .then((svgContent) => {
        // Create SVG element
        if (currentState.svgElement) {
          if (currentState.svgElement.parentNode === canvas) {
            canvas.removeChild(currentState.svgElement);
          }
        }

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
        const svgElement = svgDoc.documentElement;

        // Get original dimensions from the SVG
        const width = parseFloat(svgElement.getAttribute("width") || 100);
        const height = parseFloat(svgElement.getAttribute("height") || 100);

        // Store original dimensions
        currentState.originalSvgWidth = width;
        currentState.originalSvgHeight = height;

        // ALWAYS FORCE 20% SIZE - NO CALCULATION
        // Set a fixed 20% size for all SVGs
        currentState.svgSize = 20;
        svgSizeSlider.value = 20;
        svgSizeInput.value = 20;

        // Calculate width and height based on fixed 20% of canvas
        currentState.svgWidth = (currentState.canvasWidth * 20) / 100;
        currentState.svgHeight = (currentState.canvasHeight * 20) / 100;

        // Remove any existing SVG viewBox/width/height attributes - we'll control these
        svgElement.removeAttribute("width");
        svgElement.removeAttribute("height");
        svgElement.style.width = `${currentState.svgWidth}px`;
        svgElement.style.height = `${currentState.svgHeight}px`;
        svgElement.style.position = "absolute";
        // Don't hide the original SVG yet - updateSVG will handle displaying the proper element
        // svgElement.style.display = "none";

        // Add to canvas
        canvas.appendChild(svgElement);
        currentState.svgElement = svgElement;

        // Apply current settings (this will create the proper SVG container)
        updateSVG();

        // Position handling - only center if this is the first SVG loaded
        if (isFirstSvg) {
          centerSVG(); // Center only for the first SVG loaded
        } else {
          // Use previous position, but check if it's valid with new SVG dimensions
          const maxX = currentState.canvasWidth - currentState.svgWidth;
          const maxY = currentState.canvasHeight - currentState.svgHeight;

          // Ensure position is within bounds for the new SVG dimensions
          currentState.position.x = Math.max(
            0,
            Math.min(previousPosition.x, maxX)
          );
          currentState.position.y = Math.max(
            0,
            Math.min(previousPosition.y, maxY)
          );
          updateSVGPosition();
        }
      })
      .catch((error) => {
        console.error("Error loading SVG:", error);
      });
  }

  function uploadSVG(event) {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith(".svg")) {
      alert("Please select a valid SVG file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("/upload-svg", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          // Always reset the SVG element to force new size calculation
          if (currentState.svgElement) {
            if (currentState.svgElement.parentNode === canvas) {
              canvas.removeChild(currentState.svgElement);
            }
            currentState.svgElement = null;
          }

          // Remove any existing SVG container
          const existingSvgContainer = canvas.querySelector(".svg-container");
          if (existingSvgContainer) {
            canvas.removeChild(existingSvgContainer);
          }

          // Reset the size to 20% before selecting the new SVG
          currentState.svgSize = 20;
          svgSizeSlider.value = 20;
          svgSizeInput.value = 20;

          // Select the newly uploaded SVG with 20% size
          selectSVG(data.filename);
        }
      })
      .catch((error) => {
        console.error("Error uploading SVG:", error);
        alert("Error uploading SVG. Please try again.");
      });
  }

  function updateSVG() {
    if (!currentState.svgElement) return;

    // Remove existing SVG container if it exists
    const existingSvgContainer = canvas.querySelector(".svg-container");
    if (existingSvgContainer) {
      canvas.removeChild(existingSvgContainer);
    }

    // Create a new SVG container (Layer 3)
    const svgContainer = document.createElement("div");
    svgContainer.className = "svg-container";
    svgContainer.style.position = "absolute";
    svgContainer.style.top = currentState.position.y + "px";
    svgContainer.style.left = currentState.position.x + "px";
    svgContainer.style.width = currentState.svgWidth + "px";
    svgContainer.style.height = currentState.svgHeight + "px";
    svgContainer.style.zIndex = "2"; // Above background and background image

    // Add a red dotted outline for cutout mode
    if (currentState.cutoutMode) {
      svgContainer.style.border = "1px dotted #ff0000";
      svgContainer.style.boxSizing = "border-box";
      // Add a clear indicator that this is a cutout
      svgContainer.setAttribute("data-cutout", "true");
    } else {
      svgContainer.style.border = "none";
      svgContainer.removeAttribute("data-cutout");
    }

    // Clone the SVG element to avoid modifying the original
    const svgClone = currentState.svgElement.cloneNode(true);

    // Set SVG attributes
    svgClone.setAttribute("width", "100%");
    svgClone.setAttribute("height", "100%");
    svgClone.style.width = "100%";
    svgClone.style.height = "100%";
    svgClone.style.display = "block"; // Ensure the SVG is visible

    // Apply SVG color and opacity if not in cutout mode
    if (!currentState.cutoutMode) {
      // Find all shapes within the SVG and apply the color
      const shapes = svgClone.querySelectorAll(
        "path, rect, circle, ellipse, line, polyline, polygon"
      );
      shapes.forEach((shape) => {
        // Support for both hex and rgba colors
        shape.setAttribute("fill", currentState.svgColor);
        shape.removeAttribute("stroke"); // Remove any existing stroke
      });

      // Apply opacity to the entire SVG (this works for both hex and rgba)
      svgClone.style.opacity = currentState.svgOpacity;
    } else {
      // For cutout mode, we'll make the shapes invisible except for the outline
      const shapes = svgClone.querySelectorAll(
        "path, rect, circle, ellipse, line, polyline, polygon"
      );
      shapes.forEach((shape) => {
        // Make the fill completely transparent
        shape.setAttribute("fill", "rgba(0, 0, 0, 0)");

        // Add a red stroke to show the cutout boundary
        shape.setAttribute("stroke", "#ff0000");
        shape.setAttribute("stroke-width", "1.75"); // Reduced from 3.5 to 1.75 (half as thick)
        shape.setAttribute("stroke-dasharray", "8,3"); // Keeping the dash pattern the same
      });

      // Keep the SVG fully visible
      svgClone.style.opacity = 1;
    }

    // Add SVG to container
    svgContainer.appendChild(svgClone);

    // Add container to canvas
    canvas.appendChild(svgContainer);

    // Update inputs to match current position
    positionXInput.value = currentState.position.x;
    positionYInput.value = currentState.position.y;

    // Hide the original SVG element to prevent duplicates
    if (currentState.svgElement.parentNode === canvas) {
      currentState.svgElement.style.display = "none";
    }
  }

  function updateCanvasSize() {
    canvas.style.width = `${currentState.canvasWidth}px`;
    canvas.style.height = `${currentState.canvasHeight}px`;

    // Make sure canvas stays visible within container by adding max dimensions
    const canvasContainer = document.querySelector(".canvas-container");
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;

    // Reset max dimensions first
    canvas.style.maxWidth = "";
    canvas.style.maxHeight = "";

    // Check if canvas exceeds container width (accounting for padding)
    if (currentState.canvasWidth > containerWidth - 40) {
      canvas.style.maxWidth = `${containerWidth - 40}px`;
      // Calculate the appropriate scaled height to maintain aspect ratio
      const scale = (containerWidth - 40) / currentState.canvasWidth;
      canvas.style.maxHeight = `${currentState.canvasHeight * scale}px`;
    }

    // After applying width constraints, check if height still exceeds container
    if (currentState.canvasHeight > containerHeight - 40) {
      const heightScale = (containerHeight - 40) / currentState.canvasHeight;
      const currentMaxWidth = canvas.style.maxWidth
        ? parseInt(canvas.style.maxWidth)
        : currentState.canvasWidth;
      // Use the more restrictive scale
      if (
        !canvas.style.maxWidth ||
        heightScale < (containerWidth - 40) / currentState.canvasWidth
      ) {
        canvas.style.maxHeight = `${containerHeight - 40}px`;
        canvas.style.maxWidth = `${currentState.canvasWidth * heightScale}px`;
      }
    }

    if (currentState.svgElement) {
      updateSVGPosition(); // Update position after canvas resize
    }
  }

  // Add a window resize listener to handle zoom and resize events
  window.addEventListener("resize", () => {
    updateCanvasSize();
  });

  function updateCanvasBackground() {
    // Set background color or make it transparent
    if (currentState.transparentBg) {
      // Layer 1: Transparent background
      canvas.style.backgroundColor = "transparent";
      // Add a data attribute for transparency
      canvas.setAttribute("data-transparent", "true");
    } else {
      // Layer 1: Solid background color (can be hex or rgba)
      canvas.style.backgroundColor = currentState.bgColor;
      canvas.removeAttribute("data-transparent");
    }

    // Layer 2: Background image (if exists)
    if (currentState.bgImage) {
      // Create a container for the background image if it doesn't exist
      let bgImageContainer = canvas.querySelector(".bg-image-container");
      if (!bgImageContainer) {
        bgImageContainer = document.createElement("div");
        bgImageContainer.className = "bg-image-container";
        bgImageContainer.style.position = "absolute";
        bgImageContainer.style.top = "0";
        bgImageContainer.style.left = "0";
        bgImageContainer.style.width = "100%";
        bgImageContainer.style.height = "100%";
        bgImageContainer.style.zIndex = "1"; // Above background, below SVG
        canvas.appendChild(bgImageContainer);
      }

      // Set or update the background image
      bgImageContainer.style.backgroundImage = `url('${currentState.bgImageUrl}')`;
      bgImageContainer.style.backgroundSize = "cover";
      bgImageContainer.style.backgroundPosition = "center";
    } else {
      // Remove background image container if it exists
      const bgImageContainer = canvas.querySelector(".bg-image-container");
      if (bgImageContainer) {
        canvas.removeChild(bgImageContainer);
      }
    }

    // The SVG (Layer 3) is handled separately in updateSVG()
  }

  function updateSVGPosition() {
    if (!currentState.svgElement) return;

    // Update the SVG container position if it exists
    const svgContainer = canvas.querySelector(".svg-container");
    if (svgContainer) {
      svgContainer.style.top = `${currentState.position.y}px`;
      svgContainer.style.left = `${currentState.position.x}px`;

      // Log positions for debugging if needed
      // console.log(`SVG Container positioned at (${currentState.position.x}, ${currentState.position.y})`);
    } else {
      // Update the original SVG element position as fallback
      currentState.svgElement.style.left = `${currentState.position.x}px`;
      currentState.svgElement.style.top = `${currentState.position.y}px`;

      // If there's no container, call updateSVG to create one
      updateSVG();
    }

    // Update position inputs
    positionXInput.value = Math.round(currentState.position.x);
    positionYInput.value = Math.round(currentState.position.y);
  }

  function centerSVG() {
    if (!currentState.svgElement) return;

    currentState.position.x =
      (currentState.canvasWidth - currentState.svgWidth) / 2;
    currentState.position.y =
      (currentState.canvasHeight - currentState.svgHeight) / 2;
    updateSVGPosition();
  }

  function positionSVG(position) {
    if (!currentState.svgElement) return;

    switch (position) {
      case "top":
        currentState.position.y = 0;
        break;
      case "bottom":
        currentState.position.y =
          currentState.canvasHeight - currentState.svgHeight;
        break;
      case "left":
        currentState.position.x = 0;
        break;
      case "right":
        currentState.position.x =
          currentState.canvasWidth - currentState.svgWidth;
        break;
      case "h-center":
        currentState.position.x =
          (currentState.canvasWidth - currentState.svgWidth) / 2;
        break;
      case "v-center":
        currentState.position.y =
          (currentState.canvasHeight - currentState.svgHeight) / 2;
        break;
    }

    updateSVGPosition();
  }

  function exportImage() {
    console.log("Export button clicked");
    // Get format
    const format = document.getElementById("export-format").value;
    console.log("Format:", format);

    // Handle SVG rendering with HTML Canvas
    const svgContainer = document.querySelector(".svg-container");
    if (!svgContainer) {
      console.error("SVG container not found");
      alert("SVG container not found. Cannot export.");
      return;
    }

    const svgElement = svgContainer.querySelector("svg");
    if (!svgElement) {
      console.error("No SVG element found");
      alert("No SVG element found. Please add a shape first.");
      return;
    }

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true);

    // Get current editing dimensions from inspector
    const width = parseInt(document.getElementById("canvas-width").value, 10);
    const height = parseInt(document.getElementById("canvas-height").value, 10);
    console.log("Canvas dimensions:", width, height);

    // Get SVG positioning data from the form
    const svgPositionX = Math.round(
      parseInt(document.getElementById("position-x").value || 0, 10)
    );
    const svgPositionY = Math.round(
      parseInt(document.getElementById("position-y").value || 0, 10)
    );
    console.log("SVG position:", svgPositionX, svgPositionY);

    // Fix the SVG width and height calculation
    const svgSizePercent = parseFloat(
      document.getElementById("svg-size-input").value || 20
    );
    const svgWidth = Math.round((width * svgSizePercent) / 100);
    const svgHeight = Math.round((height * svgSizePercent) / 100);
    console.log("SVG dimensions:", svgWidth, svgHeight);

    // Get background preferences
    const backgroundColor = document.getElementById("bg-color").value;
    const useTransparentBackground =
      document.getElementById("transparent-bg").checked;
    console.log("Background:", backgroundColor, useTransparentBackground);

    // Create a canvas element to render the SVG
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");

    // Create a temporary hidden div to hold the SVG for canvas rendering
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.zIndex = "-1000";
    document.body.appendChild(tempDiv);

    // Create an image element to draw the SVG onto the canvas
    const img = new Image();

    // Set button state to loading
    const exportBtn = document.getElementById("export-btn");
    const originalButtonText = exportBtn.textContent;
    exportBtn.textContent = "Exporting...";
    exportBtn.disabled = true;
    console.log("Export button disabled, showing loading state");

    // Setup the SVG string
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    console.log("SVG blob created");

    // Add error handling for image loading
    img.onerror = function (e) {
      console.error("Error loading SVG image:", e);
      alert("Error processing the SVG. Please try a different SVG.");
      exportBtn.textContent = originalButtonText;
      exportBtn.disabled = false;
      URL.revokeObjectURL(url);
      document.body.removeChild(tempDiv);
    };

    // Once the image loads, draw it on canvas and send to server
    img.onload = function () {
      console.log("SVG image loaded successfully");
      try {
        // First, prepare the background
        if (!useTransparentBackground && backgroundColor !== "transparent") {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);
        }

        // Add the background image if one exists in the current state
        if (currentState.bgImage) {
          console.log("Drawing background image");
          ctx.drawImage(currentState.bgImage, 0, 0, width, height);
        }

        // For cutout mode, create a transparent hole in the shape of the SVG
        if (!currentState.cutoutMode) {
          // Normal mode - Draw the SVG at the specified position and dimensions
          console.log("Drawing SVG onto canvas in normal mode");
          ctx.drawImage(img, svgPositionX, svgPositionY, svgWidth, svgHeight);
        } else {
          // Cutout mode - Make SVG shape 100% transparent
          console.log("Creating transparent cutout for SVG shape");

          // We need to create a temporary canvas to use as a mask
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = width;
          maskCanvas.height = height;
          const maskCtx = maskCanvas.getContext("2d");

          // First, draw the SVG to the mask canvas in black
          // We'll remove all stroke attributes for the export to get just the shape
          const exportSvg = clonedSvg.cloneNode(true);
          const shapes = exportSvg.querySelectorAll(
            "path, rect, circle, ellipse, line, polyline, polygon"
          );
          shapes.forEach((shape) => {
            shape.setAttribute("fill", "#000000"); // Solid black for the mask
            shape.setAttribute("stroke", "none"); // No stroke
          });

          // Create a new SVG blob for the mask
          const maskSvgString = new XMLSerializer().serializeToString(
            exportSvg
          );
          const maskBlob = new Blob([maskSvgString], {
            type: "image/svg+xml;charset=utf-8",
          });
          const maskUrl = URL.createObjectURL(maskBlob);

          // Create a new image for the mask
          const maskImg = new Image();
          maskImg.onload = function () {
            // Draw the mask image
            maskCtx.drawImage(
              maskImg,
              svgPositionX,
              svgPositionY,
              svgWidth,
              svgHeight
            );

            // Use the mask to cut out the shape
            ctx.globalCompositeOperation = "destination-out";
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.globalCompositeOperation = "source-over"; // Reset composite operation

            // Clean up mask resources
            URL.revokeObjectURL(maskUrl);

            // Continue with the export
            completeExport();
          };

          // Set the source for the mask image
          maskImg.src = maskUrl;
          return; // Exit and let the mask onload handler continue
        }

        // If not in cutout mode, continue normally
        completeExport();
      } catch (error) {
        console.error("Error in canvas processing:", error);
        alert("Error processing the image: " + error.message);
        exportBtn.textContent = originalButtonText;
        exportBtn.disabled = false;
        URL.revokeObjectURL(url);
        document.body.removeChild(tempDiv);
      }

      // Function to complete the export process after canvas preparation
      function completeExport() {
        // Convert canvas to data URL in the specified format
        let dataURL;
        if (format === "png") {
          dataURL = tempCanvas.toDataURL("image/png");
        } else {
          dataURL = tempCanvas.toDataURL("image/jpeg", 0.95);
        }
        console.log("Canvas converted to data URL");

        // Create form data to send to server
        const formData = new FormData();
        formData.append("svg_content", svgString);
        formData.append("format", format);
        formData.append("width", width);
        formData.append("height", height);
        formData.append("background_color", backgroundColor);
        formData.append("svg_position_x", svgPositionX);
        formData.append("svg_position_y", svgPositionY);
        formData.append("svg_width", svgWidth);
        formData.append("svg_height", svgHeight);
        formData.append("use_transparent_background", useTransparentBackground);
        formData.append("cutout_mode", currentState.cutoutMode);

        // Add background image if one exists
        if (currentState.bgImageUrl) {
          formData.append("background_image_url", currentState.bgImageUrl);
        }

        // Send the canvas data URL
        formData.append("canvas_data_url", dataURL);

        console.log("Sending data to server...");
        // Send to the server
        fetch("/export-image", {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            console.log("Server response received");
            if (!response.ok) {
              throw new Error(
                "Server responded with status: " + response.status
              );
            }
            return response.json();
          })
          .then((data) => {
            console.log("Download data:", data);
            // Create a download link
            const downloadLink = document.createElement("a");
            downloadLink.href = data.path;
            downloadLink.download = `icon.${format}`;
            document.body.appendChild(downloadLink);

            console.log("Triggering download");
            downloadLink.click();

            setTimeout(() => {
              document.body.removeChild(downloadLink);
              console.log("Download link removed");
            }, 100);

            // Reset button
            exportBtn.textContent = originalButtonText;
            exportBtn.disabled = false;
          })
          .catch((error) => {
            console.error("Error in export process:", error);
            alert("Error exporting image: " + error.message);

            // Reset button
            exportBtn.textContent = originalButtonText;
            exportBtn.disabled = false;
          });

        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(tempDiv);
      }
    };

    // Set image source to the SVG URL
    console.log("Setting image source to SVG URL");
    img.src = url;
  }

  // Initialize
  updateCanvasBackground();

  // Set initial state of cutout mode checkbox
  cutoutModeCheckbox.checked = false;
  svgColorInput.disabled = false;

  // Initialize opacity controls - ensure they're enabled by default
  svgOpacitySlider.disabled = false;
  svgOpacityInput.disabled = false;

  // Set initial state of transparent background checkbox and bg color input
  bgColorInput.disabled = transparentBgCheckbox.checked;
});
