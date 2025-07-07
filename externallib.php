<?php
// This file is part of Moodle - http://moodle.org/
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
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.


/**
 * Class containing external library functions for the TinyMCE AI Content (aic) plugin.
 *
 * This class provides methods and utilities to support integration with external services
 * or APIs required by the TinyMCE AI Content plugin.
 *
 * @package     tiny_aic
 * @category    string
 * @copyright   2023 DeveloperCK <developerck@gmail.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/externallib.php');
require_once(__DIR__ . '/classes/ai.php'); // Ensure the ai class is loaded.
/**
 * This file contains the external library functions for the TinyMCE AI Content (aic) plugin.
 * 
 * Provides class definitions and methods to support AI-powered content features within the TinyMCE editor.
 * 
 * @package    editor_tiny
 * @subpackage plugins_aic
 */

class tiny_aic_external extends external_api
{

    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function get_generated_text_parameters()
    {
        return new external_function_parameters(
            array(
                'prompt' => new external_value(PARAM_RAW, 'The prompt for AI generation.')
            )
        );
    }

    /**
     * Get AI generated text based on prompt.
     * @param string $prompt The user's prompt.
     * @return array{generatedtext: string} Associative array with the generated text.
     * @throws moodle_exception
     */
    public static function get_generated_text($prompt)
    {
        self::validate_parameters(
            self::get_generated_text_parameters(),
            ['prompt' => $prompt]
        );
          self::validate_context(context_system::instance());
        // Perform your AI generation logic here based on $prompt.
        // For demonstration:
        try {
            $generatedtext = tiny_aic\ai::generate_text($prompt);
        } catch (\Throwable $e) {
            throw new moodle_exception('aigenerationfailed', 'tiny_aic', '', null, $e->getMessage());
        }

        return ['generatedtext' => $generatedtext];
    }


    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function get_generated_text_returns()
    {
        return new external_single_structure(
            array(
                'generatedtext' => new external_value(PARAM_RAW, 'The generated text from AI.')
            )
        );
    }
}
