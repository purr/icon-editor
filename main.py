import os
import uuid
import base64

import aiofiles
from PIL import Image, ImageDraw
from fastapi import File, Form, FastAPI, Request, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="SVG Icon Editor")

# Create directories if they don't exist
os.makedirs("svgs", exist_ok=True)
os.makedirs("static", exist_ok=True)
os.makedirs("static/js", exist_ok=True)
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/images", exist_ok=True)
os.makedirs("static/uploads", exist_ok=True)  # For background images
os.makedirs("templates", exist_ok=True)
os.makedirs("exports", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/svgs", StaticFiles(directory="svgs"), name="svgs")
app.mount("/exports", StaticFiles(directory="exports"), name="exports")

# Set up Jinja2 templates
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # Get list of SVG files
    svg_files = []
    for file in os.listdir("svgs"):
        if file.lower().endswith(".svg"):
            svg_files.append(file)

    return templates.TemplateResponse(
        "index.html", {"request": request, "svg_files": svg_files}
    )


@app.post("/upload-svg")
async def upload_svg(file: UploadFile = File(...)):
    # Ensure file is an SVG
    if not file.filename.lower().endswith(".svg"):
        return {"error": "Only SVG files are allowed"}

    # Create path with unique filename to avoid collisions
    file_path = f"svgs/{uuid.uuid4().hex}_{file.filename}"

    # Save uploaded file
    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    return {"filename": os.path.basename(file_path)}


@app.post("/upload-bg-image")
async def upload_bg_image(file: UploadFile = File(...)):
    # Check if file is an image
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    file_ext = os.path.splitext(file.filename.lower())[1]

    if file_ext not in allowed_extensions:
        return {"error": "Only image files are allowed (JPG, PNG, WebP, GIF)"}

    # Create path with unique filename to avoid collisions
    file_path = f"static/uploads/{uuid.uuid4().hex}_{file.filename}"

    # Save uploaded file
    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    # Generate a URL path that can be used in the frontend
    url_path = "/" + file_path

    return {"filename": os.path.basename(file_path), "url": url_path}


@app.post("/export-image")
async def export_image(
    svg_content: str = Form(...),
    format: str = Form(...),
    width: int = Form(...),
    height: int = Form(...),
    background_color: str = Form(...),
    svg_position_x: int = Form(0),
    svg_position_y: int = Form(0),
    svg_width: int = Form(100),
    svg_height: int = Form(100),
    background_image_url: str = Form(None),
    use_transparent_background: bool = Form(False),
    canvas_data_url: str = Form(None),
):
    # Create unique filename for the exported image
    filename = f"{uuid.uuid4().hex}.{format.lower()}"
    output_path = f"exports/{filename}"

    try:
        # If we have a canvas data URL, use it directly (client-side rendering)
        if canvas_data_url and canvas_data_url.startswith("data:image/"):
            # Extract the base64 data from the data URL
            content_type, data_string = canvas_data_url.split(",")

            # Decode the base64 data
            image_data = base64.b64decode(data_string)

            # Write the image data to a file
            with open(output_path, "wb") as f:
                f.write(image_data)

            print(f"Image exported from canvas data URL to {output_path}")
            return {"filename": filename, "path": f"/exports/{filename}"}

        # Fallback to server-side rendering if no canvas data URL provided
        # Create a new image with the background color or transparent
        if use_transparent_background or background_color == "transparent":
            bg_color = (0, 0, 0, 0)  # Transparent RGBA
            img = Image.new("RGBA", (width, height), bg_color)
        else:
            try:
                # Parse the background color
                if background_color.startswith("#"):
                    # Convert hex color to RGBA
                    r = int(background_color[1:3], 16)
                    g = int(background_color[3:5], 16)
                    b = int(background_color[5:7], 16)
                    bg_color = (r, g, b, 255)
                else:
                    bg_color = background_color

                img = Image.new("RGBA", (width, height), bg_color)
            except ValueError:
                # Fallback if color is invalid
                img = Image.new("RGBA", (width, height), "#ffffff")

        # Second layer: Add the background image if provided
        if background_image_url and background_image_url != "null":
            try:
                # Remove leading / if present
                if background_image_url.startswith("/"):
                    background_image_url = background_image_url[1:]

                # Load the background image
                if os.path.exists(background_image_url):
                    bg_img = Image.open(background_image_url).convert("RGBA")

                    # Resize the background image to match the output dimensions
                    bg_img = bg_img.resize((width, height))

                    # Composite the background image onto our transparent canvas
                    img = Image.alpha_composite(img, bg_img)
            except Exception as e:
                print(f"Error processing background image: {e}")

        # Draw a note stating we're using server-side rendering as fallback
        draw = ImageDraw.Draw(img)
        # Add message in the middle of the image
        draw.text(
            (width / 2 - 100, height / 2),
            "Server-side fallback rendering",
            fill=(255, 0, 0),
        )
        draw.rectangle(
            [
                svg_position_x,
                svg_position_y,
                svg_position_x + svg_width,
                svg_position_y + svg_height,
            ],
            outline=(255, 0, 0, 128),
            width=1,
        )

        # Save the image with background only
        if format.lower() == "jpg" or format.lower() == "jpeg":
            # Convert to RGB for JPEG (no alpha channel)
            img = img.convert("RGB")
            img.save(output_path, "JPEG", quality=95)
        else:
            img.save(output_path, format.upper())

        # Log success
        print(f"Image exported to {output_path}")
        print(
            f"SVG position: ({svg_position_x}, {svg_position_y}), size: {svg_width}x{svg_height}"
        )

    except Exception as e:
        print(f"Error during export: {e}")
        return {"error": str(e)}

    return {"filename": filename, "path": f"/exports/{filename}"}


@app.get("/get-svg-list")
async def get_svg_list():
    svg_files = []
    for file in os.listdir("svgs"):
        if file.lower().endswith(".svg"):
            svg_files.append(file)

    return {"svg_files": svg_files}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
