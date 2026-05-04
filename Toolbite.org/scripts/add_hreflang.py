import glob
import os
import re

from paths import SITE_ROOT


def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Find the canonical link
    # Example: <link rel="canonical" href="https://toolbite.org/tools/csv-to-json.html">
    canonical_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']\s*/?>', content, re.IGNORECASE)
    
    if canonical_match:
        canonical_url = canonical_match.group(1)
        canonical_tag = canonical_match.group(0)
        
        # Check if hreflang already exists
        if 'hreflang="x-default"' not in content:
            hreflang_tags = (
                f'\n  <link rel="alternate" hreflang="x-default" href="{canonical_url}">'
                f'\n  <link rel="alternate" hreflang="en" href="{canonical_url}">'
            )
            
            # Insert hreflang tags right after the canonical tag
            content = content.replace(canonical_tag, canonical_tag + hreflang_tags)

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
                print(f"Added hreflang to: {os.path.relpath(filepath, base_dir)}")
                
    print(f"Total files updated with hreflang: {updated_files}")

if __name__ == "__main__":
    main()
