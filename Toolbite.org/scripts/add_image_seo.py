import glob
import os
import re

from paths import SITE_ROOT


def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Find all <img> tags
    def replace_img(match):
        img_tag = match.group(0)
        
        # 1. Check/Add alt tag
        if 'alt=' not in img_tag:
            # Insert alt="" before the closing >
            img_tag = img_tag[:-1] + ' alt="">'
            
        # 2. Check/Add loading="lazy"
        # Skip if it has loading=, fetchpriority="high", or class="header-logo"
        if 'loading=' not in img_tag and 'fetchpriority="high"' not in img_tag and 'header-logo' not in img_tag:
            img_tag = img_tag[:-1] + ' loading="lazy">'
            
        return img_tag

    # Match <img> tags. We use [^>]* to match attributes and >
    content = re.sub(r'<img[^>]*>', replace_img, content, flags=re.IGNORECASE)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    base_dir = str(SITE_ROOT)
    directories = [
        os.path.join(base_dir, "tools"),
        os.path.join(base_dir, "guides"),
        os.path.join(base_dir, "categories"),
        base_dir
    ]
    
    updated_files = 0
    
    for directory in directories:
        html_files = glob.glob(os.path.join(directory, "*.html"))
        for filepath in html_files:
            if process_html_file(filepath):
                updated_files += 1
                print(f"Updated Image SEO in: {os.path.relpath(filepath, base_dir)}")
                
    print(f"Total files updated for Image SEO: {updated_files}")

if __name__ == "__main__":
    main()
