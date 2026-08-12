const https = require('https');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Download a highly realistic transparent Black Widow spider PNG from Wikimedia
const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Black_Widow_Spider_%28Latrodectus_mactans%29.svg/512px-Black_Widow_Spider_%28Latrodectus_mactans%29.svg.png";

https.get(url, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(path.join(publicDir, 'spider.png'));
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log("Spider image downloaded successfully to public/spider.png!");
    });
  } else {
    console.error("Failed to download spider image. Status:", res.statusCode);
  }
}).on('error', (err) => {
  console.error("Error downloading spider:", err.message);
});
