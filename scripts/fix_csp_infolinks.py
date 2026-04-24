import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob("*.html"))

def main():
    count = 0
    domains_to_add = " https://resources.infolinks.com https://*.infolinks.com"
    
    for html_path in HTML_FILES:
        try:
            content = html_path.read_text(encoding="utf-8")
        except Exception:
            continue

        if "Content-Security-Policy" in content:
            # We don't want to add it multiple times
            if domains_to_add in content:
                continue
                
            new_content = content
            
            # update script-src
            new_content = re.sub(
                r"(script-src[^;\"]+)",
                lambda m: m.group(1) + domains_to_add if domains_to_add not in m.group(1) else m.group(1),
                new_content
            )
            
            # update connect-src
            new_content = re.sub(
                r"(connect-src[^;\"]+)",
                lambda m: m.group(1) + domains_to_add if domains_to_add not in m.group(1) else m.group(1),
                new_content
            )
            
            # update frame-src
            new_content = re.sub(
                r"(frame-src[^;\"]+)",
                lambda m: m.group(1) + domains_to_add if domains_to_add not in m.group(1) else m.group(1),
                new_content
            )

            if new_content != content:
                html_path.write_text(new_content, encoding="utf-8")
                print(f"Updated CSP in {html_path.relative_to(ROOT)}")
                count += 1

    print(f"Successfully updated CSP in {count} files.")

if __name__ == "__main__":
    main()
