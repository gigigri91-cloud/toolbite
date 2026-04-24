import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob("*.html"))

def main():
    count = 0
    for html_path in HTML_FILES:
        try:
            content = html_path.read_text(encoding="utf-8")
        except Exception:
            continue

        if "http://resources.infolinks.com" in content:
            new_content = content.replace("http://resources.infolinks.com", "https://resources.infolinks.com")
            html_path.write_text(new_content, encoding="utf-8")
            print(f"Updated {html_path.relative_to(ROOT)}")
            count += 1

    print(f"Successfully updated to HTTPS in {count} files.")

if __name__ == "__main__":
    main()
