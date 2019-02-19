require('jquery');    // Expose loader configured to shove this into global namespace (for bootstrap)
require('hamsterjs'); // Expose loader configured to shove this into global namespace (for angular-mousewheel)
const angular = require('angular');
require('angular-dialog-service');
require('angular-ui-bootstrap');
require('angular-mousewheel');
require('angular-sanitize');
require('bootstrap');

//require('angular-ui-bootstrap/dist/ui-bootstrap-csp.css'); // Not needed
require('bootstrap/dist/css/bootstrap.css');
require('font-awesome/css/font-awesome.css');
require('../css/main.css');




/**
 * Angular application
 * Stitches together all the different application modules
 */
angular.module('sc_map_edit_bin', ['ui.bootstrap',
                                   'dialogs.main',
                                   'sc_map_edit_bin.controllers',
                                   'sc_map_edit_bin.directives',
                                   'sc_map_edit_bin.services']);

angular.module('sc_map_edit_bin.controllers', ['sc_map_edit_bin.services',
                                               'ui.bootstrap',
                                               'monospaced.mousewheel',
                                               'dialogs.main']);
angular.module('sc_map_edit_bin.directives', []);
angular.module('sc_map_edit_bin.services', []);
