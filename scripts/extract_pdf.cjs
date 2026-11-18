const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf';
const data = fs.readFileSync(pdfPath);

const parser = new PDFParse({ verbosity: 0 });
// Try loading as typed array/buffer
parser.getText({ url: pdfPath }).then(result => {
  const text = result.text;
  fs.writeFileSync('c:/ssczone/pdf_text.txt', text, 'utf8');
  console.log('Pages:', result.numpages);
  console.log('Done');
}).catch(e => {
  console.error('Error:', e.message);
  
  // Try different approach
  try {
    const uint8 = new Uint8Array(data);
    parser.getText({ data: uint8 }).then(r2 => {
      fs.writeFileSync('c:/ssczone/pdf_text.txt', r2.text, 'utf8');
      console.log('Success with data approach. Pages:', r2.numpages);
      console.log(r2.text.substring(0, 5000));
    }).catch(e2 => console.error('Error2:', e2.message));
  } catch(e3) {
    console.error('Error3:', e3.message);
  }
});
