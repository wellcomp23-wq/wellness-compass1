#!/usr/bin/env python3
"""
Process app icons to create rounded square shape with transparent background.
Removes all pixels outside the rounded square and ensures 100% alpha transparency.
"""

from PIL import Image, ImageDraw
import math
import os

def create_rounded_square_mask(size, radius):
    """
    Create a rounded square mask for the icon.
    
    Args:
        size: Size of the square (width and height)
        radius: Radius of the rounded corners
    
    Returns:
        PIL Image with the mask
    """
    # Create a new image with transparent background
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw rounded square (filled white, rest transparent)
    # Parameters: (x0, y0, x1, y1, radius)
    draw.rounded_rectangle(
        [(0, 0), (size - 1, size - 1)],
        radius=radius,
        fill=255
    )
    
    return mask

def process_rounded_square_icon(input_path, output_path, corner_radius_ratio=0.15):
    """
    Process an icon to create a rounded square with transparent background.
    
    Args:
        input_path: Path to the input image
        output_path: Path to save the processed image
        corner_radius_ratio: Ratio of corner radius to icon size (0-0.5)
    """
    # Open the image
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    
    # Calculate corner radius
    corner_radius = int(min(width, height) * corner_radius_ratio)
    
    # Create rounded square mask
    mask = create_rounded_square_mask(width, corner_radius)
    
    # Create a new image with transparent background
    result = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    # Paste the image using the mask
    result.paste(img, (0, 0), mask)
    
    # Save the result
    result.save(output_path, 'PNG')
    print(f"✓ Processed: {output_path}")

def main():
    base_path = '/home/ubuntu/wellness-compass/public'
    
    # Process logo.png
    logo_input = os.path.join(base_path, 'logo.png')
    logo_output = os.path.join(base_path, 'logo.png')
    
    # Process favicon.png
    favicon_input = os.path.join(base_path, 'favicon.png')
    favicon_output = os.path.join(base_path, 'favicon.png')
    
    print("Processing rounded square icons with transparent background...")
    print()
    
    # Process both icons with professional rounded corners (15% of size)
    process_rounded_square_icon(logo_input, logo_output, corner_radius_ratio=0.15)
    process_rounded_square_icon(favicon_input, favicon_output, corner_radius_ratio=0.15)
    
    print()
    print("✓ All icons processed successfully!")
    print("✓ Transparent background applied to all icons")
    print("✓ Professional rounded square shape maintained")
    print("✓ Icons now match iOS/Android app store style")

if __name__ == '__main__':
    main()
