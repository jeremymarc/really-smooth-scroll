const SmoothScroll = require('./SmoothScroll');
const spring = require('./spring');

function getSpringVal(val) {
  if (typeof val === 'number') return val;
  return val.val;
}

function stayInRange(min, max, value) {
  return Math.min(max, Math.max(min, value));
}

function difference(a, b) {
  return Math.abs(a - b);
}

let moving = false;
let scrollY = spring(0);

const smoothScroll = new SmoothScroll({
  style: { scrollY: 0 },
  defaultStyle: { scrollY: 0 },
  onRest: function onRest() {
    moving = false;
  },
});

function move(deltaY) {
  if (!moving) {
    if (difference(getSpringVal(scrollY), Math.round(window.scrollY)) > 4) {
      scrollY = window.scrollY;
      smoothScroll.componentWillReceiveProps({
        style: {scrollY},
      });
    }
    moving = true;
  }

  if (document.querySelector('html').style.overflowY === 'hidden') {
    return;
  }

  scrollY = stayInRange(
    0,
    document.querySelector('html').offsetHeight - window.innerHeight,
    // getSpringVal(scrollY) + deltaY
    window.scrollY + deltaY * 6
  );
  window.scrollTo(window.scrollX, scrollY);
}

function onkeydown(e) {
  if (e.target === document.body && e.key === 'ArrowDown') {
    e.preventDefault();
    move(20);
  } else if (e.target === document.body && e.key === 'ArrowUp') {
    e.preventDefault();
    move(-20);
  }
}

function onmousewheel(e) {
  if (document.body.contains(e.target) || e.target === document.body) {
    e.preventDefault();
    move(e.deltaY);
  }
}


module.exports = function polyfill() {
  window.addEventListener('wheel', onmousewheel);
  window.addEventListener('keydown', onkeydown);

  window.oldScrollTo = window.scrollTo.bind(window);

  window.scrollTo = (x, y) => {
    window.oldScrollTo(x, window.scrollY);
    smoothScroll.componentWillReceiveProps({
      style: { scrollY: spring(y) },
    });
  };
}
