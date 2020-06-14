  "use strict";

  function makeGame() {
    let min = Math.min;
    let cos = Math.cos;
    let sin = Math.sin;

    let canvas;
    let engine;
    let scene;
    let vrHelper;

    let box;

    let publicAPI = {};

    let state;

    publicAPI.setupEngine = function () {
      canvas = document.getElementById('renderCanvas');
      engine = new BABYLON.Engine(canvas, true);
      scene = new BABYLON.Scene(engine);

      canvas.requestPointerLock();

      vrHelper = scene.createDefaultVRExperience({ useMultiview: true });


      function handlePointerUp() {
        //var ray = vrHelper.currentVRCamera.getForwardRay(99999);

        //let rayHelper = new BABYLON.RayHelper(ray);
        //rayHelper.show(scene);

        //var pickResult = scene.pickWithRay(ray);

        var pickResult = scene.pick(engine.getRenderWidth() / 2, engine.getRenderHeight() / 2);
        if (pickResult.pickedMesh !== null) {
          //console.log(scene.pointerX, scene.pointerX);
          box.position.x = pickResult.pickedMesh.position.x;
          box.position.y = pickResult.pickedMesh.position.y + .25;
          box.position.z = pickResult.pickedMesh.position.z;
          box.visible = true;

          console.log(pickResult.pickedMesh.position);
          console.log(box.position);
          console.log("");

          //console.log(scene.pointerX, scene.pointerY);
          //console.log(engine.getRenderWidth()/2, engine.getRenderHeight()/2);

        }


        //console.log("POINTER UP");
      }

      engine.runRenderLoop(function () {
        scene.render();
      });

      scene.onBeforeCameraRenderObservable.add((camera) => {
        //crosshair.parent = camera;
        //canvas.requestPointerLock();
      });
      //vrHelper.onEnteringVRObservable.add(() => {
      //  crosshair.parent = vrHelper.deviceOrientationVRHelper;
      //});
      //vrHelper.onExitingVR.add(() => {

      scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
          //case BABYLON.KeyboardEventTypes.KEYDOWN:
          //  console.log("KEY DOWN: ", kbInfo.event.key);
          //  break;
          case BABYLON.KeyboardEventTypes.KEYUP:
            canvas.requestPointerLock();
            break;
        }
      });

      scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
          //case BABYLON.PointerEventTypes.POINTERDOWN:
          //	console.log("POINTER DOWN");
          //	break;
          case BABYLON.PointerEventTypes.POINTERUP:
            handlePointerUp();
            break;
          //case BABYLON.PointerEventTypes.POINTERMOVE:
          //	console.log("POINTER MOVE");
          //	break;
          //case BABYLON.PointerEventTypes.POINTERWHEEL:
          //	console.log("POINTER WHEEL");
          //	break;
          //case BABYLON.PointerEventTypes.POINTERPICK:
          //	console.log("POINTER PICK");
          //	break;
          //case BABYLON.PointerEventTypes.POINTERTAP:
          //	console.log("POINTER TAP");
          //	break;
          //case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
          //	console.log("POINTER DOUBLE-TAP");
          //	break;
        }
      });

      vrHelper.onExitingVRObservable.add(() => {
        //  //crosshair.parent = vrHelper.deviceOrientationCamera;
        //  //debugger;
        //  engine.enterPointerlock();
        //  scene.getEngine().isPointerLock = true;
        //  scene.getEngine().enterPointerlock();
        setTimeout(() => {
          canvas.requestPointerLock();
        }, 1000);
        //canvas.requestPointerLock();
      });

      window.addEventListener('resize', function () {
        engine.resize();
      });

    };


    publicAPI.setupGame = function () {
      var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(1, -1, 0), scene);
      light.intensity = 0.7;

      let seed = 110;
      let resolution = { x: 10, y: 10 };
      scene.cameras[0].position.y = getY(seed, 0, 0) + 10;
      scene.cameras[0].position.x = 0;
      scene.cameras[0].position.z = -30;
      scene.cameras[0].setTarget(BABYLON.Vector3.Zero());

      let crosshair = BABYLON.MeshBuilder.CreatePlane("crosshair", { width: .64, size: .64, tileSize: 1 }, scene);
      crosshair.material = new BABYLON.StandardMaterial("myMaterial", scene);
      crosshair.material.diffuseTexture = new BABYLON.Texture("crosshair2.png", scene, false, true, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
      crosshair.material.diffuseTexture.hasAlpha = true;
      crosshair.material.emissiveTexture = new BABYLON.Texture("crosshair2.png", scene, false, true, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
      //crosshair.material.emissiveTexture.hasAlpha = true;
      crosshair.position.z = 6;
      crosshair.isPickable = false;
      //crosshair.parent = vrHelper.webVRCamera;
      //crosshair.parent = vrHelper.deviceOrientationCamera;
      //crosshair.parent = scene.activeCamera;

      crosshair.parent = vrHelper.currentVRCamera;
      crosshair.parent = vrHelper.webVRCamera;
      crosshair.parent = scene.activeCamera;
      crosshair.renderingGroupId = 1;

      light.excludedMeshes.push(crosshair);
      //engine.enterPointerlock();

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

      box = BABYLON.MeshBuilder.CreateCylinder("box", { height: .5, diameter: .9, tessellation: 8 }, scene);
      box.convertToFlatShadedMesh();
      box.material = new BABYLON.StandardMaterial("boulder", scene);
      box.material.diffuseColor = new BABYLON.Color3(.5, .5, 1);
      box.material.ambientTexture = customProcText;
      box.material.specularTexture = customProcText;
      box.visible = false;

    };

    return publicAPI;
  }
