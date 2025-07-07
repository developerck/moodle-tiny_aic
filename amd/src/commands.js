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

/**
 * Commands helper for the Moodle tiny_aic plugin.
 *
 * @module      tiny_aic/commands
 * @copyright   2025 DeveloperCK <developerck@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import $ from "jquery";
import { get_string, get_strings } from "core/str";
import { getButtonImage } from "editor_tiny/utils";
import { component, buttonName, icon } from "tiny_aic/common";
import Ajax from "core/ajax";
import * as Options from "./options";
/**
 * Get the setup function for the buttons.
 *
 * This is performed in an async function which ultimately returns the registration function as the
 * Tiny.AddOnManager.Add() function does not support async functions.
 *
 * @returns {function} The registration function to call within the Plugin.add function.
 */
export const getSetup = async () => {
  const [buttonTitle, buttonImage, dialogStrings] = await Promise.all([
    get_string("button_title", component),
    getButtonImage("icon", component),
    get_strings([
      { key: "header", component },
      { key: "help", component },
      { key: "generate", component },
      { key: "cancel", component },
      { key: "placeholder", component },
      { key: "emptyrule", component },
      { key: "lengthrule", component },
      { key: "thinking", component },
    ]),
  ]);

  return (editor) => {
    if (Options.isAllowed(editor)) {
      // Register the Moodle SVG as an icon suitable for use as a TinyMCE toolbar button.
      editor.ui.registry.addIcon(icon, buttonImage.html);

      // Register the startdemo Toolbar Button.
      editor.ui.registry.addButton(buttonName, {
        icon,
        tooltip: buttonTitle,
        onAction: () => handleAction(editor, dialogStrings),
      });
    }
  };
};

/**
 * Handle the action for your plugin.
 * @param {TinyMCE.editor} editor The tinyMCE editor instance.
 * @param {dialogStrings} dialogStrings
 */
const handleAction = (editor, dialogStrings) => {
  editor.windowManager.open({
    title: dialogStrings[0],
    size: "medium",
    body: {
      type: "panel",
      items: [
        {
          type: "textarea",
          name: "prompt",
          label: dialogStrings[1],
          placeholder: dialogStrings[4],
          multiline: true,
        },
        {
          type: "htmlpanel",
          html: '<div id="' + editor.id + '_aic" style="height: 100%;"></div>',
        },
      ],
    },
    buttons: [
      {
        type: "submit",
        name: "generate",
        text: dialogStrings[2],
        buttonType: "primary",
      },
      {
        type: "cancel",
        name: "cancel",
        text: dialogStrings[3],
      },
    ],

    onSubmit: async (api) => {
      const data = api.getData();
      const prompt = data.prompt;
      const aiOutputPanel = $("#" + editor.id + "_aic");
      const styleId = "aic-card-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
      /* Card container */
.tox .tox-dialog__body-content .card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  margin-bottom: 1rem;
  font-family: system-ui, sans-serif;
}

/* Card header */
.tox .tox-dialog__body-content .card-header {
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dee2e6;
  font-size: 1.25rem;
  font-weight: 500;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

/* Card body */
.tox .tox-dialog__body-content .card-body {
  padding: 1rem;
}

/* Card text */
.tox .tox-dialog__body-content .card-text {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #212529;
}

.tox .alert-danger {
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c2c7;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: system-ui, sans-serif;
}
  .tox .alert-warning {
  background-color: #fff3cd;
  color: #664d03;
  border: 1px solid #ffecb5;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: system-ui, sans-serif;
}
   .tox .alert-info {
  background-color:rgb(205, 239, 255);
  color: #664d03;
  border: 1px solid rgb(205, 239, 255);
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: system-ui, sans-serif;
}
    `;
        document.head.appendChild(style);
      }
      if (!prompt || prompt.trim() === "") {
        $(aiOutputPanel).html(
          "<div class ='alert alert-danger'>"+dialogStrings[5]+"</div>"
        );
        return;
      }
      if (prompt.length < 3 || prompt.length > 1000) {
        // Show a loading indicator (optional but good UX)
        $(aiOutputPanel).html(
          "<div class ='alert alert-danger'>"+dialogStrings[6]+"</div>"
        );
      }
      try {
         $(aiOutputPanel).html(
          "<div class ='alert alert-info'>"+dialogStrings[7]+"</div>"
        );
        Ajax.call([
          {
            methodname: "tiny_aic_get_generated_text", // Define this method in your ajax.php
            args: {
              prompt: prompt,
            },
          },
        ])[0]
          .done(function (response) {
            $(aiOutputPanel).html("");
            if (response.error) {
              // Handle the error response from the AI service.
              throw new Error(dialogStrings[4]);
            } else {
              // Insert the generated text into the editor.

              aiOutputPanel.html(response.generatedtext);
              $("#inserttext_tiny_aic").on("click", () => {
                // Extract the text from the corresponding .response div
                response = $("#aiccontent").text();
                if (response && editor) {
                  editor.insertContent(response);
                  // Optionally, close the dialog after inserting content
                  api.close();
                }
              });
            }
          })
          .fail(function (err) {
            $(aiOutputPanel).html(
              '<div class="alert alert-danger" role="alert">' +
                err.message +
                "</div>"
            );
          });
      } catch (error) {
        $(aiOutputPanel).html(
          '<div class="alert alert-danger" role="alert">' +
            error.message +
            "</div>"
        );
      }
    },
  });
};
