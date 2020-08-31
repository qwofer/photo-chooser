const leftElement = document.querySelector('.app-select__left');
const rightElement = document.querySelector('.app-select__right');

function recalculate() {
  const appHeight = document.querySelector('.app-select').offsetHeight;
  leftElement.style.maxHeight = appHeight + 'px';
  rightElement.style.maxHeight = appHeight + 'px';
}

function keyListener(e, socket) {
  if (e instanceof KeyboardEvent) {
    switch (e.code) {
      case 'ArrowLeft': socket.emit('pick', { remove: localRight, offset: localOffset }); break;
      case 'ArrowRight': socket.emit('pick', { remove: localLeft, offset: localOffset }); break;
      case 'KeyD': socket.emit('delete', { photos: [localLeft, localRight], offset: localOffset }); break;
      case 'Space': socket.emit('load', localOffset); break;
    }
  }
}

window.addEventListener('resize', recalculate);
recalculate();

const socket = io();

let localLeft = null;
let localRight = null;
let localOffset = 0;

socket.emit('load', localOffset);

socket.on('new-files', ({ left, right, offset }) => {
  localLeft = left;
  localRight = right;
  localOffset = offset;

  leftElement.innerHTML = `<a href="photos/all/${ left }" target="_blank"><img src="photos/all/${ left }" alt="" /></a>`;
  rightElement.innerHTML = `<a href="photos/all/${ right }" target="_blank"><img src="photos/all/${ right }" alt="" /></a>`;
});

window.addEventListener('keyup', (e) => {
  keyListener(e, socket);
});
