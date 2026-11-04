import os
from PIL import Image

for f in os.listdir("tmp/inspect_imgs"):
    fp = os.path.join("tmp/inspect_imgs", f)
    im = Image.open(fp)
    # resize thumbnail
    thumb = im.resize((150, int(150 * im.height / im.width)))
    thumb.save(f"tmp/inspect_imgs/thumb_{f}")
    print(f"{f}: {im.size}, mode={im.mode}")
