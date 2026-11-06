"""Build the downloadable source archive from an explicit, public allowlist."""
from pathlib import Path
import zipfile
root=Path(__file__).resolve().parent
names=['interest-banner.js','interest-background.js','component.css','templates.js','templates.json','README.md','example.html','test-background.mjs','interest-banner.standalone.html']
names += [str(p.relative_to(root)) for p in sorted((root/'examples').rglob('*')) if p.is_file() and not any(x in p.parts for x in ('node_modules','dist'))]
names += ['assets/'+p.name for p in sorted((root/'assets').iterdir()) if p.is_file()]
with zipfile.ZipFile(root/'interest-banner-component.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for name in names:
        info=zipfile.ZipInfo(name,date_time=(2026,11,6,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        archive.writestr(info,(root/name).read_bytes())
print('Built interest-banner-component.zip')
