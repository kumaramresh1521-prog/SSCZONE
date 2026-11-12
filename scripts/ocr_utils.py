import numpy as np

def ocr_page_split(im, engine):
    """
    Split a 2-page spread into left half and right half.
    Process each half separately to prevent ONNX memory errors.
    Returns combined bounding boxes with adjusted coordinates.
    """
    w, h = im.size
    mid_x = w // 2
    
    # Left half
    im_left = im.crop((0, 0, mid_x, h))
    res_l, _ = engine(np.array(im_left))
    
    # Right half
    im_right = im.crop((mid_x, 0, w, h))
    res_r, _ = engine(np.array(im_right))
    
    combined = []
    if res_l:
        for b, t, s in res_l:
            combined.append([b, t, s, 'left'])
    if res_r:
        for b, t, s in res_r:
            # Shift x coordinates by mid_x
            shifted_b = [[pt[0] + mid_x, pt[1]] for pt in b]
            combined.append([shifted_b, t, s, 'right'])
            
    return combined
