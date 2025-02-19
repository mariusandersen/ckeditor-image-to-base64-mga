/* {[The file is published on the basis of YetiForce Public License 3.0 that can be found in the following directory: licenses/LicenseEN.txt or yetiforce.com]} */

function initPasteEvent(editorInstance) {
  if (editorInstance.addFeature) {
    editorInstance.addFeature({
      allowedContent: "img[alt,id,!src]{width,height};",
    });
  }

  editorInstance.on("contentDom", function () {
    var editableElement = editorInstance.editable
      ? editorInstance.editable()
      : editorInstance.document;
    editableElement.on("paste", onPaste, null, { editor: editorInstance });
  });
}
function onPaste(event) {
  var editor = event.listenerData && event.listenerData.editor;
  var $event = event.data.$;
  var clipboardData = $event.clipboardData;
  var found = false;
  var imageType = /^image/;

  if (!clipboardData) {
    return;
  }
  // If the length is exactly 1 and the kind is file assume the browser nativly works
  if (
    clipboardData.items.length === 1 &&
    clipboardData.items[0].kind === "file"
  ) {
    return;
  }
  return Array.prototype.forEach.call(clipboardData.types, function (type, i) {
    if (found) {
      return;
    }
    if (
      clipboardData.items[i].kind != "string" &&
      (type.match(imageType) || clipboardData.items[i].type.match(imageType))
    ) {
      readImageAsBase64(clipboardData.items[i], editor);
      return (found = true);
    }
  });
}

function readImageAsBase64(item, editor) {
  if (!item || typeof item.getAsFile !== "function") {
    return;
  }
  var file = item.getAsFile();
  var reader = new FileReader();
  reader.onload = function (evt) {
    var element = editor.document.createElement("img", {
      attributes: {
        src: evt.target.result,
      },
    });
    setTimeout(function () {
      editor.insertElement(element);
    }, 10);
  };
  reader.readAsDataURL(file);
}

CKEDITOR.plugins.add("ckeditor-image-to-base-mga", {
  requires: "dialog",
  icons: "ckeditor-image-to-base-mga",
  hidpi: true,
  init: function (editorInstance) {
    initPasteEvent(editorInstance);
    var pluginName = "ckeditor-image-to-base-mga-dialog";
    editorInstance.ui.addToolbarGroup("ckeditor-image-to-base-mga", "insert");
    editorInstance.ui.addButton("ckeditor-image-to-base-mga", {
      label: editorInstance.lang.common.image,
      command: pluginName,
      toolbar: "insert",
    });
    CKEDITOR.dialog.add(
      pluginName,
      this.path + "dialogs/ckeditor-image-to-base-mga.js"
    );
    editorInstance.addCommand(
      pluginName,
      new CKEDITOR.dialogCommand(pluginName, {
        allowedContent:
          "img[alt,!src]{border-style,border-width,float,height,margin,margin-bottom,margin-left,margin-right,margin-top,width}",
        requiredContent: "img[alt,src]",
        contentTransformations: [
          ["img{width}: sizeToStyle", "img[width]: sizeToAttribute"],
          ["img{float}: alignmentToStyle", "img[align]: alignmentToAttribute"],
        ],
      })
    );
    editorInstance.on("doubleclick", function (evt) {
      if (
        evt.data.element &&
        !evt.data.element.isReadOnly() &&
        evt.data.element.getName() === "img"
      ) {
        evt.data.dialog = pluginName;
        editorInstance.getSelection().selectElement(evt.data.element);
      }
    });
    if (editorInstance.addMenuItem) {
      editorInstance.addMenuGroup("imageToBase64Group");
      editorInstance.addMenuItem("imageToBase64Item", {
        label: editorInstance.lang.common.image,
        icon: this.path + "icons/ckeditor-image-to-base-mga.png",
        command: pluginName,
        group: "imageToBase64Group",
      });
    }
    if (editorInstance.contextMenu) {
      editorInstance.contextMenu.addListener(function (element, selection) {
        if (element && element.getName() === "img") {
          editorInstance.getSelection().selectElement(element);
          return { imageToBase64Item: CKEDITOR.TRISTATE_ON };
        }
        return null;
      });
    }
  },
});
