import os
import glob
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS_DIR = os.path.join(ROOT_DIR, 'tools')
GUIDES_DIR = os.path.join(ROOT_DIR, 'guides')

TOOL_TO_GUIDE_MAP = {
    'base64-encoder.html': 'base64-encoding-guide.html',
    'image-compressor.html': 'compress-images-guide.html',
    'json-formatter.html': 'json-formatter-guide.html',
    'jwt-decoder.html': 'jwt-decoder-guide.html',
    'password-generator.html': 'password-guide.html',
    'qr-generator.html': 'qr-code-guide.html',
    'text-to-slug.html': 'seo-slug-best-practices.html',
    'url-encoder.html': 'url-encoding-guide.html',
    'uuid-generator.html': 'uuid-guid-guide.html',
}

def get_guide_info(guide_filename):
    guide_path = os.path.join(GUIDES_DIR, guide_filename)
    if not os.path.exists(guide_path):
        return None, None
    with open(guide_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    title_match = re.search(r'<h1[^>]*>(.*?)<', content, re.IGNORECASE)
    title_text = title_match.group(1).strip() if title_match else "Read Guide"
    # remove the toggle favorite button if it's there
    title_text = re.sub(r'<button.*$', '', title_text).strip()
        
    desc_match = re.search(r'<meta\s+name="description"\s+content="(.*?)"', content, re.IGNORECASE)
    desc_text = "Learn more about this tool and how it works behind the scenes."
    if desc_match:
        desc_text = desc_match.group(1).strip()
        if len(desc_text) > 80:
            desc_text = desc_text[:77] + "..."
            
    return title_text, desc_text

def main():
    success = 0
    for tool_file, guide_file in TOOL_TO_GUIDE_MAP.items():
        tool_path = os.path.join(TOOLS_DIR, tool_file)
        if not os.path.exists(tool_path):
            continue
            
        guide_title, guide_desc = get_guide_info(guide_file)
        if not guide_title:
            print(f"Skipping {tool_file} because {guide_file} does not exist.")
            continue
            
        with open(tool_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if f'href="../guides/{guide_file}"' in content and '📖 Deep Dive' in content:
            print(f"Already injected into {tool_file}")
            continue
            
        html_to_inject = f"""
      <div class="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 shadow-sm mb-6">
        <h3 class="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">📖 Deep Dive</h3>
        <a href="../guides/{guide_file}" class="block bg-white border border-blue-200 rounded-xl p-4 hover:shadow-md hover:border-blue-400 transition group">
          <p class="font-bold text-blue-800 group-hover:text-blue-600 transition-colors">{guide_title}</p>
          <p class="text-gray-600 text-xs mt-2 leading-relaxed">{guide_desc}</p>
        </a>
      </div>
"""
        
        # Find the start of the <aside> tag and insert right after it
        # Sometimes it has classes or aria-labelledby
        aside_pattern = re.compile(r'(<aside[^>]*>)', re.IGNORECASE)
        if aside_pattern.search(content):
            new_content = aside_pattern.sub(f'\\1\n{html_to_inject}', content, count=1)
            with open(tool_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Injected contextual link into {tool_file} -> {guide_file}")
            success += 1
        else:
            print(f"No aside found in {tool_file}")
        
    print(f"Successfully added contextual links to {success} tools.")

if __name__ == '__main__':
    main()
