import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob("*.html"))
VERIFICATION_FILE = ROOT / "googled245882dcee44e7c.html"

infolinks_snippet = """  <script type="text/javascript">
  var infolinks_pid = 3445070;
  var infolinks_wsid = 0;
  </script>
  <script type="text/javascript" src="http://resources.infolinks.com/js/infolinks_main.js"></script>
"""

def main():
    count = 0
    for html_path in HTML_FILES:
        if html_path == VERIFICATION_FILE:
            continue
        if "templates" in html_path.parts:
            continue

        try:
            content = html_path.read_text(encoding="utf-8")
        except Exception as e:
            print(f"Error reading {html_path}: {e}")
            continue

        if "infolinks_pid = 3445070" in content:
            continue

        if "</body>" in content:
            new_content = content.replace("</body>", infolinks_snippet + "</body>")
            html_path.write_text(new_content, encoding="utf-8")
            print(f"Updated {html_path.relative_to(ROOT)}")
            count += 1
        else:
            print(f"Warning: No </body> tag found in {html_path.relative_to(ROOT)}")

    print(f"Successfully added Infolinks script to {count} files.")

if __name__ == "__main__":
    main()
