angular.module('sc_map_edit_bin.directives').directive('editorView', ["editor_state", function(editor_state) {

  /**
   * Rendering callback. Draws the scene and schedules a redraw
   */
  let render = function(scope) {
    scope.camera.tick();

    let gl = scope.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // Clear the color and depth buffers

    // Draw heightmap
    scope.scene.heightmap.draw(scope.terrainShader, scope.camera)

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

    let renderCallback = function() { render(scope); };

    scope.scheduleRedraw = function() { reqFrame(renderCallback); };
  };


  /**
   * Creates a web_gl camera and mouse move/zoom events
   */
  let initialiseCamera = function(scope) {
    scope.camera = new webgl_camera(scope.gl, editor_state.map.heightmap.width, editor_state.map.heightmap.height);
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
  let initialiseWebGl = function(scope, element) {
      // 1. Initialse the WebGL context
      // Note this is really fragile due to the canvas being a nested element
      let gl = element.children()[0].getContext("webgl") ||
               element.children()[0].getContext("experimental-webgl");

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


        // Initialise meshes
        //let terrain_mesh = new webgl_mesh(gl);

        // Initialise shaders (placholders, load dynamically)
        // TODO: I should probably offset by half a texel
        let vs_src = "precision highp float;\n" +
                     "attribute vec3 aVertexPosition;\n" +
                     "varying highp float vHeight;\n" +
                     "uniform mat4 uMVMatrix;\n" +
                     "uniform mat4 uPMatrix;\n" +
                     "uniform vec2 uMapSize;\n" +
                     "uniform highp sampler2D uHeightmap;\n" +
                     "uniform highp float uHeightmapScale;\n" +
                     "uniform highp float uShadeMin;\n" +
                     "uniform highp float uShadeMax;\n" +
                     "void main(void) {\n" +
                     "    vec2 textureCoord = aVertexPosition.xy / uMapSize;\n" +
                     "    highp float height = texture2D(uHeightmap, textureCoord).a;\n" +
                     "    vec3 displacedPosition = aVertexPosition + vec3(0, 0, height * uHeightmapScale);\n" +
                     "    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);\n" +
                     "    vHeight = (height - uShadeMin) / (uShadeMax - uShadeMin);\n" +
                     "}\n";
        let fs_src = "precision mediump float;\n" +
                     "varying highp float vHeight;\n" +
                     "void main(void) {\n" +
                     "    gl_FragColor = vec4(vHeight, vHeight, vHeight, 1.0);\n" +
                     "}\n";
        scope.terrainShader = new webgl_effect(gl, vs_src, fs_src);


        // Save the context to scope
        scope.gl = gl;

        // Finally, trigger the first draw
        scope.scheduleRedraw();
      } else {
        // TODO: More suitable explosion that puts applications state into error
        console.log("Could not initialise a WebGL context");
      }
  };




  return {
    restrict: 'E',
    templateUrl: 'templates/editor-view.html',
    link: function(scope, element) {
      initialiseRenderScheduleFn(scope);
      initialiseWebGl(scope, element);

      /**
       * Register for map changes
       */
      let new_map_callbacks = [
        _.partial(initialiseScene, scope),
        _.partial(initialiseCamera, scope)
      ];
      let update_map = () => {
        _.each(new_map_callbacks, (cb) => cb());
      };

      editor_state.on_new_map(update_map);
      update_map();

      // Store the editor state so we can direct tool events to it
      scope.editor_state = editor_state;
    }
  };
}]);
