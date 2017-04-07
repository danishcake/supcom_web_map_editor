angular.module('sc_map_edit_bin.directives').directive('editorView', ["editor_state", function(editor_state) {

  /**
   * Rendering callback. Draws the scene and schedules a redraw
   */
  let render = function(scope) {
    let gl = scope.gl;

    var displayWidth  = gl.canvas.clientWidth;
    var displayHeight = gl.canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (gl.canvas.width  != displayWidth ||
        gl.canvas.height != displayHeight) {

      // Make the canvas the same size
      gl.canvas.width  = displayWidth;
      gl.canvas.height = displayHeight;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    scope.camera.tick();

    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw heightmap
    scope.scene.heightmap.update();
    scope.scene.heightmap.draw(scope.terrainShader, scope.camera);

    // Trigger next redraw in approximately 16ms (for 60Hz monitors)
    scope.scheduleRedraw();
  };


  /**
   * Binds scope.scheduleRedraw so that it can be called easily to
   * trigger a regular render
   */
  let initialiseRenderScheduleFn = function(scope) {

    let reqFrame = window.requestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.msRequestAnimationFrame ||
                   function(callback) { window.setTimeout(callback, 1.0 / 60.0); };

    let cancelFrame = window.cancelAnimationFrame ||
                      window.mozCancelAnimationFrame ||
                      window.webkitCancelAnimationFrame ||
                      window.msCancelAnimationFrame ||
                      function(handle) { window.clearTimeout(handle); };

    let renderCallback = function() { render(scope); };

    scope.scheduleRedraw = () => {
      if (scope.scheduledRedrawHandle == null) {
        console.log("Rendering started");
      }
      scope.scheduledRedrawHandle = reqFrame(renderCallback);
    };

    scope.cancelRedraw = () => {
      if (scope.scheduledRedrawHandle != null) {
        console.log("Rendering paused");
        cancelFrame(scope.scheduledRedrawHandle);
        delete scope.scheduledRedrawHandle;
      }
    };
  };


  /**
   * Creates a web_gl camera and mouse move/zoom events
   */
  let initialiseCamera = function(scope) {
    scope.camera = new webgl_camera(scope.gl,
                                    [editor_state.map.heightmap.width, editor_state.map.heightmap.height],
                                    [scope.gl.canvas.width, scope.gl.canvas.height]);
  }


  /**
   * Creates web gl scene objects
   */
  let initialiseScene = function(scope) {
    scope.scene = {
      heightmap: new webgl_heightmap(scope.gl, editor_state.edit_heightmap)
    };
  }


  /**
   * Initialises WebGL context, shaders etc and starts first draw
   */
  let initialiseWebGl = function(scope, canvas) {
      // 1. Initialse the WebGL context
      let gl = canvas.getContext("webgl") ||
               canvas.getContext("experimental-webgl");

      // 2. If that succeeded then continue initialisation
      if (gl) {
        let extensions = [
          "OES_element_index_uint",
          "OES_texture_float"
        ];

        _.each(extensions, (extension) => {
          let extensionHandle = gl.getExtension(extension);
          if (!extensionHandle) {
            console.log(`Could not enable extension '${extension}'`);
          }
        });

        gl.clearColor(0.0, 0.0, 0.0, 1.0);                        // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST);                                 // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                  // Near things obscure far things

        // Create the terrain shader
        scope.terrainShader = webgl_effect.create_from_dom(gl, "vs-terrain-greyscale", "fs-terrain-greyscale");


        // Save the context to scope
        scope.gl = gl;
      } else {
        // TODO: More suitable explosion that puts applications state into error
        console.log("Could not initialise a WebGL context");
      }
  };

  /**
   * Asynchronously loads textures and calls done once all textures have been loaded
   * TODO: Add some indication that we're loading textures...
   *
   */
  const initialiseTextures = function(scope, done) {
    let gl = scope.gl;
    const textures = {
      mass:    'img/Mass_icon.png',
      energy:  'img/Energy_icon.png',
      unknown: 'img/Unknown_icon.png'
    };

    scope.textures = {};
    let scratch_images = [];
    let loaded_image_count = 0;

    let handle_image_load = (name, img) => {
      // Create an OpenGL texture
      let texture_id = gl.createTexture();

      // Setup texture parameters
      gl.bindTexture(gl.TEXTURE_2D, texture_id);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);

      // Store the texture
      scope.textures[name] = texture_id;

      console.log(`Texture '${name}' loaded from '${img.src}'`);

      // If this was the last image call done
      loaded_image_count++;
      if (loaded_image_count === scratch_images.length) {
        console.log(`Texture loading complete`);
        done();
      }
    };

    for (let image_key of Object.keys(textures)) {
      let img = new Image();
      img.src = textures[image_key];
      img.onload = () => { handle_image_load(image_key, img); };
      scratch_images.push(img);
    }
  };


  return {
    restrict: 'E',
    templateUrl: 'templates/editor-view.html',
    link: function(scope, element) {
      const canvas = element.children()[0];

      initialiseRenderScheduleFn(scope);
      initialiseWebGl(scope, canvas);

      /**
       * Register for map changes. When it does:
       * 1. Stop drawing,
       * 2a. TODO: Teardown WebGL objects and release resources
       * 2b. Create WebGL objects for the next map
       * 2c. Load textures (async)
       * 3. Start drawing
       */
      const update_map = () => {
        async.series([
          (cb) => { scope.cancelRedraw();     cb(); },
          (cb) => { initialiseCamera(scope);  cb(); },
          (cb) => { initialiseTextures(scope, cb);  },
          (cb) => { initialiseScene(scope);   cb(); },
          (cb) => { scope.scheduleRedraw();   cb(); },
        ], (err) => {
        });
      };

      editor_state.on_new_map(update_map);
      update_map();

      // Store the editor state so we can direct tool events to it
      scope.editor_state = editor_state;
    }
  };
}]);
