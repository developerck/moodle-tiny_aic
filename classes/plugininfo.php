<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

namespace tiny_aic;

use context;
use editor_tiny\plugin;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_configuration;

/**
 * Tiny AIC editor plugin for Moodle.
 *
 * @package     tiny_aic
 * @copyright   2025 DeveloperCK <developerck@gmail.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class plugininfo extends plugin implements plugin_with_configuration, plugin_with_buttons {

    /**
     * Get a list of the buttons provided by this plugin.
     *
     * @return array
     */
    public static function get_available_buttons(): array {
        return [
            'tiny_aic/plugin',
        ];
    }

    /**
     * Allows to pass to pass options from the PHP to the JavaScript API of the plugin.
     *
     * @param context $context
     * @param array $options
     * @param array $fpoptions
     * @param ?\editor_tiny\editor $editor = null
     * @return array
     */
    public static function get_plugin_configuration_for_context(
        context $context,
        array $options,
        array $fpoptions,
        ?\editor_tiny\editor $editor = null
    ): array {
        global  $USER;
        // Check if openapi key is available.
        $key = get_config("tiny_aic", "apikey");
        $roles = get_config("tiny_aic", "allowed_role");

        $params = [];
        $params['allowed'] = false;
        if (is_siteadmin() && get_config("tiny_aic", "allowed_admin")) {
            $params['allowed'] = true;
            return $params;
        }

        if ($key) {
            if (!empty($roles)) {
                $roles = explode(",", $roles);
                // Get user role.
                $userroles = get_user_roles_with_special(\context_system::instance(), $USER->id);
                $userroleids  = array_map(function ($k) {
                    return $k->roleid;
                }, $userroles);
                foreach ($roles as $r) {
                    if (in_array($r, $userroleids)) {
                        $params['allowed'] = true;
                        break;
                    }
                }
            }
        }
        return $params;
    }
}
