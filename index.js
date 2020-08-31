const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');

const allPath = path.join(__dirname, '/photos/all');
const deletedPath = path.join(__dirname, '/photos/deleted');

app.use('/photos', express.static(__dirname + '/photos'));
app.use('/assets', express.static(__dirname + '/src/assets'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/index.html');
});

function getNextPhotos(socket, offset) {
  fs.readdir(allPath, (err, files) => {
    if (err) {
      console.log('Unable to scan directory ' + allPath);
      return;
    }

    if (files[0] === '.gitkeep') {
      files = files.slice(1);
    }

    let left = 0;
    if (offset < files.length) {
      left = offset;
    }

    let right = 0;
    if (offset + 1 < files.length) {
      right = offset + 1;
    } else if (offset + 1 === files.length) {
      right = 0;
    } else if (offset + 1 > files.length) {
      right = 1;
    }

    let newOffset = 2;
    if (offset + 2 < files.length) {
      newOffset = offset + 2;
    } else if (offset + 2 === files.length) {
      newOffset = 0;
    } else if (offset + 2 > files.length) {
      newOffset = 1;
    }

    socket.emit('new-files', { left: files[left], right: files[right], offset: newOffset });
  });
}

io.on('connection', async (socket) => {
  socket.on('load', (offset) => {
    getNextPhotos(socket, offset);
  });

  socket.on('pick', async ({ remove, offset }) => {
    await fs.renameSync(allPath + '/' + remove, deletedPath + '/' + remove);
    getNextPhotos(socket, offset - 1);
  });

  socket.on('delete', async ({ photos, offset }) => {
    await fs.renameSync(allPath + '/' + photos[0], deletedPath + '/' + photos[0]);
    await fs.renameSync(allPath + '/' + photos[1], deletedPath + '/' + photos[1]);
    getNextPhotos(socket, offset - 2);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
