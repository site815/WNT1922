"""Run existing data checks without enumerating or reading promotional stories."""
import glob
import os
from pathlib import Path
import runpy
import sys

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)
sys.path.insert(0, str(ROOT / 'game' / '.validation-deps'))
original_glob = glob.glob

def game_glob(pattern, *args, **kwargs):
    if pattern == 'docs/**/*.md':
        matches = []
        for current, directories, files in os.walk('docs'):
            directories[:] = [name for name in directories if name.lower() != 'stories']
            matches.extend(os.path.join(current, name).replace('\\', '/') for name in files if name.endswith('.md'))
        return matches
    # Original checks parse POSIX-style paths even when run on Windows.
    return [name.replace('\\', '/') for name in original_glob(pattern, *args, **kwargs)]

glob.glob = game_glob
check = sys.argv[1] if len(sys.argv) > 1 else 'validate'
if check not in ('validate', 'crosscheck', 'audit'):
    raise SystemExit('Choose validate, crosscheck or audit.')
runpy.run_path(str(ROOT / 'tools' / (check + '.py')), run_name='__main__')
