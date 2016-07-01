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
                                               'dialogs.main']);
angular.module('sc_map_edit_bin.directives', []);
angular.module('sc_map_edit_bin.services', []);
