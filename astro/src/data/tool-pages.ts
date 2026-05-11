import { getAllTools } from "@/lib/tools";
import { TOOL_SEO_EXPANSIONS } from "./tool-seo-expansions";

export type ToolPageContent = {
  slug: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  categoryName: string;
  categoryHref: string;
  benefits: string[];
  useCases: Array<{ title: string; description: string }>;
  examples: Array<{ title: string; input: string; output: string }>;
  faq: Array<{ question: string; answer: string }>;
  workflow: Array<{ name: string; href: string; icon?: string }>;
};

export const toolPageContent: Record<string, ToolPageContent> = {
  "word-counter": {
    slug: "word-counter",
    heroEyebrow: "Writing flow helper",
    heroTitle: "Word counter online",
    heroDescription: "Count words, characters, sentences, and paragraphs instantly for drafts, editorial checks, and publishing targets.",
    categoryName: "Text Tools",
    categoryHref: "/categories/text-tools.html",
    benefits: [
      "Instant counters update as you type, with no reloads.",
      "Entirely browser-based flow keeps sensitive copy private.",
      "Works well for articles, social snippets, and assignment limits."
    ],
    useCases: [
      { title: "Editorial QA", description: "Verify body copy length before review cycles." },
      { title: "SEO copy planning", description: "Balance long-form depth with practical limits." },
      { title: "Social adaptation", description: "Trim long text into channel-specific versions." }
    ],
    examples: [
      { title: "Blog intro check", input: "Paste intro paragraph", output: "See live word and sentence count" },
      { title: "Meta draft review", input: "Draft metadata copy", output: "Validate concise character length" }
    ],
    faq: [
      { question: "Is this word counter free?", answer: "Yes, the tool is fully free and works directly in your browser." },
      { question: "Is my text uploaded?", answer: "No, counting happens locally in your browser tab." }
    ],
    workflow: [
      { name: "Find & Replace", href: "/tools/find-replace.html", icon: "🔁" },
      { name: "Remove Extra Spaces", href: "/tools/remove-extra-spaces.html", icon: "🧹" },
      { name: "Text to Slug", href: "/tools/text-to-slug.html", icon: "🔗" }
    ]
  },
  "json-formatter": {
    slug: "json-formatter",
    heroEyebrow: "DEVELOPER PAYLOAD UTILITY",
    heroTitle: "JSON formatter and validator",
    heroDescription: "Beautify, minify, and validate JSON fast while keeping API payloads in your local browser context.",
    categoryName: "Developer Tools",
    categoryHref: "/categories/developer-tools.html",
    benefits: [
      "Format and minify modes support both review and production output.",
      "Inline validation quickly surfaces broken syntax.",
      "No backend roundtrip for sensitive payload debugging."
    ],
    useCases: [
      { title: "API debugging", description: "Inspect and repair malformed response payloads quickly." },
      { title: "Schema snippets", description: "Validate JSON-LD before publishing templates." },
      { title: "Config cleanup", description: "Normalize JSON config files for code review." }
    ],
    examples: [
      { title: "Trailing comma error", input: "{\"k\":1,}", output: "Validator highlights syntax issue" },
      { title: "Production minify", input: "Pretty JSON object", output: "Compact one-line JSON output" }
    ],
    faq: [
      { question: "Does this validate JSON structure?", answer: "Yes, it parses JSON and reports syntax errors before formatting." },
      { question: "Can I use it for large payloads?", answer: "Yes, typical large payloads are handled client-side without uploads." }
    ],
    workflow: [
      { name: "JWT Decoder", href: "/tools/jwt-decoder.html", icon: "🪪" },
      { name: "CSV to JSON", href: "/tools/csv-to-json.html", icon: "🔄" },
      { name: "Base64 Tool", href: "/tools/base64-encoder.html", icon: "📎" }
    ]
  },
  "jwt-decoder": {
    slug: "jwt-decoder",
    heroEyebrow: "TOKEN INSPECTION",
    heroTitle: "JWT decoder",
    heroDescription: "Decode JWT header and payload segments instantly for troubleshooting auth flows and claim inspection.",
    categoryName: "Developer Tools",
    categoryHref: "/categories/developer-tools.html",
    benefits: [
      "Readable JSON output for header and payload claims.",
      "Clear signature segment status without pretending verification.",
      "Fast local decoding for incident triage and QA."
    ],
    useCases: [
      { title: "Auth debugging", description: "Inspect token claims when sessions behave unexpectedly." },
      { title: "Environment checks", description: "Compare payloads across staging and production tokens." },
      { title: "Support workflows", description: "Read exp and aud claims during troubleshooting." }
    ],
    examples: [
      { title: "Header review", input: "Encoded header segment", output: "Parsed alg/kid JSON block" },
      { title: "Payload audit", input: "Encoded payload segment", output: "Readable claims list" }
    ],
    faq: [
      { question: "Does this verify signatures?", answer: "No, this tool decodes only. Signature verification must happen in trusted backend logic." },
      { question: "Is token data stored?", answer: "No, decoding runs in your browser." }
    ],
    workflow: [
      { name: "JSON Formatter", href: "/tools/json-formatter.html", icon: "💻" },
      { name: "Base64 Tool", href: "/tools/base64-encoder.html", icon: "📎" },
      { name: "URL Encoder", href: "/tools/url-encoder.html", icon: "🌐" }
    ]
  },
  "image-compressor": {
    slug: "image-compressor",
    heroEyebrow: "Media optimization",
    heroTitle: "Image compressor",
    heroDescription: "Compress JPEG and WebP output in your browser to reduce transfer cost and improve page performance without uploads.",
    categoryName: "Image Tools",
    categoryHref: "/categories/image-tools.html",
    benefits: [
      "Compression happens locally for safer client assets.",
      "Quality slider helps balance fidelity and file size.",
      "Quick download flow for immediate publishing use."
    ],
    useCases: [
      { title: "Landing pages", description: "Reduce hero image weight before deployment." },
      { title: "Content publishing", description: "Optimize article images for better Core Web Vitals." },
      { title: "Portfolio updates", description: "Ship lighter media while preserving useful detail." }
    ],
    examples: [
      { title: "Photo optimization", input: "2.4MB JPEG", output: "Compressed version ready for upload" },
      { title: "PNG conversion", input: "Transparent PNG", output: "WebP/JPEG export with chosen quality" }
    ],
    faq: [
      { question: "Will this keep quality acceptable?", answer: "Yes, use the quality slider to control compression intensity." },
      { question: "Are images uploaded?", answer: "No, file processing happens in your browser canvas context." }
    ],
    workflow: [
      { name: "Color Palette Generator", href: "/tools/color-palette-generator.html", icon: "🎨" },
      { name: "QR Generator", href: "/tools/qr-generator.html", icon: "📱" },
      { name: "Read optimization guide", href: "/guides/compress-images-guide.html", icon: "📘" }
    ]
  },
  "text-to-slug": {
    slug: "text-to-slug",
    heroEyebrow: "URL publishing helper",
    heroTitle: "Text to slug generator",
    heroDescription: "Turn titles into clean lowercase slugs for SEO-friendly URLs and consistent content operations.",
    categoryName: "SEO Tools",
    categoryHref: "/categories/seo-tools.html",
    benefits: [
      "Automatic normalization strips accents and symbols.",
      "Consistent hyphenated output for CMS and static routes.",
      "Simple copy workflow for rapid publishing."
    ],
    useCases: [
      { title: "Blog publishing", description: "Generate clean permalinks from long article titles." },
      { title: "Product catalogs", description: "Normalize naming across many product URLs." },
      { title: "SEO workflows", description: "Create readable slugs before metadata review." }
    ],
    examples: [
      { title: "Accented headline", input: "Crème Brûlée Recipe", output: "creme-brulee-recipe" },
      { title: "Messy input", input: "  Summer Sale 2026!!! ", output: "summer-sale-2026" }
    ],
    faq: [
      { question: "Does this remove special characters?", answer: "Yes, non URL-safe symbols are stripped during slug generation." },
      { question: "Can I copy output quickly?", answer: "Yes, one click copies the generated slug." }
    ],
    workflow: [
      { name: "Word Counter", href: "/tools/word-counter.html", icon: "📝" },
      { name: "Read Time Calculator", href: "/tools/read-time-calculator.html", icon: "⏱️" },
      { name: "SEO slug guide", href: "/guides/seo-slug-best-practices.html", icon: "📙" }
    ]
  },
  "base64-encoder": {
    slug: "base64-encoder",
    heroEyebrow: "Developer encoding utility",
    heroTitle: "Base64 encoder and decoder",
    heroDescription: "Encode and decode Base64 strings quickly for payload debugging and data transport workflows.",
    categoryName: "Developer Tools",
    categoryHref: "/categories/developer-tools.html",
    benefits: [
      "UTF-8-safe conversion for modern text content.",
      "Fast toggle between encode and decode modes.",
      "All processing runs in your browser tab."
    ],
    useCases: [
      { title: "API payload checks", description: "Inspect encoded values in test payloads quickly." },
      { title: "Auth workflows", description: "Decode segments used in token diagnostics." },
      { title: "Snippet handling", description: "Convert small text blobs for transport-safe usage." }
    ],
    examples: [
      { title: "Encode sample", input: "plain-text", output: "cGxhaW4tdGV4dA==" },
      { title: "Decode sample", input: "SGVsbG8gd29ybGQ=", output: "Hello world" }
    ],
    faq: [
      { question: "Is Base64 encryption?", answer: "No, Base64 is an encoding format, not encryption." },
      { question: "Is my input uploaded?", answer: "No, encoding and decoding happen locally in your browser." }
    ],
    workflow: [
      { name: "JSON Formatter", href: "/tools/json-formatter.html", icon: "💻" },
      { name: "URL Encoder", href: "/tools/url-encoder.html", icon: "🌐" },
      { name: "JWT Decoder", href: "/tools/jwt-decoder.html", icon: "🪪" }
    ]
  },
  "case-converter": {
    slug: "case-converter",
    heroEyebrow: "Text normalization helper",
    heroTitle: "Case converter",
    heroDescription: "Switch between uppercase, lowercase, title case, sentence case, and camelCase in one click.",
    categoryName: "Text Tools",
    categoryHref: "/categories/text-tools.html",
    benefits: [
      "Handles common case transformations instantly.",
      "Useful for copy cleanup and code-related naming.",
      "No server processing for pasted content."
    ],
    useCases: [
      { title: "Headline cleanup", description: "Standardize title formatting before publishing." },
      { title: "Code naming prep", description: "Convert strings into camelCase for quick development tasks." },
      { title: "Bulk text edits", description: "Fix capitalization inconsistencies in long pasted content." }
    ],
    examples: [
      { title: "Title case", input: "best tools for seo", output: "Best Tools For Seo" },
      { title: "camelCase", input: "tool bite utility", output: "toolBiteUtility" }
    ],
    faq: [
      { question: "Does this support sentence case?", answer: "Yes, sentence case conversion is available." },
      { question: "Can I copy result quickly?", answer: "Yes, use the Copy button after converting." }
    ],
    workflow: [
      { name: "Find & Replace", href: "/tools/find-replace.html", icon: "🔁" },
      { name: "Remove Extra Spaces", href: "/tools/remove-extra-spaces.html", icon: "🧹" },
      { name: "Text to Slug", href: "/tools/text-to-slug.html", icon: "🔗" }
    ]
  },
  "color-palette-generator": {
    slug: "color-palette-generator",
    heroEyebrow: "Visual exploration utility",
    heroTitle: "Color palette generator",
    heroDescription: "Generate random color palettes and copy HEX values instantly for UI and branding experiments.",
    categoryName: "Image Tools",
    categoryHref: "/categories/image-tools.html",
    benefits: [
      "Creates five random HEX swatches per run.",
      "One-click swatch copy for faster design iteration.",
      "Runs fully client-side with no upload flow."
    ],
    useCases: [
      { title: "UI prototyping", description: "Find quick color combinations for component concepts." },
      { title: "Brand mood boards", description: "Explore diverse color directions quickly." },
      { title: "CSS setup", description: "Copy HEX values directly into stylesheets." }
    ],
    examples: [
      { title: "Palette generation", input: "Click generate", output: "5 random HEX swatches" },
      { title: "Copy swatch", input: "Click a color block", output: "HEX copied to clipboard" }
    ],
    faq: [
      { question: "How many colors are generated?", answer: "Each generation returns five colors." },
      { question: "Can I copy a HEX value?", answer: "Yes, click any swatch to copy it." }
    ],
    workflow: [
      { name: "Image Compressor", href: "/tools/image-compressor.html", icon: "🖼️" },
      { name: "QR Generator", href: "/tools/qr-generator.html", icon: "📱" },
      { name: "Developer Tools", href: "/categories/developer-tools.html", icon: "🧰" }
    ]
  },
  "csv-to-json": {
    slug: "csv-to-json",
    heroEyebrow: "Data transformation helper",
    heroTitle: "CSV to JSON converter",
    heroDescription: "Convert CSV data into structured JSON arrays with delimiter and formatting controls.",
    categoryName: "Developer Tools",
    categoryHref: "/categories/developer-tools.html",
    benefits: [
      "Supports multiple delimiters and optional headers.",
      "Provides quick pretty-print output for review.",
      "Conversion runs locally for safer data handling."
    ],
    useCases: [
      { title: "Spreadsheet exports", description: "Turn tabular exports into JSON quickly." },
      { title: "API fixtures", description: "Create local JSON test payloads from CSV." },
      { title: "Migration prep", description: "Normalize old list data for modern systems." }
    ],
    examples: [
      { title: "Header row", input: "name,age", output: "[{\"name\":\"...\",\"age\":...}]" },
      { title: "No header mode", input: "value1;value2", output: "Generated col1, col2 keys" }
    ],
    faq: [
      { question: "Can I use semicolon delimiters?", answer: "Yes, semicolon, comma, tab, and pipe are supported." },
      { question: "Is CSV uploaded to a server?", answer: "No, conversion happens in your browser." }
    ],
    workflow: [
      { name: "JSON Formatter", href: "/tools/json-formatter.html", icon: "💻" },
      { name: "Base64 Encoder", href: "/tools/base64-encoder.html", icon: "📎" },
      { name: "JWT Decoder", href: "/tools/jwt-decoder.html", icon: "🪪" }
    ]
  },
  "find-replace": {
    slug: "find-replace",
    heroEyebrow: "Bulk editing helper",
    heroTitle: "Find and replace text",
    heroDescription: "Replace repeated terms across pasted text quickly with optional case-sensitive matching.",
    categoryName: "Text Tools",
    categoryHref: "/categories/text-tools.html",
    benefits: [
      "Replaces all matches in one action.",
      "Case-sensitive mode supports controlled edits.",
      "Text remains in-browser with no upload required."
    ],
    useCases: [
      { title: "Content refreshes", description: "Update repeated names or terms in long drafts." },
      { title: "Log cleanup", description: "Replace noisy markers in exported logs." },
      { title: "Template updates", description: "Swap placeholders quickly before publishing." }
    ],
    examples: [
      { title: "Term replacement", input: "find old-name", output: "replace with new-name" },
      { title: "Case-sensitive edit", input: "API and api", output: "Replace only exact case when enabled" }
    ],
    faq: [
      { question: "Does this replace all matches?", answer: "Yes, the Replace All action updates every match." },
      { question: "Is there regex mode?", answer: "No, it performs plain text replacement with escaped matching." }
    ],
    workflow: [
      { name: "Remove Extra Spaces", href: "/tools/remove-extra-spaces.html", icon: "🧹" },
      { name: "Sort Text Lines", href: "/tools/sort-text-lines.html", icon: "🔤" },
      { name: "Word Counter", href: "/tools/word-counter.html", icon: "📝" }
    ]
  },
  "hash-generator": {
    slug: "hash-generator",
    heroEyebrow: "Digest computation utility",
    heroTitle: "Hash generator",
    heroDescription: "Generate SHA-256 or SHA-1 hashes for text input using Web Crypto in modern browsers.",
    categoryName: "Developer Tools",
    categoryHref: "/categories/developer-tools.html",
    benefits: [
      "Supports SHA-256 and SHA-1 digest output.",
      "Copy-ready hash output for developer workflows.",
      "No transmission of input text to remote servers."
    ],
    useCases: [
      { title: "Integrity checks", description: "Verify text fingerprints quickly during testing." },
      { title: "Config comparison", description: "Compare hash values between payload variants." },
      { title: "Debug tooling", description: "Generate deterministic digests for local scripts." }
    ],
    examples: [
      { title: "SHA-256", input: "hello", output: "2cf24dba5fb0..." },
      { title: "SHA-1", input: "hello", output: "aaf4c61ddcc5..." }
    ],
    faq: [
      { question: "Is SHA-1 still secure?", answer: "SHA-1 is legacy and should not be used for new security-critical workflows." },
      { question: "Why is compute disabled in some contexts?", answer: "Web Crypto requires modern browser support and secure contexts." }
    ],
    workflow: [
      { name: "Password Generator", href: "/tools/password-generator.html", icon: "🔑" },
      { name: "UUID Generator", href: "/tools/uuid-generator.html", icon: "🆔" },
      { name: "Base64 Encoder", href: "/tools/base64-encoder.html", icon: "📎" }
    ]
  },
  "lorem-ipsum": {
    slug: "lorem-ipsum",
    heroEyebrow: "Placeholder content helper",
    heroTitle: "Lorem Ipsum generator",
    heroDescription: "Generate classic placeholder paragraphs for layouts, prototypes, and publishing previews.",
    categoryName: "Text Tools",
    categoryHref: "/categories/text-tools.html",
    benefits: [
      "Quickly create multiple placeholder paragraphs.",
      "Easy copy flow for mockups and templates.",
      "Generated text remains in your local session."
    ],
    useCases: [
      { title: "UI mockups", description: "Fill card and section layouts with realistic filler." },
      { title: "CMS previews", description: "Test typography and spacing before final copy is ready." },
      { title: "Template design", description: "Prototype content-heavy pages rapidly." }
    ],
    examples: [
      { title: "3 paragraphs", input: "Count set to 3", output: "Three lorem ipsum blocks" },
      { title: "Large batch", input: "Count set to 20", output: "Long placeholder output for stress testing" }
    ],
    faq: [
      { question: "Can I generate many paragraphs?", answer: "Yes, up to 50 paragraphs at once." },
      { question: "Does this use AI text generation?", answer: "No, it uses a fixed lorem ipsum block." }
    ],
    workflow: [
      { name: "Word Counter", href: "/tools/word-counter.html", icon: "📝" },
      { name: "Read Time Calculator", href: "/tools/read-time-calculator.html", icon: "⏱️" },
      { name: "Case Converter", href: "/tools/case-converter.html", icon: "🔠" }
    ]
  },
  "password-generator": {
    slug: "password-generator",
    heroEyebrow: "Credential helper",
    heroTitle: "Password generator",
    heroDescription: "Generate strong random passwords with configurable length and character sets.",
    categoryName: "Developer Tools",
    categoryHref: "/categories/developer-tools.html",
    benefits: [
      "Uses browser cryptography where available.",
      "Includes uppercase, lowercase, numbers, and symbol toggles.",
      "No passwords are transmitted or stored by ToolBite."
    ],
    useCases: [
      { title: "Account setup", description: "Create strong credentials for new services." },
      { title: "Rotation workflows", description: "Refresh compromised or expired passwords quickly." },
      { title: "Test fixtures", description: "Generate varied samples for QA workflows." }
    ],
    examples: [
      { title: "Default generation", input: "Length 16 with all sets", output: "Strong mixed-character password" },
      { title: "Custom generation", input: "Length 24 without symbols", output: "Long alphanumeric password" }
    ],
    faq: [
      { question: "Is generation secure?", answer: "It uses Web Crypto random values in supported browsers." },
      { question: "Are generated passwords saved?", answer: "No, generated values stay in your current browser session." }
    ],
    workflow: [
      { name: "Hash Generator", href: "/tools/hash-generator.html", icon: "🔢" },
      { name: "UUID Generator", href: "/tools/uuid-generator.html", icon: "🆔" },
      { name: "Password guide", href: "/guides/password-guide.html", icon: "📘" }
    ]
  },
  "qr-generator": {
    slug: "qr-generator",
    heroEyebrow: "Code generation utility",
    heroTitle: "QR code generator",
    heroDescription: "Generate QR codes for text and URLs, then download as PNG directly from your browser.",
    categoryName: "Image Tools",
    categoryHref: "/categories/image-tools.html",
    benefits: [
      "Create QR output instantly with adjustable size.",
      "Download PNG files without external processing.",
      "Supports configurable error correction levels."
    ],
    useCases: [
      { title: "Link sharing", description: "Turn URLs into scannable QR codes for print or digital use." },
      { title: "Event assets", description: "Generate QR codes for menus, forms, and campaigns." },
      { title: "Product tags", description: "Embed quick-scan references in packaging workflows." }
    ],
    examples: [
      { title: "URL QR", input: "https://toolbite.org", output: "Scannable QR image" },
      { title: "Plain text QR", input: "Support code 1234", output: "QR for direct scan entry" }
    ],
    faq: [
      { question: "Can I download generated QR files?", answer: "Yes, download as PNG after generating." },
      { question: "Does this require account setup?", answer: "No, generation works instantly in-browser." }
    ],
    workflow: [
      { name: "URL Encoder", href: "/tools/url-encoder.html", icon: "🌐" },
      { name: "Text to Slug", href: "/tools/text-to-slug.html", icon: "🔗" },
      { name: "QR guide", href: "/guides/qr-code-guide.html", icon: "📘" }
    ]
  },
  "read-time-calculator": {
    slug: "read-time-calculator",
    heroEyebrow: "Publishing estimator",
    heroTitle: "Reading time calculator",
    heroDescription: "Estimate reading duration from word count and adjustable words-per-minute speed.",
    categoryName: "SEO Tools",
    categoryHref: "/categories/seo-tools.html",
    benefits: [
      "Live updates while typing or pasting.",
      "Custom WPM input for realistic estimates.",
      "Quick summary for content planning workflows."
    ],
    useCases: [
      { title: "Editorial planning", description: "Set article length targets before publishing." },
      { title: "UX tuning", description: "Balance readability and depth in landing content." },
      { title: "SEO workflows", description: "Estimate engagement timing for long-form pages." }
    ],
    examples: [
      { title: "Default pace", input: "800 words at 200 WPM", output: "Around 4 minutes" },
      { title: "Faster pace", input: "800 words at 300 WPM", output: "Around 2 minutes 40 seconds" }
    ],
    faq: [
      { question: "Can I adjust reading speed?", answer: "Yes, set your own WPM value between 1 and 400." },
      { question: "Does this store my text?", answer: "No, text stays in your browser." }
    ],
    workflow: [
      { name: "Word Counter", href: "/tools/word-counter.html", icon: "📝" },
      { name: "Text to Slug", href: "/tools/text-to-slug.html", icon: "🔗" },
      { name: "Case Converter", href: "/tools/case-converter.html", icon: "🔠" }
    ]
  },
  "remove-duplicate-lines": {
    slug: "remove-duplicate-lines",
    heroEyebrow: "List cleanup utility",
    heroTitle: "Remove duplicate lines",
    heroDescription: "Keep only first occurrences from repeated line sets in pasted logs, lists, and exports.",
    categoryName: "Text Tools",
    categoryHref: "/categories/text-tools.html",
    benefits: [
      "Deduplicates large pasted line sets quickly.",
      "Optional trimmed comparison handles messy spacing.",
      "Runs entirely client-side for privacy."
    ],
    useCases: [
      { title: "Keyword cleanup", description: "Remove repeated SEO terms from working lists." },
      { title: "Log processing", description: "Reduce repeated entries before manual review." },
      { title: "Inventory prep", description: "Normalize item lists before sorting or import." }
    ],
    examples: [
      { title: "Simple dedupe", input: "apple / apple / orange", output: "apple / orange" },
      { title: "Trim compare", input: "item and item  ", output: "Single kept line with trim mode on" }
    ],
    faq: [
      { question: "Does order stay the same?", answer: "Yes, the first occurrence order is preserved." },
      { question: "Can it ignore leading and trailing spaces?", answer: "Yes, enable trim-compare mode." }
    ],
    workflow: [
      { name: "Sort Text Lines", href: "/tools/sort-text-lines.html", icon: "🔤" },
      { name: "Remove Extra Spaces", href: "/tools/remove-extra-spaces.html", icon: "🧹" },
      { name: "Find & Replace", href: "/tools/find-replace.html", icon: "🔁" }
    ]
  },
  "remove-extra-spaces": {
    slug: "remove-extra-spaces",
    heroEyebrow: "Whitespace cleanup utility",
    heroTitle: "Remove extra spaces",
    heroDescription: "Collapse repeated spaces, trim lines, and remove blank rows from pasted content.",
    categoryName: "Text Tools",
    categoryHref: "/categories/text-tools.html",
    benefits: [
      "Three cleanup modes for common whitespace issues.",
      "Fast copy and clear actions for editing workflows.",
      "No data leaves your browser during processing."
    ],
    useCases: [
      { title: "Draft cleanup", description: "Fix copied text before publishing." },
      { title: "Data prep", description: "Normalize line formatting in exported lists." },
      { title: "Code snippets", description: "Tidy spacing before sharing snippets." }
    ],
    examples: [
      { title: "Collapse mode", input: "Many spaces between words", output: "Single-space sentence" },
      { title: "No blank lines", input: "Text with empty rows", output: "Contiguous non-empty lines" }
    ],
    faq: [
      { question: "Can I trim each line separately?", answer: "Yes, use the Trim each line action." },
      { question: "Will this remove all line breaks?", answer: "No, only when specific cleanup mode requires it." }
    ],
    workflow: [
      { name: "Find & Replace", href: "/tools/find-replace.html", icon: "🔁" },
      { name: "Remove Duplicate Lines", href: "/tools/remove-duplicate-lines.html", icon: "📋" },
      { name: "Sort Text Lines", href: "/tools/sort-text-lines.html", icon: "🔤" }
    ]
  },
  "sort-text-lines": {
    slug: "sort-text-lines",
    heroEyebrow: "List organization helper",
    heroTitle: "Sort text lines",
    heroDescription: "Sort pasted lines ascending or descending with optional case-insensitive behavior.",
    categoryName: "Text Tools",
    categoryHref: "/categories/text-tools.html",
    benefits: [
      "Quick alphabetical sorting for long lists.",
      "Reverse-order option for alternate outputs.",
      "Case-insensitive mode for cleaner grouping."
    ],
    useCases: [
      { title: "Checklist cleanup", description: "Order line items for better readability." },
      { title: "Keyword management", description: "Sort SEO term batches before review." },
      { title: "Data normalization", description: "Align text exports before diffing." }
    ],
    examples: [
      { title: "Ascending order", input: "banana / apple", output: "apple / banana" },
      { title: "Descending order", input: "apple / banana", output: "banana / apple" }
    ],
    faq: [
      { question: "Does this support numeric sorting in text?", answer: "Yes, numeric-aware locale sorting is used." },
      { question: "Can I ignore case while sorting?", answer: "Yes, enable ignore-case before sorting." }
    ],
    workflow: [
      { name: "Remove Duplicate Lines", href: "/tools/remove-duplicate-lines.html", icon: "📋" },
      { name: "Remove Extra Spaces", href: "/tools/remove-extra-spaces.html", icon: "🧹" },
      { name: "Find & Replace", href: "/tools/find-replace.html", icon: "🔁" }
    ]
  },
  "url-encoder": {
    slug: "url-encoder",
    heroEyebrow: "URL utility",
    heroTitle: "URL encoder and decoder",
    heroDescription: "Encode and decode URL components or full URLs for safer links and debug workflows.",
    categoryName: "Developer Tools",
    categoryHref: "/categories/developer-tools.html",
    benefits: [
      "Supports full URL mode and component mode.",
      "Switch between encode and decode instantly.",
      "Works locally with no server round-trips."
    ],
    useCases: [
      { title: "Query parameter prep", description: "Encode values before building links." },
      { title: "Broken link debugging", description: "Decode escaped URLs during diagnostics." },
      { title: "API tooling", description: "Prepare encoded paths for test requests." }
    ],
    examples: [
      { title: "Component encode", input: "a b&c", output: "a%20b%26c" },
      { title: "Decode URI", input: "hello%20world", output: "hello world" }
    ],
    faq: [
      { question: "What is full URL mode?", answer: "It uses encodeURI/decodeURI to preserve URL structure characters." },
      { question: "What is component mode?", answer: "It uses encodeURIComponent/decodeURIComponent for value-level encoding." }
    ],
    workflow: [
      { name: "Base64 Encoder", href: "/tools/base64-encoder.html", icon: "📎" },
      { name: "QR Generator", href: "/tools/qr-generator.html", icon: "📱" },
      { name: "URL encoding guide", href: "/guides/url-encoding-guide.html", icon: "📘" }
    ]
  },
  "uuid-generator": {
    slug: "uuid-generator",
    heroEyebrow: "IDENTIFIER UTILITY",
    heroTitle: "UUID / GUID generator",
    heroDescription: "Generate one or many random v4 UUIDs for databases, APIs, and fixture workflows.",
    categoryName: "Developer Tools",
    categoryHref: "/categories/developer-tools.html",
    benefits: [
      "Generates up to 50 UUIDs per run.",
      "Copy-ready output for rapid integration.",
      "Uses browser capabilities without server dependency."
    ],
    useCases: [
      { title: "Database seeds", description: "Create IDs for local fixtures and migrations." },
      { title: "API tests", description: "Generate realistic identifiers for request testing." },
      { title: "Manual references", description: "Produce unique values for ad-hoc workflows." }
    ],
    examples: [
      { title: "Single UUID", input: "Count 1", output: "One v4 UUID line" },
      { title: "Batch UUIDs", input: "Count 10", output: "Ten UUID lines" }
    ],
    faq: [
      { question: "Are UUIDs version 4?", answer: "Yes, generated values follow v4 format." },
      { question: "Can I generate multiple at once?", answer: "Yes, set count between 1 and 50." }
    ],
    workflow: [
      { name: "Password Generator", href: "/tools/password-generator.html", icon: "🔑" },
      { name: "Hash Generator", href: "/tools/hash-generator.html", icon: "🔢" },
      { name: "UUID guide", href: "/guides/uuid-guid-guide.html", icon: "📘" }
    ]
  }
};

export function getToolPageContent(slug: string): ToolPageContent {
  const record = toolPageContent[slug];
  if (!record) {
    throw new Error(`Missing tool content for ${slug}`);
  }
  const exp = TOOL_SEO_EXPANSIONS[slug];
  if (!exp) {
    return record;
  }
  return {
    ...record,
    heroDescription: `${record.heroDescription} ${exp.heroAppend}`.trim(),
    benefits: [...record.benefits, ...exp.extraBenefits],
    faq: [...record.faq, ...exp.extraFaq]
  };
}

export function getToolRecordBySlug(slug: string) {
  return getAllTools().find((tool) => tool.url === `tools/${slug}.html`);
}
