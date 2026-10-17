from PIL import Image, ImageDraw
from pathlib import Path
root=Path(__file__).resolve().parents[1]
im=Image.open(root/'design/reference.png').convert('RGB')
out=root/'dist/assets'
# Only the artwork is extracted: no navigational text, headings, or UI is baked into assets.
def crop(name,box,polygon=None):
    art=im.crop(box).convert('RGBA')
    if polygon:
        mask=Image.new('L',art.size,0); ImageDraw.Draw(mask).polygon(polygon,fill=255); art.putalpha(mask)
    art.save(out/(name+'.webp'),'WEBP',quality=95,method=6)
crop('hero',(288,0,764,359),[(220,0),(476,0),(476,359),(0,359),(0,319),(45,319),(42,242),(83,231)])
hero=Image.open(out/'hero.webp').convert('RGBA')
m=hero.getchannel('A'); d=ImageDraw.Draw(m); d.rectangle((274,9,418,47),fill=0); d.rectangle((426,8,463,46),fill=0); hero.putalpha(m); hero.save(out/'hero.webp','WEBP',quality=95,method=6)
crop('services',(434,359,764,645),[(0,0),(330,0),(330,286),(43,286),(43,105)])
crop('company',(248,645,610,1007))
crop('conveyor',(0,1163,764,1301),[(210,0),(764,0),(764,138),(0,138),(0,70),(65,70),(65,28),(210,28)])
crop('boots',(212,1720,364,1934))
boots=Image.open(out/'boots.webp').convert('RGBA')
m=boots.getchannel('A'); ImageDraw.Draw(m).rectangle((0,125,123,167),fill=0); boots.putalpha(m); boots.save(out/'boots.webp','WEBP',quality=95,method=6)
crop('paper',(480,1460,520,1500))
crop('paper-texture',(10,570,43,638))
crop('dark-texture',(10,730,40,770))
print('Artwork extracted as separate WebP assets.')
