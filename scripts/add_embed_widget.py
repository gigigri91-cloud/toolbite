import os
import glob
import re

TOOLS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools')

def main():
    files = glob.glob(os.path.join(TOOLS_DIR, '*.html'))
    success_count = 0

    embed_button_html = '<button type="button" class="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition shadow-sm mr-2 hidden md:inline-block" onclick="showEmbedModal()">Embed</button>'

    # We look for <button id=".*copy.*" ... > or <button id="copyBtn" ...> inside the file.
    # It usually comes after a flex-grow div or other buttons.
    pattern = re.compile(r'(<button[^>]+id=[\"\'][a-zA-Z0-9\-]*copy[a-zA-Z0-9\-]*[\"\'][^>]*>)', re.IGNORECASE)

    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already added
        if 'showEmbedModal()' in content:
            print(f"Skipping {os.path.basename(file_path)} - already has embed button.")
            continue

        if pattern.search(content):
            # Replace the first occurrence of the copy button
            new_content = pattern.sub(f'{embed_button_html}\n          \\1', content, count=1)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            success_count += 1
            print(f"Updated {os.path.basename(file_path)}")
        else:
            # Maybe it doesn't have a copy button? Fallback to flex-grow
            flex_pattern = re.compile(r'(<div class="flex-grow"></div>)')
            if flex_pattern.search(content):
                new_content = flex_pattern.sub(f'\\1\n          {embed_button_html}', content, count=1)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                success_count += 1
                print(f"Updated {os.path.basename(file_path)} via flex-grow fallback")
            else:
                print(f"Warning: Could not find injection point in {os.path.basename(file_path)}")

    print(f"Done! Injected embed button into {success_count} tools.")

if __name__ == '__main__':
    main()
