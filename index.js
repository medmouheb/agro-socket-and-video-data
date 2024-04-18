const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser middleware
const app = express();
const http = require('http').createServer(app);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');

// Set the paths to ffmpeg and ffprobe explicitly
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

app.post('/getinfos', async (req, res) => {
  console.log(req.body);
  const { videoStreamUrl } = req.body;
  ffmpeg.ffprobe(videoStreamUrl, (err, metadata) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error occurred during ffprobe' });
      return;
    }

    const format = metadata.format;
    const streams = metadata.streams;

    console.log('Format:', format);
    console.log('Streams:', streams);
    res.json({ format, streams });
  });
});

http.listen(3000, () => {
  console.log('Server is running on port 3000');
});
