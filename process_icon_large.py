from PIL import Image, ImageDraw

def make_background_transparent_large(input_path, output_path):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Threshold for white background
    threshold = 245
    
    # Find the squircle boundaries automatically
    left, top, right, bottom = width, height, 0, 0
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            # If not white, it's part of the squircle
            if r < threshold or g < threshold or b < threshold:
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)
    
    # Create a mask image
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    # Radius is roughly 22% of the width
    radius = int(width * 0.22)
    
    # Draw the rounded rectangle on the mask
    # We use the detected boundaries with a tiny 1-pixel margin for anti-aliasing safety
    draw.rounded_rectangle([left+1, top+1, right-1, bottom-1], radius=radius, fill=255)
    
    new_data = []
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            mask_val = mask.getpixel((x, y))
            
            if mask_val == 0:
                # Outside the squircle: full transparency
                new_data.append((255, 255, 255, 0))
            else:
                # Inside the squircle: keep original pixel
                new_data.append((r, g, b, a))
                
    img.putdata(new_data)
    
    # Final resize to standard 1024x1024
    img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    img.save(output_path, "PNG")
    print(f"Large processed image saved to {output_path}")

if __name__ == "__main__":
    make_background_transparent_large("/home/ubuntu/wellness-compass/public/raw_logo_large.png", "/home/ubuntu/wellness-compass/public/logo.png")
    make_background_transparent_large("/home/ubuntu/wellness-compass/public/raw_logo_large.png", "/home/ubuntu/wellness-compass/public/favicon.png")
