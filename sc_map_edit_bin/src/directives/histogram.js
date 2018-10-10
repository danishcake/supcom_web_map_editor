const angular = require('angular');
import { sc_edit_view_methods } from '../../../sc_map_io_lib/src/lib/views/sc_edit_view_methods';

// TODO: Pass in edit_heightmap via attribute
angular.module('sc_map_edit_bin.directives').directive('histogram', ["editor_state", function(editor_state) {
  /**
   * Draws the histogram for the current map
   * @param {HTMLCanvasElement} canvas
   * @param {number} number_of_layers The number of distinct regions to highlight
   */
  const render_histogram = (canvas, number_of_layers) => {
    const ctx = canvas.getContext("2d");

    // White background
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#FFFFFFFF';
    ctx.fill();

    // Dark gray scale
    ctx.strokeStyle = '#4A4A4A';
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(5, canvas.height - 5);
    ctx.lineTo(canvas.width - 5, canvas.height - 5);
    ctx.stroke();

    const display_bins = Math.max(1, canvas.width - 10);
    const display_height = canvas.height - 10;
    const histogram = sc_edit_view_methods.calculate_histogram(editor_state.edit_heightmap)[0];
    const max_count = Math.max(...histogram);
    const bin_to_x = (bin) => {
      return 6 + display_bins *
        (bin - editor_state.edit_heightmap.minimum_height) /
        (editor_state.edit_heightmap.maximum_height - editor_state.edit_heightmap.minimum_height);
    };
    const count_to_y = (count) => canvas.height - display_height * count / max_count - 6;

    // TODO: Just use a canvas transform to do this more elegantly
    ctx.strokeStyle = '#007FFF';
    ctx.beginPath();
    for (let i = 0; i < histogram.length; i++) {
      ctx.moveTo(bin_to_x(i), count_to_y(0));
      ctx.lineTo(bin_to_x(i), count_to_y(histogram[i]));
    }
    ctx.stroke();

    // Find signals above water
    const sorted_signals = sc_edit_view_methods.find_histogram_signals(histogram, 5,
      editor_state.map.water.has_water ? editor_state.map.water.elevation / editor_state.map.heightmap.scale : 0).slice(0, number_of_layers);
    // Orange highlight
    ctx.beginPath();
    ctx.strokeStyle = '#FF7F40';
    for (const signal of sorted_signals) {
      // .rect is tricky to calculate w/h for
      const l = bin_to_x(signal.left_edge) - 1;
      const r = bin_to_x(signal.right_edge) + 1;
      ctx.moveTo(l, canvas.height - 3);
      ctx.lineTo(l, 2);
      ctx.lineTo(r, 2);
      ctx.lineTo(r, canvas.height - 3);
    }
    ctx.stroke();

    // Draw water overlays
    if (editor_state.map.water.has_water) {
      ctx.fillStyle = '#0040c0';
      ctx.globalAlpha = 0.25;
      ctx.fillRect(bin_to_x(0), count_to_y(0),
                   bin_to_x(editor_state.map.water.elevation_abyss / editor_state.map.heightmap.scale) - bin_to_x(0),
                   count_to_y(max_count) - count_to_y(0));

      ctx.fillRect(bin_to_x(0), count_to_y(0),
        bin_to_x(editor_state.map.water.elevation_deep / editor_state.map.heightmap.scale) - bin_to_x(0),
        count_to_y(max_count) - count_to_y(0));

      ctx.fillRect(bin_to_x(0), count_to_y(0),
        bin_to_x(editor_state.map.water.elevation / editor_state.map.heightmap.scale) - bin_to_x(0),
        count_to_y(max_count) - count_to_y(0));
      ctx.globalAlpha = 1.0;
    }
  };

  return {
    restrict: 'E',
    template: require('../../templates/histogram.html'),
    scope: {
      layers: "@"
    },
    link: function(scope, element) {
      const canvas = element.find("canvas")[0];
      render_histogram(canvas, scope.layers);
      scope.$watch("layers", (old_value, new_value) => {
        render_histogram(canvas, scope.layers);
      });
    }
  };
}]);
