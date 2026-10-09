#!/usr/bin/env python3
"""Add a content hash to every local script and stylesheet address in the
HTML pages (js/app.js?v=1a2b3c4d), so tablets load new files after an update
instead of old cached copies. Run after changing any js/ or css/ file;
npm test fails if a stamp is out of date."""
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index.html', 'device-check.html']
REF = re.compile(r'((?:src|href)=")((?:js|css)/[^"?]+)(?:\?v=[0-9a-f]+)?(")')


def stamped(html):
    def repl(m):
        with open(os.path.join(ROOT, m.group(2)), 'rb') as f:
            v = hashlib.md5(f.read()).hexdigest()[:8]
        return m.group(1) + m.group(2) + '?v=' + v + m.group(3)
    return REF.sub(repl, html)


def main():
    check = '--check' in sys.argv
    stale = []
    for page in PAGES:
        path = os.path.join(ROOT, page)
        with open(path, encoding='utf-8') as f:
            html = f.read()
        new = stamped(html)
        if new != html:
            stale.append(page)
            if not check:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new)
    if check and stale:
        print('out of date (run tools/stamp.py):', ', '.join(stale))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
