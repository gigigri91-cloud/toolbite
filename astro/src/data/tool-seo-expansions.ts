export type ToolSeoExpansion = {
  heroAppend: string;
  extraBenefits: string[];
  extraFaq: Array<{ question: string; answer: string }>;
};

export const TOOL_SEO_EXPANSIONS: Record<string, ToolSeoExpansion> = {
  "json-formatter": {
    heroAppend:
      "JSON is the backbone of modern APIs, configuration files, and data interchange. Malformed JSON breaks builds, crashes parsers, and wastes debugging time. The ToolBite JSON formatter validates your syntax in real time, highlights errors at the exact line, and produces clean output you can paste directly into your codebase. Unlike server-based formatters, your data never leaves the browser — useful when working with credentials, internal API responses, or confidential configuration files.",
    extraBenefits: [
      "Use the beautify mode to make minified API responses readable during debugging sessions. Paste the raw response, format it, and inspect the structure before writing any parsing logic.",
      "Before pushing configuration files to version control, run them through the validator. A single trailing comma or unquoted key can break a deployment pipeline silently."
    ],
    extraFaq: [
      {
        question: "Can I format minified JSON from a production API?",
        answer:
          "Yes. Paste the minified string directly into the input and click Format / Beautify. The formatter expands it into indented, readable output without modifying the data values."
      },
      {
        question: "Does the JSON formatter support large files?",
        answer:
          "It handles typical API payloads and config files well. Very large files (several megabytes) may be slower depending on your browser and device, but all processing stays local."
      }
    ]
  },
  "base64-encoder": {
    heroAppend:
      "Base64 encoding converts binary data into ASCII text so it can travel safely through systems that handle text only — email attachments, JSON payloads, data URIs, and HTTP headers all rely on it. The ToolBite encoder handles both encoding and decoding in one interface. Paste a string to encode it, or paste a Base64 string to decode it back. No file uploads, no server calls — the conversion runs entirely in your browser tab.",
    extraBenefits: [
      "When embedding small images or icons directly into CSS or HTML as data URIs, use the encoder to convert the binary to Base64 first. This eliminates one HTTP request per asset.",
      "JWT tokens use Base64URL encoding for their header and payload segments. Decode the middle segment of any JWT here to inspect the claims without using a separate tool."
    ],
    extraFaq: [
      {
        question: "What is the difference between Base64 and Base64URL?",
        answer:
          "Base64URL replaces + with - and / with _ to make the output safe for URLs and filenames. Standard Base64 uses + and / which can break URL parsing. Both variants are supported."
      },
      {
        question: "Can I encode binary files with this tool?",
        answer:
          "This tool works with text input. For binary files, you would need to read the file as bytes first. For text content, strings, and small data URIs it works directly."
      }
    ]
  },
  "jwt-decoder": {
    heroAppend:
      "JSON Web Tokens carry authentication claims between services and clients. Every JWT has three Base64URL-encoded segments: a header describing the algorithm, a payload containing the claims, and a signature for verification. The ToolBite JWT decoder splits and decodes the header and payload instantly so you can inspect expiry timestamps, user roles, issued-at times, and custom claims without writing any code. Useful during API integration, debugging auth flows, or auditing tokens from third-party services.",
    extraBenefits: [
      "When an API returns a 401 Unauthorized error, decode the token you are sending to check whether it has expired. The exp claim is a Unix timestamp — compare it to the current time to confirm.",
      "During OAuth integration testing, decode the access token to verify the scopes and audience fields match what your application expects before writing validation logic."
    ],
    extraFaq: [
      {
        question: "Does this tool verify the JWT signature?",
        answer:
          "No. This tool decodes the header and payload for inspection only. Signature verification requires the secret key or public key and should be done server-side or with a dedicated library."
      },
      {
        question: "Is it safe to paste a production JWT here?",
        answer:
          "Decoding runs entirely in your browser with no server calls. However, treat production tokens as sensitive credentials and rotate them if you paste them into any tool you do not fully control."
      }
    ]
  },
  "uuid-generator": {
    heroAppend:
      "UUIDs (Universally Unique Identifiers) are 128-bit values used to identify records, sessions, requests, and resources without a central authority assigning them. Version 4 UUIDs use random bytes, giving a collision probability so low it is negligible for any practical application. The ToolBite UUID generator produces cryptographically random v4 UUIDs using the browser's built-in crypto API — no server call, no predictable sequence, ready to copy and paste into your database migration, code, or API test.",
    extraBenefits: [
      "When seeding test data for a database, generate a batch of UUIDs here and paste them directly into your INSERT statements or fixture files. Each one is guaranteed unique across the batch.",
      "Use UUIDs as idempotency keys when retrying API requests. A unique key per request prevents duplicate processing even if the request is sent multiple times."
    ],
    extraFaq: [
      {
        question: "Are the UUIDs generated here safe to use as primary keys?",
        answer:
          "Yes. The generator uses crypto.randomUUID() or a cryptographically secure fallback, producing standard RFC 4122 version 4 UUIDs suitable for database primary keys, session IDs, and resource identifiers."
      },
      {
        question: "What is the difference between UUID and GUID?",
        answer:
          "They are the same concept. GUID (Globally Unique Identifier) is Microsoft's term for what the RFC standard calls UUID. The format and uniqueness properties are identical."
      }
    ]
  },
  "hash-generator": {
    heroAppend:
      "Cryptographic hash functions take any input and produce a fixed-length fingerprint that is practically impossible to reverse. SHA-256 produces a 256-bit output and is the standard for data integrity checks, digital signatures, and password storage (with a salt). SHA-1 produces a 160-bit output and is still used in legacy systems though no longer recommended for security-critical applications. The ToolBite hash generator computes both instantly in your browser — paste any text and get the hash in under a second.",
    extraBenefits: [
      "Verify file integrity by hashing the content and comparing against a published checksum. If the hashes match, the file has not been tampered with or corrupted during transfer.",
      "When testing APIs that use HMAC signatures, hash the expected payload to confirm your signing logic produces the correct output before sending authenticated requests."
    ],
    extraFaq: [
      {
        question: "Can I use SHA-256 output directly as a password hash?",
        answer:
          "Not without a salt and a slow hashing algorithm like bcrypt or Argon2. SHA-256 is fast by design, which makes it vulnerable to brute-force attacks on passwords. Use it for data integrity, not password storage."
      },
      {
        question: "Is MD5 available in this tool?",
        answer:
          "This tool provides SHA-1 and SHA-256. MD5 is cryptographically broken and not recommended for any security use. For checksums where speed matters and security does not, MD5 libraries are available in most languages."
      }
    ]
  },
  "password-generator": {
    heroAppend:
      "Weak passwords are the leading cause of account compromises. Dictionary words, names, and short strings can be cracked in seconds with modern hardware. The ToolBite password generator uses your browser's cryptographic random number generator to produce passwords that contain no patterns, no dictionary words, and no predictable sequences. Adjust the length and character set to match your target system's requirements, then copy the result. The password is generated locally — it is never transmitted or logged.",
    extraBenefits: [
      "For service accounts and API credentials that do not need to be memorised, generate a 32-character password with all character types. Store it in your password manager immediately after generating it.",
      "Some legacy systems reject certain symbols. If a generated password fails validation, regenerate with symbols disabled. Length compensates for the reduced character set."
    ],
    extraFaq: [
      {
        question: "How long should a password be for a standard account?",
        answer:
          "NIST guidelines recommend a minimum of 15 characters for standard accounts. For financial accounts or master passwords, use 20 or more characters. Length has the greatest impact on cracking resistance."
      },
      {
        question: "Can I trust a browser-based password generator?",
        answer:
          "This generator uses the Web Crypto API (crypto.getRandomValues), the same source of randomness used by security-focused applications. The output is not transmitted — it exists only in your browser tab."
      }
    ]
  },
  "url-encoder": {
    heroAppend:
      "URLs can only contain a limited set of ASCII characters. Spaces, special characters, and non-ASCII text must be percent-encoded before they appear in a URL or query string. The ToolBite URL encoder converts characters to their %XX equivalents and decodes them back. This is useful when constructing API query parameters, debugging redirect URLs, or encoding values that will be embedded in links shared via email or messaging platforms where special characters may be misinterpreted.",
    extraBenefits: [
      "When building query strings manually for API testing, encode each parameter value separately before joining them. Encoding the entire URL at once can encode the delimiters, breaking the structure.",
      "Decode a URL you received to inspect its parameters when the raw string is difficult to read. Percent-encoded values in analytics URLs or redirect chains become readable instantly."
    ],
    extraFaq: [
      {
        question: "What is the difference between encodeURI and encodeURIComponent?",
        answer:
          "encodeURI encodes a full URL but preserves characters like / : ? & that have structural meaning. encodeURIComponent encodes everything including those characters and is used for individual parameter values."
      },
      {
        question: "Why does a space sometimes appear as + and sometimes as %20?",
        answer:
          "Both are valid in different contexts. %20 is the standard percent-encoding for a space. The + sign is used as a space only in application/x-www-form-urlencoded format, commonly seen in form submissions."
      }
    ]
  },
  "csv-to-json": {
    heroAppend:
      "CSV is the default export format for spreadsheets, databases, and data pipelines, but most modern APIs and applications expect JSON. Converting manually is tedious and error-prone for files with many columns. The ToolBite CSV to JSON converter reads your headers as keys and maps each row to a JSON object. Paste your CSV, adjust the delimiter if needed, and copy the JSON array. The conversion runs in your browser — no file upload, no server processing, no data retention.",
    extraBenefits: [
      "When preparing test fixtures for a backend API, export your test data from a spreadsheet as CSV, convert it here, and paste the JSON array directly into your fixture file or seed script.",
      "If your CSV uses a semicolon or tab delimiter instead of a comma, the converter handles those too. Check the delimiter setting before converting to avoid merged column values."
    ],
    extraFaq: [
      {
        question: "Does the converter handle CSV files with quoted fields?",
        answer:
          "Yes. Fields that contain commas or line breaks are typically wrapped in quotes in the CSV format. The converter handles standard RFC 4180 quoting so those fields are parsed as single values."
      },
      {
        question: "What happens to empty cells in the CSV?",
        answer:
          "Empty cells are converted to empty strings in the JSON output by default. Depending on your use case you may want to post-process the output to replace empty strings with null values."
      }
    ]
  },
  "qr-generator": {
    heroAppend:
      "QR codes encode text, URLs, contact details, and other data into a scannable matrix pattern readable by any smartphone camera. They are widely used for sharing links at events, product packaging, printed materials, and contactless interactions. The ToolBite QR code generator creates a QR code from any text or URL you enter. The output is rendered as a downloadable image in your browser with no server processing — the entire generation runs client-side using a JavaScript library.",
    extraBenefits: [
      "Use QR codes in presentations or printed handouts to link directly to a tool, guide, or resource without requiring attendees to type a URL. Test the code with your phone before printing.",
      "For business cards or product labels, keep the destination URL short. Long URLs produce denser QR codes that are harder to scan at small print sizes."
    ],
    extraFaq: [
      {
        question: "What is the maximum amount of text a QR code can hold?",
        answer:
          "A QR code can hold up to about 4,000 alphanumeric characters, but longer content produces denser patterns that are harder to scan. For URLs, keep them under 200 characters for reliable scanning."
      },
      {
        question: "Can I customise the color or logo of the generated QR code?",
        answer:
          "This tool generates standard black-and-white QR codes. Custom colors and embedded logos require additional error correction margin and are best done with dedicated QR design tools."
      }
    ]
  },
  "word-counter": {
    heroAppend:
      "Word count matters in more contexts than most writers realise. Blog platforms, academic submissions, job applications, social media posts, and legal documents all have length requirements or recommendations. The ToolBite word counter tracks words, characters (with and without spaces), sentences, and paragraphs in real time as you type or paste. There is no submit button — the count updates instantly. Your text stays in your browser tab and is not sent to any server.",
    extraBenefits: [
      "Use the character count when writing meta descriptions for SEO. Search engines typically display around 155-160 characters, so staying within that range prevents truncation in search results.",
      "For academic writing, the sentence count helps you monitor average sentence length. Shorter average sentences improve readability scores, which matters for content aimed at a general audience."
    ],
    extraFaq: [
      {
        question: "How does the tool count sentences?",
        answer:
          "Sentences are counted by detecting sentence-ending punctuation: periods, exclamation marks, and question marks followed by a space or end of text. Abbreviations and ellipses can occasionally produce slightly higher counts."
      },
      {
        question: "Does the word counter include headings and list items?",
        answer:
          "Yes. Every word in the input field is counted regardless of whether it comes from body text, a heading, or a list. If you paste formatted content, all visible text contributes to the count."
      }
    ]
  },
  "case-converter": {
    heroAppend:
      "Text case consistency matters for code, content, and data processing. Variable names follow camelCase or snake_case conventions depending on the language. Titles follow Title Case. SQL identifiers are often UPPER_CASE. Copying text from one context to another frequently requires a case conversion that is tedious to do manually. The ToolBite case converter handles uppercase, lowercase, title case, sentence case, camelCase, snake_case, and kebab-case — select the output format and paste your text.",
    extraBenefits: [
      "When renaming variables or database columns during a refactor, paste the existing names in bulk and convert the entire list to the target convention in one step.",
      "Converting article titles to title case manually is error-prone because rules about which words to capitalise vary. The tool applies consistent title case rules so the output is uniform."
    ],
    extraFaq: [
      {
        question: "What is the difference between camelCase and PascalCase?",
        answer:
          "camelCase starts with a lowercase letter and capitalises each subsequent word: myVariableName. PascalCase (also called UpperCamelCase) capitalises every word including the first: MyClassName. Both are supported."
      },
      {
        question: "Does the converter preserve punctuation and numbers?",
        answer:
          "Yes. Only the alphabetic characters are affected by the case conversion. Numbers, punctuation, and special characters remain in their original position and form."
      }
    ]
  },
  "find-replace": {
    heroAppend:
      "Find and replace is one of the most routine text editing operations, but browser text boxes do not support it natively. The ToolBite find and replace tool lets you search for a string and replace all occurrences, a specific occurrence, or just preview matches before committing. Plain text mode handles literal matches; regex mode supports pattern matching for advanced substitutions. Paste your text, define your search and replacement, and copy the result.",
    extraBenefits: [
      "When cleaning exported data or logs, use find and replace to normalise inconsistent formatting — replacing double spaces with single spaces, standardising date formats, or removing unwanted prefixes across hundreds of lines.",
      "In regex mode, you can capture groups and reference them in the replacement. For example, reformat dates from DD/MM/YYYY to YYYY-MM-DD using capture groups in the pattern."
    ],
    extraFaq: [
      {
        question: "Does the find and replace support regular expressions?",
        answer:
          "Yes. Toggle regex mode to use JavaScript-compatible regular expressions in the search field. The replacement field supports backreferences using $1, $2 syntax for captured groups."
      },
      {
        question: "Is the replacement case-sensitive?",
        answer:
          "By default, yes. There is a case-insensitive option that adds the i flag to the regex or performs a case-insensitive string comparison depending on the mode selected."
      }
    ]
  },
  "lorem-ipsum": {
    heroAppend:
      "Lorem ipsum placeholder text has been used in typography and design since the 1500s. Designers use it to fill layouts before real copy is available, allowing clients and reviewers to evaluate visual design without being distracted by content. The ToolBite Lorem ipsum generator produces the standard Latin placeholder text in configurable quantities — choose paragraphs, sentences, or words. The output is ready to paste into Figma, a CMS, a code template, or any document that needs realistic-looking placeholder text.",
    extraBenefits: [
      "When prototyping a blog or article layout, generate several paragraphs of different lengths to test how the design handles varying content heights — especially useful for card grids and multi-column layouts.",
      "For email template testing, generate placeholder text that roughly matches the expected word count of real content. This gives a more accurate preview of line breaks and layout at different client widths."
    ],
    extraFaq: [
      {
        question: "Is Lorem ipsum real Latin?",
        answer:
          "It is derived from a passage in Cicero's De Finibus Bonorum et Malorum from 45 BC, but the text has been scrambled and words altered over centuries of typographic use. It reads as Latin but is not meaningful text."
      },
      {
        question: "Can I generate placeholder text in English instead of Lorem ipsum?",
        answer:
          "This tool generates standard Lorem ipsum Latin placeholder text. For English-language placeholder text, you would need a different generator that uses real English words or sentences."
      }
    ]
  },
  "text-to-slug": {
    heroAppend:
      "URL slugs are the human-readable, SEO-friendly segments of a web address that describe the page content. A well-formed slug uses only lowercase letters, numbers, and hyphens — no spaces, no special characters, no accented letters. This matters because slugs appear in URLs that are indexed by search engines, shared in links, and stored in databases. The ToolBite text to slug converter applies all the right transformations: lowercase conversion, accent removal, space-to-hyphen replacement, and special character stripping.",
    extraBenefits: [
      "When publishing blog posts or documentation, generate the slug from the title before saving it to your CMS. Editing slugs after publication breaks inbound links and requires redirects.",
      "For e-commerce product URLs, slugs derived from product names improve both readability and search visibility. Consistent slug formatting across thousands of products also makes URL patterns predictable."
    ],
    extraFaq: [
      {
        question: "How are accented characters handled?",
        answer:
          "Accented characters are converted to their ASCII equivalents: é becomes e, ü becomes u, ñ becomes n. This produces slugs that work in all URL contexts without percent-encoding."
      },
      {
        question: "What happens to numbers in the input text?",
        answer:
          "Numbers are preserved in the slug as-is. Only special characters and spaces are transformed. A title like '10 Best Tools' becomes '10-best-tools'."
      }
    ]
  },
  "image-compressor": {
    heroAppend:
      "Large image files slow down web pages, consume mobile data, and hurt Core Web Vitals scores. Compression reduces file size by removing data that is imperceptible to human vision — either losslessly (preserving every pixel) or with lossy compression (accepting minor quality tradeoffs for significant size reductions). The ToolBite image compressor processes JPEG, PNG, and WebP files entirely in your browser using the Canvas API. No image is uploaded to a server. Adjust the quality slider to balance file size against visual quality for your use case.",
    extraBenefits: [
      "Before uploading images to a CMS, e-commerce platform, or social media, compress them to reduce page load times. A 2MB hero image compressed to 200KB loads ten times faster with minimal visible quality difference.",
      "For product photography with consistent subjects, find a quality setting that produces acceptable results at small sizes, then apply the same setting to the full batch for consistent output."
    ],
    extraFaq: [
      {
        question: "What is the difference between lossy and lossless compression?",
        answer:
          "Lossless compression reduces file size without discarding any image data — the decompressed image is pixel-identical to the original. Lossy compression discards imperceptible data to achieve much higher compression ratios at the cost of minor quality reduction."
      },
      {
        question: "Which format should I use for web images?",
        answer:
          "WebP provides the best compression for web use, typically 25-35% smaller than JPEG at equivalent quality. Use JPEG for photographs, PNG for images with transparency or sharp edges like logos, and WebP when browser support is not a constraint."
      }
    ]
  },
  "color-palette-generator": {
    heroAppend:
      "Color palettes define the visual identity of a design project. Choosing colors that work well together requires understanding relationships like complementary, analogous, and triadic combinations. The ToolBite color palette generator produces harmonious color sets that you can use as a starting point for a brand, UI, or illustration project. Each palette includes hex codes ready to copy into your design tool or CSS file. Palettes are generated randomly — refresh to get a new set until you find combinations that fit your direction.",
    extraBenefits: [
      "When starting a new project without a defined brand, generate several palettes and screenshot the ones that feel right. Bring the shortlist to a stakeholder review rather than presenting a single option.",
      "Copy the hex codes into your design tool's color styles or CSS custom properties early in the project. Centralising the palette makes it easy to swap colors globally if the direction changes."
    ],
    extraFaq: [
      {
        question: "How do I use a hex color code in CSS?",
        answer:
          "Use it as the value for any color property: color: #4d9fff; or background-color: #090e18; The six-character hex code specifies the red, green, and blue components in pairs."
      },
      {
        question: "Can I export the palette to a specific format?",
        answer:
          "Currently the tool displays hex codes that you can copy individually. For formats like ASE, Sketch palettes, or Tailwind config, copy the hex values and paste them into your target tool's import or configuration."
      }
    ]
  },
  "read-time-calculator": {
    heroAppend:
      "Reading time estimates help writers set expectations for their audience and help editors evaluate content length. The standard reference point is 200-250 words per minute for average adult reading speed, though technical content is read more slowly and narrative content more quickly. The ToolBite reading time calculator uses 230 words per minute as its baseline and updates the estimate in real time as you type or paste. Alongside the reading time, it also shows word count, character count, and sentence count.",
    extraBenefits: [
      "Add the reading time estimate to your blog post header or email newsletter to let readers decide whether to read now or save for later. Content with a visible reading time typically sees higher engagement.",
      "For technical documentation, the reading time estimate helps identify sections that may be too long. If a single section takes more than five minutes to read, consider splitting it or adding a summary at the top."
    ],
    extraFaq: [
      {
        question: "Is 230 words per minute an accurate reading speed?",
        answer:
          "It is a widely-used average for adult readers of general content. Technical or highly specialised content is typically read at 150-180 words per minute. Narrative fiction can be read faster. Use the estimate as a guide, not a precise measurement."
      },
      {
        question: "Does the calculator account for images or embedded media?",
        answer:
          "No. The calculation is based on word count only. A common convention is to add 10-12 seconds per image when estimating total content consumption time for media-heavy posts."
      }
    ]
  },
  "sort-text-lines": {
    heroAppend:
      "Sorting lines of text is a common operation when working with lists of names, items, configuration values, or log entries that need to be ordered or deduplicated. Text editors and spreadsheets can sort, but they require saving a file or creating a new document. The ToolBite line sorter accepts pasted text and returns it sorted alphabetically, in reverse, numerically, or randomly — your choice. The result is ready to copy back into whatever you are working on without leaving the browser.",
    extraBenefits: [
      "When reviewing a list of dependencies, imports, or configuration keys, sort them alphabetically to make it easier to spot duplicates, inconsistencies, or missing entries at a glance.",
      "For random sorting, paste a list of names or items and use the shuffle option to randomise the order — useful for assigning tasks, creating randomised test data, or running a fair draw."
    ],
    extraFaq: [
      {
        question: "Does the sorter handle numbers correctly?",
        answer:
          "Numeric sort mode treats values as numbers so 10 comes after 9 rather than between 1 and 2 as it would in alphabetical sorting. Use alphabetical mode for strings and numeric mode for lists that contain numbers."
      },
      {
        question: "What happens to blank lines in the input?",
        answer:
          "By default, blank lines are preserved in their sorted position. There is an option to strip blank lines before sorting if you want a clean output without gaps."
      }
    ]
  },
  "remove-duplicate-lines": {
    heroAppend:
      "Duplicate lines appear in exported data, logs, lists assembled from multiple sources, and copy-pasted content. Removing them manually is impractical for anything longer than a few dozen lines. The ToolBite duplicate line remover processes the entire input and returns only unique lines, preserving the first occurrence and discarding subsequent repeats. Case-sensitive and case-insensitive modes are both available — use case-insensitive mode when the same value appears in different capitalizations that should be treated as the same entry.",
    extraBenefits: [
      "After merging two email lists or contact exports, remove duplicates to ensure no recipient receives the same message twice. Paste the combined list, remove duplicates, and copy the clean result.",
      "Log files often contain repeated warning or error lines. Removing duplicates gives a cleaner view of the unique error types present without the noise of repeated identical entries."
    ],
    extraFaq: [
      {
        question: "Does the tool preserve the original order of lines?",
        answer:
          "Yes. The first occurrence of each unique line is kept in its original position. Only subsequent duplicate occurrences are removed. The relative order of the remaining unique lines is unchanged."
      },
      {
        question: "Can I remove near-duplicates or lines that differ only in whitespace?",
        answer:
          "The tool compares exact line content after optional case normalisation. Lines that differ only in leading/trailing whitespace can be handled by enabling the trim-whitespace option before deduplication."
      }
    ]
  },
  "remove-extra-spaces": {
    heroAppend:
      "Extra whitespace accumulates in text when content is copied from PDFs, web pages, word processors, or generated by automated systems. Double spaces between words, leading spaces at the start of lines, and trailing spaces at the end are invisible but cause problems in data processing, database storage, and content display. The ToolBite whitespace cleaner normalises all whitespace in one operation — collapsing multiple spaces to single spaces, trimming line edges, and optionally removing blank lines.",
    extraBenefits: [
      "Text copied from PDFs frequently contains line breaks in the middle of sentences and irregular spacing where the PDF renderer inserted breaks for layout. Clean it up here before using it in a document.",
      "When preparing data for import into a database or spreadsheet, trailing whitespace in field values causes silent mismatches in equality checks and joins. Clean the data before import to avoid those issues."
    ],
    extraFaq: [
      {
        question: "Does the tool remove intentional indentation?",
        answer:
          "The default mode collapses multiple spaces to single spaces and trims line edges, which does remove leading indentation. If you need to preserve code indentation, use the trim-only mode which only removes trailing spaces from each line."
      },
      {
        question: "What counts as whitespace in this tool?",
        answer:
          "Regular spaces, non-breaking spaces, tabs, and sequences of multiple spaces are all treated as whitespace and normalised according to the selected mode."
      }
    ]
  }
} as const;
