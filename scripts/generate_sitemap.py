import json
import pathlib
import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom

# Path configuration
ROOT = pathlib.Path(__file__).parent.parent.absolute()
SEO_JSON = ROOT / "data" / "seo.json"
SITEMAP_XML = ROOT / "sitemap.xml"

def generate_sitemap():
    if not SEO_JSON.exists():
        print(f"Error: {SEO_JSON} not found.")
        return

    with open(SEO_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    pages = data.get("pages", {})
    origin = data.get("origin", "https://toolbite.org").rstrip("/")
    today = datetime.datetime.now(datetime.timezone.utc).date().isoformat()

    # XML Setup
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

    # Define defaults based on page_type
    # (changefreq, priority)
    DEFAULTS = {
        "homepage": ("weekly", "1.0"),
        "category": ("monthly", "0.8"),
        "tool": ("monthly", "0.9"),
        "guide_hub": ("monthly", "0.7"),
        "guide_article": ("monthly", "0.7"),
        "trust": ("monthly", "0.5"),
    }

    count = 0
    # Process pages in the order they appear in seo.json or sorted?
    # Keeping them in the order of seo.json for now.
    for rel_path, spec in pages.items():
        canonical = spec.get("canonical")
        page_type = spec.get("page_type")

        # Skip if no canonical or utility page (search)
        if not canonical or page_type == "utility":
            continue
        
        # Skip trust pages (privacy/terms/contact usually have noindex) EXCEPT about.html
        if page_type == "trust" and rel_path != "about.html":
            continue

        url_node = ET.SubElement(urlset, "url")
        
        loc = ET.SubElement(url_node, "loc")
        loc.text = canonical if canonical.startswith("http") else f"{origin}/{rel_path}"

        lastmod = ET.SubElement(url_node, "lastmod")
        lastmod.text = today

        freq, prio = DEFAULTS.get(page_type, ("monthly", "0.5"))
        
        cf = ET.SubElement(url_node, "changefreq")
        cf.text = freq
        
        pr = ET.SubElement(url_node, "priority")
        pr.text = prio
        
        count += 1

    # Pretty print XML
    xml_str = ET.tostring(urlset, encoding="utf-8")
    parsed_xml = minidom.parseString(xml_str)
    pretty_xml = parsed_xml.toprettyxml(indent="  ")

    # Remove the extra <?xml version="1.0" ?> that toprettyxml adds if needed,
    # or just write it out.
    with open(SITEMAP_XML, "w", encoding="utf-8") as f:
        f.write(pretty_xml)

    print(f"Generated {SITEMAP_XML.name} with {count} URLs.")

if __name__ == "__main__":
    generate_sitemap()
