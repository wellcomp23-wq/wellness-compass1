from PIL import Image, ImageDraw

def make_background_transparent(input_path, output_path):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    # Threshold for white background (can adjust if needed)
    threshold = 240
    
    # First pass: make everything that is very white transparent
    # But we want to keep the white heart!
    # The heart is in the center, the background is at the edges.
    width, height = img.size
    
    # Let's use a more robust approach:
    # 1. Create a mask for the rounded square.
    # 2. Apply transparency to everything outside that mask.
    
    # Create a mask image
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    # Define the rounded square area (the squircle)
    # Based on the generated image, the squircle occupies most of the center
    # Let's find the boundaries of the non-white area
    left, top, right, bottom = width, height, 0, 0
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            if r < threshold or g < threshold or b < threshold:
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)
    
    # Add a small margin to be safe
    margin = 2
    left += margin
    top += margin
    right -= margin
    bottom -= margin
    
    # Draw a rounded rectangle on the mask
    # Radius is roughly 20-25% of the width
    radius = int(width * 0.22)
    draw.rounded_rectangle([left, top, right, bottom], radius=radius, fill=255)
    
    # Apply the mask to the alpha channel
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
    
    # Save as 1024x1024
    img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    img.save(output_path, "PNG")
    print(f"Processed image saved to {output_path}")

if __name__ == "__main__":
    make_background_transparent("/home/ubuntu/wellness-compass/public/raw_logo.png", "/home/ubuntu/wellness-compass/public/logo.png")
    # Also create favicon
    make_background_transparent("/home/ubuntu/wellness-compass/public/raw_logo.png", "/home/ubuntu/wellness-compass/public/favicon.png")
