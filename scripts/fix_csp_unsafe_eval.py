import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob("*.html"))

def main():
    count = 0
    eval_directive = " 'unsafe-eval'"
    
    for html_path in HTML_FILES:
        try:
            content = html_path.read_text(encoding="utf-8")
        except Exception:
            continue

        if "Content-Security-Policy" in content:
            if eval_directive in content:
                continue
                
            new_content = content
            
            # update script-src
            new_content = re.sub(
                r"(script-src[^;\"]+)",
                lambda m: m.group(1) + eval_directive if eval_directive not in m.group(1) else m.group(1),
                new_content
            )

            if new_content != content:
                html_path.write_text(new_content, encoding="utf-8")
                print(f"Added 'unsafe-eval' to CSP in {html_path.relative_to(ROOT)}")
                count += 1

    print(f"Successfully added 'unsafe-eval' to CSP in {count} files.")

if __name__ == "__main__":
    main()
