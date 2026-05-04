import glob
import os
import re

from paths import SITE_ROOT


def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Meta Title
    # <title>Something</title> -> <title data-pseo-target="meta-title">Something</title>
    content = re.sub(
        r'<title>(.*?)</title>',
        r'<title data-pseo-target="meta-title">\1</title>',
        content,
        flags=re.IGNORECASE
    )
    # If it already had it, prevent duplication
    content = re.sub(r'<title data-pseo-target="meta-title" data-pseo-target="meta-title">', r'<title data-pseo-target="meta-title">', content)

    # 2. Meta Description
    content = re.sub(
        r'<meta\s+name=["\']description["\']\s+(?!.*data-pseo-target)content=["\'](.*?)["\']\s*/?>',
        r'<meta name="description" data-pseo-target="meta-description" content="\1">',
        content,
        flags=re.IGNORECASE
    )

    # 3. OG Title
    content = re.sub(
        r'<meta\s+property=["\']og:title["\']\s+(?!.*data-pseo-target)content=["\'](.*?)["\']\s*/?>',
        r'<meta property="og:title" data-pseo-target="og-title" content="\1">',
        content,
        flags=re.IGNORECASE
    )

    # 4. OG Description
    content = re.sub(
        r'<meta\s+property=["\']og:description["\']\s+(?!.*data-pseo-target)content=["\'](.*?)["\']\s*/?>',
        r'<meta property="og:description" data-pseo-target="og-description" content="\1">',
        content,
        flags=re.IGNORECASE
    )

    # 5. H1
    # Matches <h1 class="...">...</h1>
    content = re.sub(
        r'<h1([^>]*)>(.*?)</h1>',
        lambda m: f'<h1{m.group(1)}>{m.group(2)}</h1>' if 'data-pseo-target' in m.group(1) else f'<h1{m.group(1)} data-pseo-target="h1">{m.group(2)}</h1>',
        content,
        flags=re.IGNORECASE | re.DOTALL
    )

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    base_dir = str(SITE_ROOT)
    
    # Target directories
    directories = [
        os.path.join(base_dir, "tools"),
        os.path.join(base_dir, "guides"),
        os.path.join(base_dir, "categories"),
        base_dir # root
    ]
    
    updated_files = 0
    
    for directory in directories:
        html_files = glob.glob(os.path.join(directory, "*.html"))
        for filepath in html_files:
            if process_html_file(filepath):
                updated_files += 1
                print(f"Updated: {os.path.relpath(filepath, base_dir)}")
                
    print(f"Total files updated with pSEO attributes: {updated_files}")

if __name__ == "__main__":
    main()
