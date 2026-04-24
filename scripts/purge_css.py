import os
import re

def purge_css(css_path, content_paths, output_path, safelist=None):
    if safelist is None:
        safelist = []
    
    print(f"Purging {css_path}...")
    
    # 1. Collect all potential classes from content files
    used_words = set(safelist)
    # Common words used in HTML/JS that shouldn't be purged if they are classes
    word_pattern = re.compile(r'[a-zA-Z0-9\-\:\/]+')
    
    for path in content_paths:
        if not os.path.exists(path):
            continue
        if os.path.isdir(path):
            for root, dirs, files in os.walk(path):
                for file in files:
                    if file.endswith(('.html', '.js')):
                        with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                            text = f.read()
                            used_words.update(word_pattern.findall(text))
        elif os.path.isfile(path):
            with open(path, 'r', encoding='utf-8') as f:
                text = f.read()
                used_words.update(word_pattern.findall(text))

    print(f"Found {len(used_words)} potential class words.")

    # 2. Read and parse CSS
    if not os.path.exists(css_path):
        print(f"CSS file not found: {css_path}")
        return

    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()

    def is_selector_used(selector):
        # Remove pseudo-elements, pseudo-classes, and escaped characters
        clean_selector = selector.replace('\\', '')
        # Split by non-class characters to get individual class names
        parts = re.findall(r'\.([a-zA-Z0-9\-\:\/]+)', clean_selector)
        if not parts:
            # If no classes found (e.g. tag selector like 'body'), keep it
            tags = ['body', 'html', 'main', 'header', 'footer', 'h1', 'h2', 'h3', 'p', 'a', 'img', 'svg', 'canvas', 'button', 'input', 'textarea', 'label', 'details', 'summary', '*', '::']
            for tag in tags:
                if tag in selector:
                    return True
            return False
            
        for part in parts:
            # Check if class name is in used_words
            if part in used_words:
                return True
        return False

    def purge_block(block, is_selector_used):
        # Rules like: selector { properties }
        rules = re.findall(r'([^{]+)\{([^}]+)\}', block)
        purged_rules = []
        for selector, props in rules:
            if is_selector_used(selector.strip()):
                purged_rules.append(f"{selector.strip()}{{{props.strip()}}}")
        return "".join(purged_rules)

    # Simple state machine to parse CSS handling @media blocks
    new_css = []
    i = 0
    while i < len(css_content):
        if css_content[i:i+7] == '@media ':
            j = css_content.find('{', i)
            media_header = css_content[i:j+1]
            brace_count = 1
            k = j + 1
            while k < len(css_content) and brace_count > 0:
                if css_content[k] == '{': brace_count += 1
                elif css_content[k] == '}': brace_count -= 1
                k += 1
            
            media_body = css_content[j+1:k-1]
            purged_body = purge_block(media_body, is_selector_used)
            if purged_body:
                new_css.append(f"{media_header}{purged_body}}}")
            i = k
        elif css_content[i:i+11] == '@keyframes ':
             # Keep all keyframes for simplicity
             j = css_content.find('{', i)
             brace_count = 1
             k = j + 1
             while k < len(css_content) and brace_count > 0:
                 if css_content[k] == '{': brace_count += 1
                 elif css_content[k] == '}': brace_count -= 1
                 k += 1
             new_css.append(css_content[i:k])
             i = k
        else:
            next_media = css_content.find('@media ', i)
            next_rule_end = css_content.find('}', i)
            
            limit = len(css_content)
            if next_media != -1 and (next_rule_end == -1 or next_media < next_rule_end):
                limit = next_media
            else:
                limit = next_rule_end + 1 if next_rule_end != -1 else len(css_content)
            
            block = css_content[i:limit]
            if '{' in block:
                purged_rules = purge_block(block, is_selector_used)
                if purged_rules:
                    new_css.append(purged_rules)
            i = limit

    output_css = "".join(new_css)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output_css)
    
    orig_size = len(css_content) / 1024
    new_size = len(output_css) / 1024
    print(f"Original size: {orig_size:.2f} KB")
    print(f"Purged size: {new_size:.2f} KB")
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    base_dir = "/Users/grijac/Desktop/My Sites/Toolbite.org/toolbite"
    content_dirs = [
        os.path.join(base_dir, "index.html"),
        os.path.join(base_dir, "about.html"),
        os.path.join(base_dir, "contact.html"),
        os.path.join(base_dir, "privacy.html"),
        os.path.join(base_dir, "terms.html"),
        os.path.join(base_dir, "search.html"),
        os.path.join(base_dir, "categories"),
        os.path.join(base_dir, "tools"),
        os.path.join(base_dir, "guides"),
        os.path.join(base_dir, "assets/js")
    ]
    
    sl = ['dark', 'active', 'hidden', 'header-small', 'block', 'inline-block', 'flex', 'grid', 'hidden', 'bg-green-50', 'text-green-700', 'border-green-200', 'bg-red-50', 'text-red-700', 'border-red-200', 'bg-green-600', 'bg-green-500', 'text-green-600', 'bg-green-100', 'bg-gray-100', 'opacity-0', 'opacity-100', 'translate-y-0', 'translate-y-4']
    
    purge_css(
        os.path.join(base_dir, "assets/css/tailwind.min.css"),
        content_dirs,
        os.path.join(base_dir, "assets/css/tailwind.min.css"), # Overwrite for production
        safelist=sl
    )
    
    purge_css(
        os.path.join(base_dir, "assets/css/global.min.css"),
        content_dirs,
        os.path.join(base_dir, "assets/css/global.min.css"), # Overwrite
        safelist=sl
    )
