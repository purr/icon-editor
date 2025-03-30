# SVG Icon Editor

A web application that allows you to customize SVG icons and export them in various formats.

## Features

- Choose from existing SVGs or upload your own
- Customize SVG size, color, and opacity
- Use "Cutout Mode" to create transparent cutouts in backgrounds and images
- Position the SVG precisely with drag-and-drop, positioning buttons, or direct X/Y coordinates
- Upload custom background images or use solid colors
- Support for transparent backgrounds
- Simple hex-only color picker for intuitive color selection
- Set canvas size and background color (when not using background images)
- Export as PNG, JPG, or WebP

## Installation

1. Clone this repository
2. Install the required dependencies:

```
pip install -r requirements.txt
```

3. Run the application:

```
python main.py
```

4. Open your browser and navigate to `http://localhost:8000`

## Usage

1. Select an SVG from the library or upload your own
2. Adjust the SVG settings (size, color, opacity)
3. Set the canvas size and background color
4. Position the SVG using drag-and-drop or the positioning buttons
5. For creating transparent cutouts, enable "Cutout Mode"
6. Choose an export format (PNG, JPG, WebP)
7. Click "Export" to download your customized icon

### Cutout Mode

Cutout Mode allows you to use SVG shapes as templates to create transparent cutouts in backgrounds and images:

1. Upload or select an SVG
2. Position it where you want the cutout to appear
3. Check the "Cutout Mode" checkbox
4. The SVG will display with a red outline and semi-transparent fill in the editor (UI only)
5. When exported, the SVG shape will be 100% transparent with no red lines or fill
6. Export the image to get a file with a clean transparent cutout in the shape of your SVG

Note: The red outline and semi-transparent fill are ONLY visual indicators in the editor interface to help you position the cutout. They NEVER appear in the exported image. The actual export will have perfectly transparent cutouts with no traces of red outlines or fill.

## Project Structure

- `main.py` - FastAPI application code
- `svgs/` - Directory containing SVG files
- `static/` - Static files (CSS, JavaScript)
  - `static/js/app.js` - Main application JavaScript
  - `static/css/styles.css` - Application styles
  - `static/images/` - Static images used in the UI
  - `static/uploads/` - User-uploaded background images
- `templates/` - Jinja2 templates
- `exports/` - Directory where exported images are stored

## Technical Implementation

### Frontend

- Vanilla JavaScript with DOM manipulation for dynamic UI
- Custom-built interactive preview with real-time updates
- CSS variables for consistent theming and styling
- Canvas-based rendering for exports with proper SVG handling

### Backend

- FastAPI for efficient API endpoints and file handling
- Pillow (PIL) for server-side image processing
- File storage for uploaded SVGs, background images, and exports
- Jinja2 templating for server-side rendering

## Browser Compatibility

The SVG Icon Editor works in all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is open source.

## Version History

<details>
<summary>Click to expand version history</summary>

- v1.9.7 - Fixed cutout mode export to ensure 100% transparency with no red outlines or fill
- v1.9.6 - Improved visual indicators in cutout mode for better positioning
- v1.9.2 - Reduced SVG outline thickness in cutout mode for more precise editing
- v1.9.1 - Simplified color picker to use hex colors only for a cleaner interface
- v1.9.0 - Enhanced CSS for custom color inputs with better visibility and spacing
- v1.8.8 - Increased SVG shape outline visibility with thicker strokes in cutout mode
- v1.8.4 - Improved cutout mode export with 100% transparent shapes
- v1.8.3 - Enhanced cutout mode with visual indicators showing the outline of SVG shapes
- v1.8.2 - Fixed export functionality with proper background handling
- v1.8.1 - Enhanced error handling and logging for export feature
- v1.8.0 - Added support for WebP export format
- v1.7.5 - Improved mobile responsiveness for better usability on small screens
- v1.7.0 - Added custom hex color input for precise color selection
- v1.6.0 - Added support for background images with auto-sizing
- v1.5.0 - Added detailed positioning controls with numerical inputs
- v1.4.5 - Guaranteed 100% transparency in cutouts by removing all color traces
- v1.4.4 - Simplified cutout mode with better contrast and 100% transparency in exports
- v1.4.3 - Enhanced cutout mode with stronger dimming effect and prominent red outline
- v1.4.2 - Removed all color tinting from cutout mode to ensure fully transparent cutouts
- v1.4.1 - Added dimmed SVG preview appearance in cutout mode for better visual feedback
- v1.4.0 - Fixed cutout mode to create fully transparent cutouts with no semi-transparency
- v1.3.9 - Refined cutout mode visual indicators with smaller dots for cleaner appearance
- v1.3.8 - Improved cutout mode visual indicators to follow actual SVG shape instead of rectangular outline
- v1.3.7 - Added visual red outline indicators for Cutout Mode in the live preview
- v1.3.6 - Enforced strict 20% default size for all SVGs in all scenarios
- v1.3.5 - Fixed SVG selection to always use 20% default size for consistent user experience
- v1.3.4 - Fixed Cutout Mode to properly show transparent holes in the live preview
- v1.3.3 - Fixed uploaded SVGs to use the correct 20% default size
- v1.3.2 - Improved visual feedback for Cutout Mode and fixed transparent background with images
- v1.3.1 - Fixed Cutout Mode to properly create transparent holes in the background
- v1.3.0 - Added Cutout Mode to create transparent cutouts in backgrounds
- v1.2.3 - Synchronized default SVG size in UI with code (20% of canvas size)
- v1.2.2 - Changed default SVG size to 20% of canvas size
- v1.2.1 - Fixed transparency handling in uploaded PNG images
- v1.2.0 - Changed SVG size to be relative to canvas size (100% = full canvas size)
- v1.1.9 - Changed SVG size maximum to 100% (representing same size as background)
- v1.1.8 - Added support for decimal SVG sizes for more precise resizing
- v1.1.7 - Fixed background image not appearing in exported files
- v1.1.6 - Added position preservation when switching between SVGs
- v1.1.5 - Fixed background image upload functionality
- v1.1.4 - Repositioned buttons for better usability and added .gitignore
- v1.1.3 - Added X/Y position inputs and background image upload functionality
- v1.1.2 - Added horizontal and vertical centering buttons for more precise positioning
- v1.1.1 - Changed opacity control to use percentage (0-100%) for more intuitive editing
- v1.1.0 - Added numeric input for opacity and improved slider responsiveness with real-time updates
- v1.0.9 - Fixed SVG rendering in exported images to prevent cropping and ensure proper centering
- v1.0.8 - Simplified export process to directly download with a single click
- v1.0.7 - Fixed canvas scaling issue for large SVGs and canvas sizes
- v1.0.6 - Increased maximum SVG size from 200% to 500%
- v1.0.5 - Improved export/download workflow with clear instructions
- v1.0.4 - Fixed export format issue to correctly output PNG with transparency
- v1.0.3 - Fixed image export functionality with transparent backgrounds and SVG rendering
- v1.0.2 - Replaced separate width/height inputs with aspect-ratio preserving size slider
- v1.0.1 - Improved responsiveness with dynamic sizing for zoom support
- v1.0.0 - Initial release
</details>
