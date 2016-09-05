angular.module('sc_map_edit_bin.directives').directive('editorView', function() {

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
    scope.camera = new webgl_camera(scope.gl, 512, 512)
  }

  /**
   * Creates web gl scene objects
   */
  let initialiseScene = function(scope) {
    scope.scene = {
      heightmap: new webgl_heightmap(scope.gl, 512, 512)
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
        gl.clearColor(0.0, 0.0, 0.0, 1.0);                        // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST);                                 // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                  // Near things obscure far things


        // Initialise meshes
        //let terrain_mesh = new webgl_mesh(gl);

        // Initialise shaders (placholders, load dynamically)
        let vs_src = "attribute vec3 aVertexPosition;\n" +
                     "varying vec2 vTextureCoord;\n" +
                     "uniform mat4 uMVMatrix;\n" +
                     "uniform mat4 uPMatrix;\n" +
                     "uniform vec2 uMapSize;\n" +
                     "void main(void) {\n" +
                     "    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
                     "    vTextureCoord = aVertexPosition.xy / uMapSize;\n" +
                     "}\n";
        let fs_src = "precision mediump float;\n" +
                     "varying vec2 vTextureCoord;\n" +
                     "void main(void) {\n" +
                     "    gl_FragColor = vec4(vTextureCoord.x, 1.0, 1.0, 1.0);\n" +
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
      initialiseCamera(scope);
      initialiseScene(scope);
    }
  };
});
