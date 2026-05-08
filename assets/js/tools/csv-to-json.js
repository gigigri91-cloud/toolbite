function loadExample() {
      document.getElementById('csv-input').value = 'name,age,city,active\nAlice,30,London,true\nBob,25,Paris,false\nCarol,35,Berlin,true';
      convertCSV();
    }

    function parseCSVLine(line, delimiter) {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === delimiter && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current);
      return result;
    }

    function coerce(val) {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === '' || val === null) return null;
      const n = Number(val);
      return isNaN(n) ? val : n;
    }

    function convertCSV() {
      const raw = document.getElementById('csv-input').value.trim();
      const delim = document.getElementById('opt-delimiter').value;
      const hasHeader = document.getElementById('opt-header').checked;
      const pretty = document.getElementById('opt-pretty').checked;
      const statusEl = document.getElementById('convert-status');

      if (!raw) {
        statusEl.textContent = '⚠️ Nothing to convert. Paste some CSV first.';
        statusEl.className = 'mt-4 text-sm font-semibold text-amber-600';
        statusEl.classList.remove('hidden');
        return;
      }

      try {
        const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
        let headers, dataLines;
        if (hasHeader) {
          headers = parseCSVLine(lines[0], delim).map(h => h.trim());
          dataLines = lines.slice(1);
        } else {
          const cols = parseCSVLine(lines[0], delim).length;
          headers = Array.from({ length: cols }, (_, i) => `col${i + 1}`);
          dataLines = lines;
        }

        const result = dataLines.map(line => {
          const vals = parseCSVLine(line, delim);
          const obj = {};
          headers.forEach((h, i) => { obj[h] = coerce((vals[i] || '').trim()); });
          return obj;
        });

        document.getElementById('json-output').value = pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
        statusEl.textContent = `✅ Converted ${result.length} row(s) with ${headers.length} field(s).`;
        statusEl.className = 'mt-4 text-sm font-semibold text-emerald-700';
        statusEl.classList.remove('hidden');
      } catch (err) {
        statusEl.textContent = '❌ Parse error: ' + err.message;
        statusEl.className = 'mt-4 text-sm font-semibold text-red-600';
        statusEl.classList.remove('hidden');
      }
    }

    function copyJSON() {
      const out = document.getElementById('json-output').value;
      if (!out) return;
      navigator.clipboard.writeText(out).then(() => {
        const btn = document.getElementById('copy-json-btn');
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
    }

    function clearAll() {
      document.getElementById('csv-input').value = '';
      document.getElementById('json-output').value = '';
      document.getElementById('convert-status').classList.add('hidden');
    }
