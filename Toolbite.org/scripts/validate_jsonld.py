import glob
import json
import os
import re

from paths import SITE_ROOT


def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all script tags of type application/ld+json
    jsonld_blocks = re.findall(r'<script\s+type=["\']application/ld\+json["\']>([\s\S]*?)</script>', content, re.IGNORECASE)
    
    errors = []
    
    for i, block in enumerate(jsonld_blocks):
        try:
            # Attempt to parse the JSON
            parsed = json.loads(block)
        except json.JSONDecodeError as e:
            errors.append(f"Block {i+1}: {str(e)}")

    if errors:
        return errors
    return None


def main():
    base_dir = str(SITE_ROOT)
    directories = [
        os.path.join(base_dir, "tools"),
        os.path.join(base_dir, "guides"),
        os.path.join(base_dir, "categories"),
        base_dir
    ]
    
    total_files = 0
    files_with_errors = 0
    
    for directory in directories:
        html_files = glob.glob(os.path.join(directory, "*.html"))
        for filepath in html_files:
            total_files += 1
            errors = process_html_file(filepath)
            
            if errors:
                files_with_errors += 1
                rel_path = os.path.relpath(filepath, base_dir)
                print(f"❌ JSON-LD Error in: {rel_path}")
                for err in errors:
                    print(f"   - {err}")
                print("-" * 40)
                
    if files_with_errors == 0:
        print(f"✅ SUCCESS: Checked {total_files} files. All JSON-LD blocks are perfectly valid!")
    else:
        print(f"\n⚠️ WARNING: Found errors in {files_with_errors} out of {total_files} files.")

if __name__ == "__main__":
    main()
