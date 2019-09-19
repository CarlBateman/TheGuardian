window.addEventListener('DOMContentLoaded', function () {
  min = Math.min;
  cos = Math.cos;
  sin = Math.sin;

  // add terrain generated with Perlin noise
  // HUD
  // States
  // teleport

    // freeze materials - material.freeze(); <- but custom shaders
    // updatable
    // mesh.freezeWorldMatrix();
    // scene.blockMaterialDirtyMechanism = true;
    //  scene.freezeActiveMeshes();

  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);

  var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var vrHelper = scene.createDefaultVRExperience({ useMultiview: true });

    var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(1, -1, 0), scene);
    light.intensity = 0.7;


    var seed = 10;
    resolution = { x: 10, y: 10 };
    scene.cameras[0].position.y = getY(seed, 0, 0) + 2;

    var plane = BABYLON.MeshBuilder.CreatePlane("plane", { width: .64, size: .32, tileSize: 1 }, scene);
    plane.material = new BABYLON.StandardMaterial("myMaterial", scene);
    plane.material.diffuseTexture = new BABYLON.Texture("crosshair.gif", scene, false, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
    plane.material.diffuseTexture.hasAlpha = true;
    plane.material.emissiveTexture = new BABYLON.Texture("crosshair.gif", scene, false, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
    //plane.material.emissiveTexture.hasAlpha = true;
    plane.position.z = 6;
    plane.parent = scene.cameras[0];
    plane.renderingGroupId = 1;

    light.excludedMeshes.push(plane);


    BABYLON.Effect.ShadersStore["Lines1PixelShader"] = 
    `precision highp float;

    varying vec2 vUV;
    void main(void) {
        vec2 t = abs(vUV-.5) * 2.;// / gl_FragCoord.z ;
        t =1.-t;
        float bary = step(0.01, min(t.x, t.y));

        gl_FragColor = vec4(bary,bary,bary, 1.0);
    }`;

    var linesShader = { fragmentElement: 'LinesPixelShader' };
    var customProcText = new BABYLON.CustomProceduralTexture("customtext", "Lines1", 1024, scene);

    function getY(seed, x, z) {
      // no of levels
      // max height

      let y = cos((5 * x + seed) / 7) + sin((5 * z + seed) / 13);
      y += cos((5 * x + seed) / 27) + sin((5 * z + seed) / 31);
      //y *= .5;
      y = Math.ceil(y);
      //y *= 2;
      return y;
    }

    var tiles = [];
    let iCol = 0;

    let size = 30;
    let size2 = size / 2;

    let tileSources = [];
    tileSources.push(BABYLON.MeshBuilder.CreateGround("tile", { width: 1, height: 1, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene));
    tileSources[0].material = new BABYLON.StandardMaterial("check0", scene);
    tileSources[0].material.diffuseColor = new BABYLON.Color3(1, 0.5, 0.5);
    tileSources[0].material.ambientTexture = customProcText;
    tileSources[0].material.specularTexture = customProcText;

    tileSources[0].visible = false;

    tileSources.push(BABYLON.MeshBuilder.CreateGround("tile", { width: 1, height: 1, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene));
    tileSources[1].material = new BABYLON.StandardMaterial("check1", scene);
    tileSources[1].material.diffuseColor = new BABYLON.Color3(0.5, 1, 0.5);
    tileSources[1].material.ambientTexture = customProcText;
    tileSources[1].material.specularTexture = customProcText;
    tileSources[1].visible = false;

    var tile;
    for (var x = 0; x < size; x++) {
      iCol = x % 2;

      for (var z = 0; z < size; z++) {
        iCol += 1;
        iCol %= 2;

        let y0 = getY(seed, x + 0, z + 1);
        let y1 = getY(seed, x + 1, z + 1);
        let y2 = getY(seed, x + 0, z + 0);
        let y3 = getY(seed, x + 1, z + 0);

        if (y0 === y1 && y0 === y2 && y0 === y3) {
          tile = tileSources[iCol].createInstance();

          tile.position.y = getY(seed, x, z);
        } else {
          tile = BABYLON.MeshBuilder.CreateGround("tile", { width: 1, height: 1, updatable: true, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
          tile.material = new BABYLON.StandardMaterial("side", scene);
          tile.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
          tile.material.ambientTexture = customProcText;
          tile.material.specularTexture = customProcText;

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

          tile.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

          tile.convertToFlatShadedMesh();
        }
        tile.position.x = x - size2;
        tile.position.z = z - size2;
        tiles.push(tile);
      }
    }

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