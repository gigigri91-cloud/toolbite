import os
import glob
import re

TOOLS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools')

def main():
    files = glob.glob(os.path.join(TOOLS_DIR, '*.html'))
    success_count = 0

    embed_button_html = '<button type="button" class="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition shadow-sm mr-2 hidden md:inline-block" onclick="showEmbedModal()">Embed Tool</button>'

    # Specific patterns for the remaining 4 tools
    patterns = [
        re.compile(r'(<button[^>]+id="jwt-clear-btn"[^>]*>)', re.IGNORECASE),
        re.compile(r'(<button[^>]+id="read-clear-btn"[^>]*>)', re.IGNORECASE),
        re.compile(r'(<button[^>]+id="compress-btn"[^>]*>)', re.IGNORECASE),
        re.compile(r'(<button[^>]+onclick="generatePalette\(\)"[^>]*>)', re.IGNORECASE)
    ]

    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'showEmbedModal()' in content:
            continue

        updated = False
        for p in patterns:
            if p.search(content):
                new_content = p.sub(f'{embed_button_html}\n          \\1', content, count=1)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                success_count += 1
                updated = True
                print(f"Updated {os.path.basename(file_path)} with specific fallback")
                break
        
        if not updated:
            print(f"Still skipping {os.path.basename(file_path)}")

    print(f"Done! Injected embed button into {success_count} tools.")

if __name__ == '__main__':
    main()
