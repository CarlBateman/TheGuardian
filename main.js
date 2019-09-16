window.addEventListener('DOMContentLoaded', function () {
  min = Math.min;
  cos = Math.cos;
  sin = Math.sin;

// add terrain generated with Perlin noise
// VR
// HUD
// States
  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);

  var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    //var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    var camera = new BABYLON.WebVRFreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
    camera.angularSensibility = 10000;
    camera.speed = 1;

    camera.position.x = 3.3;
    camera.position.y = 1.1;
    camera.position.z = -3.3;


    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    camera.rotation.x = 0.75;
    camera.rotation.y = -2.5;

    var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(1, -1, 0), scene);
    light.intensity = 0.7;


    var seed = 10;
    resolution = { x: 10, y: 10 };


    function getY(seed, x, z) {
      let y = cos((x) / 7) * sin((z) / 13) / 5;
      y += cos((x) / 27) * sin((z) / 31);
      y *= 5;
      y = Math.ceil(y);
      y *= 2;
      return y;
    }

    var tiles = [];
    let iCol = 0;
    for (var x = 0; x < 100; x++) {
      iCol = x % 2;

      for (var z = 0; z < 100; z++) {
        iCol += 1;
        iCol %= 2;

        var tile = BABYLON.MeshBuilder.CreateGround("tile", { width: 1, height: 1, updatable: true, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
        tile.material = new BABYLON.StandardMaterial("myMaterial", scene);

        tile.position.x = x * 1.1 - 50;
        tile.position.z = z * 1.1 - 50;
        tiles.push(tile);

        let y0 = getY(seed, x + 0, z + 1);
        let y1 = getY(seed, x + 1, z + 1);
        let y2 = getY(seed, x + 0, z + 0);
        let y3 = getY(seed, x + 1, z + 0);

        if (y0 === y1 && y0 === y2 && y0 === y3) {
          tile.position.y = getY(seed, x, z);
          if (iCol === 0) {
            tile.material.diffuseColor = new BABYLON.Color3(1, 0.5, 0.5);
          } else {
            tile.material.diffuseColor = new BABYLON.Color3(0.5, 1, 0.5);
          }
        } else {
          let positions = tile.getVerticesData(BABYLON.VertexBuffer.PositionKind);

          positions[1 + 0] = y0;
          positions[1 + 3] = y1;
          positions[1 + 6] = y2;
          positions[1 + 9] = y3;

          // digaonal pairs are
          // 0 3
          // 1 2
          if (y0 === y2 && y0 === y3) {
            tile.rotation.y = Math.PI / 2;
            positions[1 + 0] = y1;
            positions[1 + 3] = y2;
            positions[1 + 6] = y3;
            positions[1 + 9] = y0;
          }

          if (y0 === y1 && y0 === y3) {
            tile.rotation.y = Math.PI / 2;
            positions[1 + 0] = y3;
            positions[1 + 3] = y0;
            positions[1 + 6] = y1;
            positions[1 + 9] = y2;
          }
          tile.material.diffuseColor = new BABYLON.Color3(1, 0, 1);

          tile.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

          ////Calculations of normals added
          //var indices = tile.getIndices();
          //var normals = [];
          //BABYLON.VertexData.ComputeNormals(positions, indices, normals);
          //tile.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);


          tile.convertToFlatShadedMesh();
          //tile.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
          //tile.material.wireframe = true;
        }


      }
    }

    //for (var x = 0; x < 99; x++) {
    //  for (var z = 0; z < 99; z++) {
    //    let i = x * 100 + z;
    //    let j = i + 1;
    //    let k = (x + 1) * 100 + z;
    //    if (tiles[i].position.y < tiles[j].position.y || tiles[i].position.y < tiles[k].position.y) {
    //      tiles[i].material.diffuseColor = new BABYLON.Color3(0, 1, 1);
    //    }
    //    if (tiles[i].position.y < tiles[j].position.y && tiles[i].position.y < tiles[k].position.y) {
    //      tiles[i].material.diffuseColor = new BABYLON.Color3(1, 0, 1);
    //    }

    //  }
    //}
    //for (var x = 1; x < 100; x++) {
    //  for (var z = 1; z < 100; z++) {
    //    let i = x * 100 + z;
    //    let j = i - 1;
    //    let k = (x - 1) * 100 + z;
    //    if (tiles[i].position.y < tiles[j].position.y || tiles[i].position.y < tiles[k].position.y) {
    //      tiles[i].material.diffuseColor = new BABYLON.Color3(1, 1, 0);
    //    }
    //    if (tiles[i].position.y < tiles[j].position.y && tiles[i].position.y < tiles[k].position.y) {
    //      tiles[i].material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    //    }

    //  }
    //}
    //tiles[0].material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    //tiles[99].material.diffuseColor = new BABYLON.Color3(1, 1, 1);

    return scene;

  };

  var scene = createScene();

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });
});


function height(seed, resolution, vUv) {
  let TWO_PI = Math.PI * 2.0;
  let N = 68.5;

  //let center = gl_FragCoord.xy;
  //center.x = -10.12 * sin(seed / 200.0);
  //center.y = -10.12 * cos(seed / 200.0);

  let v = { x:0, y:0 };

  v.x = (vUv.x - resolution.x / 20.0) / min(resolution.y, resolution.x) * 0.1;
  v.y = (vUv.y - resolution.y / 20.0) / min(resolution.y, resolution.x) * 0.1;

  v.x = v.x - 10.0;
  v.y = v.y - 200.0;
  let col = 0.0;

  for (let i = 0.0; i < N; i++) {
    let a = i * (TWO_PI / N) * 61.95;
    col += cos(TWO_PI * (v.y * cos(a) + v.x * sin(a) + sin(seed * 0.004) * 100.0));
  }

  return col;
}