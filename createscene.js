  "use strict";

  function makeGame() {
    //let min = Math.min;
    //let cos = Math.cos;
    //let sin = Math.sin;
    //let ceil = Math.ceil;
    //let PI = Math.PI;

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
      scene.registerBeforeRender(update);

      vrHelper = scene.createDefaultVRExperience({ useMultiview: true });

      //canvas.requestPointerLock();


      vrHelper.onExitingVRObservable.add(() => {
        setTimeout(() => {
          canvas.requestPointerLock();
        }, 1000);
      });

      engine.runRenderLoop(function () {
        scene.render();
      });

      scene.onBeforeCameraRenderObservable.add((camera) => {
      });

      scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
          case BABYLON.KeyboardEventTypes.KEYUP:
            handleKeyUp(kbInfo);
            canvas.focus();

            break;
        }
      });

      scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
          case BABYLON.PointerEventTypes.POINTERUP:
            handlePointerUp();
            break;
        }
      });

      window.addEventListener('resize', function () {
        engine.resize();
      });
    };

    publicAPI.setupGame = function () {
      var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(1, -1, 0), scene);
      light.intensity = 0.7;

      let crosshair = BABYLON.MeshBuilder.CreatePlane("crosshair", { width: .64, size: .64, tileSize: 1 }, scene);
      crosshair.material = new BABYLON.StandardMaterial("myMaterial", scene);
      crosshair.material.diffuseTexture = new BABYLON.Texture("crosshair1.png", scene, false, true, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
      crosshair.material.diffuseTexture.hasAlpha = true;
      crosshair.material.emissiveTexture = new BABYLON.Texture("crosshair1.png", scene, false, true, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
      crosshair.position.z = 6;
      crosshair.isPickable = false;

      crosshair.parent = vrHelper.currentVRCamera;
      crosshair.parent = vrHelper.webVRCamera;
      crosshair.parent = scene.activeCamera;
      crosshair.renderingGroupId = 1;

      light.excludedMeshes.push(crosshair);

      box = BABYLON.MeshBuilder.CreateCylinder("box", { height: .5, diameter: .9, tessellation: 8 }, scene);
      box.convertToFlatShadedMesh();
      box.material = new BABYLON.StandardMaterial("boulder", scene);
      box.material.diffuseColor = new BABYLON.Color3(.5, .5, 1);
      //box.material.ambientTexture = customProcText;
      //box.material.specularTexture = customProcText;
      box.visible = false;

      createLevel(scene, 1);
    };


    let level = 1;
    function handleKeyUp(kbInfo) {
      //console.log(kbInfo);

      switch (kbInfo.event.code) {
        case "Space":
          level += .1;
          createLevel(scene, level);
          break;
        case "Escape":
          canvas.requestPointerLock();
        default:
      }
    }

    function handlePointerUp() {
      var pickResult = scene.pick(engine.getRenderWidth() / 2, engine.getRenderHeight() / 2);
      if (pickResult.pickedMesh !== null) {
        box.position.x = pickResult.pickedMesh.position.x;
        box.position.y = pickResult.pickedMesh.position.y + .25;
        box.position.z = pickResult.pickedMesh.position.z;
        box.visible = true;

        //console.log(pickResult.pickedMesh.position);
        //console.log(box.position);
        //console.log("");
      }
    }

    let alpha = 0;
    var orbit_radius = 20;
    function update(){
      alpha += 0.01;
      //box.position.x = orbit_radius * Math.cos(alpha);
      //box.position.y = orbit_radius * Math.sin(alpha);
      //box.position.z = 10 * Math.sin(2 * alpha);

      //change the viewing angle of the camera as it follows the box
      //camera.rotationOffset = (18 * alpha) % 360;
    };

    return publicAPI;
  }
