window.addEventListener('DOMContentLoaded', function () {
  "use strict";

  var crosshair;
  var box;
  var vrHelper;

  // set up engine
  Game.setupEngine();
  Game.setupGame();

  // pause

  //Game.setupLevel();
  /// Game.loop

  //  if (pickResult.hit) {
  //    var diffX = pickResult.pickedPoint.x - box.position.x;
  //    var diffY = pickResult.pickedPoint.z - box.position.z;
  //    box.rotation.y = Math.atan2(diffX, diffY);
  //  }
  //}

});

// pause is a state not a function
// pause is a psuedo-level
// attach scripts to objects
function level() {
  function initialize() { }
  function start() { }
  function end() { }
  function update() { }
  function render() { }
  function getInput() { }

  function oncollision() { }
  function oninput() { }
  function onmousemove() { }
  function onkeyupdown() { }
  function ontouch() { }
}
