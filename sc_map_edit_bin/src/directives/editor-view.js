angular.module('sc_map_edit_bin.directives').directive('editorView', ["editor_state", "game_resources", "dialogs", "$rootScope", function(editor_state, game_resources, dialogs, $rootScope) {

  /**
   * Rendering callback. Draws the scene and schedules a redraw
   */
  let render = function(scope) {
    let gl = scope.gl;

    let displayWidth  = gl.canvas.clientWidth;
    let displayHeight = gl.canvas.clientHeight;

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
    // Enable z-buffer depth test
    gl.enable(gl.DEPTH_TEST);

    // Draw heightmap
    scope.scene.heightmap.update();
    switch (editor_state.render_mode) {
      case 'heightmap':
      default:
        scope.scene.heightmap.draw(scope.heightmap_shader, scope.camera);
        break;
      case 'texturemap':
        scope.scene.heightmap.draw(scope.terrain_texture_shader, scope.camera);
        break;
    }

    // Draw the markers
    // Clear the depth buffers only
    gl.clear(gl.DEPTH_BUFFER_BIT);
    const markers = editor_state.scripts.save.markers;
    for (let marker_id of Object.keys(markers)) {
      const marker = markers[marker_id];
      switch (marker.type) {
        case "Mass":
          scope.scene.markers.mass.draw(scope.marker_shader, scope.camera, marker.position, !!marker.selected);
          break;
        case "Hydrocarbon":
          scope.scene.markers.energy.draw(scope.marker_shader, scope.camera, marker.position, !!marker.selected);
          break;
        default:
          scope.scene.markers.unknown.draw(scope.marker_shader, scope.camera, marker.position, !!marker.selected);
          break;
      }
    }

    // Disable z-buffer depth test
    gl.enable(gl.DEPTH_TEST);
    // Draw tool highlight
    if (editor_state.tool !== null && editor_state.tool_position !== null) {
      scope.scene.tool_highlight.draw(scope.line_shader, scope.camera, editor_state.tool_position, editor_state.tool.outer_radius, [1, 1, 1, 0.6]);
      scope.scene.tool_highlight.draw(scope.line_shader, scope.camera, editor_state.tool_position, editor_state.tool.inner_radius, [1, 1, 1, 0.3]);
    }

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
  };


  /**
   * Creates a web_gl camera as a placeholder until a real one can be loaded later
   */
  let initialiseDummyCamera = function(scope) {
    scope.camera = new webgl_camera(scope.gl, [256, 256], [100, 100]);
  };


  /**
   * Creates web gl scene objects
   */
  let initialiseScene = function(scope) {
    scope.scene = {
      heightmap: new webgl_heightmap(scope.gl, editor_state.edit_heightmap, editor_state.map.layers, editor_state.edit_texturemap, game_resources),
      markers: {
        mass: new webgl_marker(scope.gl, _.find(game_resources.markers, p => p.name === "Mass").texture),
        energy: new webgl_marker(scope.gl, _.find(game_resources.markers, p => p.name === "Energy").texture),
        unknown: new webgl_marker(scope.gl, _.find(game_resources.markers, p => p.name === "Unknown").texture)
      },
      tool_highlight: new webgl_ring(scope.gl)
    };
  };


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
      scope.heightmap_shader = webgl_effect.create_from_dom(gl, "vs-terrain-greyscale", "fs-terrain-greyscale");
      scope.terrain_texture_shader = webgl_effect.create_from_dom(gl, "vs-terrain-textured", "fs-terrain-textured");
      scope.marker_shader = webgl_effect.create_from_dom(gl, "vs-marker", "fs-marker");
      scope.line_shader = webgl_effect.create_from_dom(gl, "vs-line", "fs-line");

      // Save the context to scope
      scope.gl = gl;
    } else {
      // TODO: More suitable explosion that puts applications state into error
      console.log("Could not initialise a WebGL context");
    }
  };


  return {
    restrict: 'E',
    templateUrl: 'templates/editor-view.html',
    link: function(scope, element) {
      const canvas = element.children()[0];

      initialiseRenderScheduleFn(scope);
      initialiseWebGl(scope, canvas);
      initialiseDummyCamera(scope);

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
          (cb) => { initialiseScene(scope);   cb(); },
          (cb) => { scope.scheduleRedraw();   cb(); },
        ], (err) => {
        });
      };

      // Show progress until resources are loaded
      dialogs.create("templates/dialogs/progress.html",
                      "progress",
                      {
                        title: "Loading resources",
                        message: "Loading resources"
                      },
                      modal_dlg_opts);

      // Wait for loading to complete before we start doing anything at all
      game_resources.load_resources(scope.gl,
        (message, progress) => {
          $rootScope.$broadcast("dialogs.progress.progress", { message: message, progress: progress});
        },
        (error) => {
          if (error) {
            $rootScope.$broadcast("dialogs.progress.error", { message: error });
          } else {
            $rootScope.$broadcast("dialogs.progress.complete");
            update_map();
            editor_state.on_new_map(update_map);
          }
        });

      // Store the editor state so we can direct tool events to it
      scope.editor_state = editor_state;
    }
  };
}]);
