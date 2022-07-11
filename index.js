/*
const { ipcRenderer, remote } = require('electron');
*/
const { ipcRenderer } = require('electron');
const { pathToFileURL } = require('url');

/*
const { app } = remote;

*/
const path = require('path');

const tinymce = require('tinymce/tinymce');

require('tinymce/themes/silver');
require('tinymce/plugins/paste');
require('tinymce/plugins/link');

let initialContent = "";

var EditingMode = true;

// Change current working directory
function change_cwd(newPath) {
  var pathURL = pathToFileURL(newPath);
  
  var pathHref = pathURL.href;
  
  if (tinymce.activeEditor) {
    var doc = tinymce.activeEditor.getDoc(),
      head = doc.head,
      base;
    
    if (head.getElementsByTagName("base").length == 0) {
      base = document.createElement("base");
      
      head.appendChild(base);
    } else {
      base = head.getElementsByTagName("base")[0];
    }
    
    base.setAttribute("href", pathHref + "/");
    
    tinymce.activeEditor.documentBaseURI.setPath(pathURL.pathname + "/");
  }
  
  var headx = document.head,
    basex;
  
  if (headx.getElementsByTagName("base").length == 0) {
    basex = document.createElement("base");
    
    headx.appendChild(basex);
  } else {
    basex = headx.getElementsByTagName("base")[0];
  }
  
  basex.setAttribute("href", pathHref + "/");
}

function set() {
  var path = ipcRenderer.sendSync('call-set');
  
  if (path.length > 0) {
    change_cwd(path);
  }
  
  tinymce.activeEditor.focus();
}

/*
function tes() {
  var path = ipcRenderer.sendSync('call-eso');
  
  if (path.length > 0) {
    change_cwd(path);
  }
  
  tinymce.activeEditor.focus();
}

*/
// Create new file
function newFile() {
  // 
  if (tinymce.editors[0].isDirty()) {
    tinymce.activeEditor.windowManager.open({
      title: 'Warning', // The dialog's title - displayed in the dialog header
      body: {
        type: 'panel', // The root body type - a Panel or TabPanel
        items: [ // A list of panel components
          {
            type: 'htmlpanel', // A HTML panel component
            html: 'Unsaved changes. Continue without saving?'
          }
        ]
      },
      onSubmit: function (api) {
        ipcRenderer.send('call-new');
        
        api.close();
      },
      buttons: [ // A list of footer buttons
        {
          type: 'cancel',
          /*
          name: 'closeButton',
          */
          text: 'Cancel'
        },
        {
          type: 'submit',
          text: 'OK'
        }
      ]
    });
    
    // Are we sure we want to exit out of the current file?
  } else {
    tinymce.activeEditor.windowManager.open({
      title: 'Warning', // The dialog's title - displayed in the dialog header
      body: {
        type: 'panel', // The root body type - a Panel or TabPanel
        items: [ // A list of panel components
          {
            type: 'htmlpanel', // A HTML panel component
            html: 'Close the current file and create a new one?'
          }
        ]
      },
      onSubmit: function (api) {
        ipcRenderer.send('call-new');
        
        api.close();
      },
      buttons: [ // A list of footer buttons
        {
          type: 'cancel',
          /*
          name: 'closeButton',
          */
          text: 'Cancel'
        },
        {
          type: 'submit',
          text: 'OK'
        }
      ]
    });
  }
  /*
  
  return;
  */
}

// Open file
function openFile(tofocus) {
  // 
  if (tinymce.editors[0].isDirty()) {
    tinymce.activeEditor.windowManager.open({
      title: 'Warning', // The dialog's title - displayed in the dialog header
      body: {
        type: 'panel', // The root body type - a Panel or TabPanel
        items: [ // A list of panel components
          {
            type: 'htmlpanel', // A HTML panel component
            html: 'Unsaved changes. Continue without saving?'
          }
        ]
      },
      onSubmit: function (api) {
        ipcRenderer.send('call-load');
        
        api.close();
      },
      buttons: [ // A list of footer buttons
        {
          type: 'cancel',
          /*
          name: 'closeButton',
          */
          text: 'Cancel'
        },
        {
          type: 'submit',
          text: 'OK'
        }
      ]
    });
  } else {
    ipcRenderer.send('call-load');
    
    if (tofocus) {
      tinymce.activeEditor.focus();
    }
  }
  /*
  
  return;
  */
}

// Save file
function saveFile(tofocus) {
  ipcRenderer.send('call-save');
  
  if (tofocus) {
    tinymce.activeEditor.focus();
  }
}

// Save file as
function saveFileAs(tofocus) {
  ipcRenderer.send('call-saveAs');
  
  if (tofocus) {
    tinymce.activeEditor.focus();
  }
}

// Quit
function quit() {
  if (tinymce.editors[0].isDirty()) {
    tinymce.activeEditor.windowManager.open({
      title: 'Warning', // The dialog's title - displayed in the dialog header
      body: {
        type: 'panel', // The root body type - a Panel or TabPanel
        items: [ // A list of panel components
          {
            type: 'htmlpanel', // A HTML panel component
            html: 'Unsaved changes. Continue without saving?'
          }
        ]
      },
      onSubmit: function () {
        ipcRenderer.send('call-quit');
      },
      buttons: [ // A list of footer buttons
        {
          type: 'cancel',

          text: 'Cancel'
        },
        {
          type: 'submit',
          text: 'OK'
        }
      ]
    });
  } else {
    ipcRenderer.send('call-quit');
  }
}

tinymce.PluginManager.add('menusave', function (editor, url) {
    editor.ui.registry.addMenuItem('menuwd', {
        icon: 'home',
        text: 'Set Working Directory',
        onAction: function () {
            set();
        }
    });
    /*
    editor.ui.registry.addMenuItem('menuwd', {
        icon: 'home',
        text: 'Tes Working Directory',
        onAction: function () {
            tes();
        }
    });
    */
    editor.ui.registry.addMenuItem('menuwens', {
        icon: 'new-document',
        text: 'New document',
        onAction: function () {
            newFile();
        }
    });
    editor.ui.registry.addMenuItem('menuload', {
        icon: 'browse',
        text: 'Open',
        onAction: function () {
            openFile(true);
        }
    });
    editor.ui.registry.addMenuItem('menusave', {
        icon: 'save',
        text: 'Save',
        onAction: function () {
            saveFile(true);
        }
    });
    editor.ui.registry.addMenuItem('menusaveas', {
        icon: 'user',
        text: 'Save As',
        onAction: function () {
            saveFileAs(true);
        }
    });
    editor.ui.registry.addMenuItem('menuquit', {
        icon: 'close',
        text: 'Quit',
        onAction: function () {
            quit();
        }
    });
});

// Upon opening new file
ipcRenderer.on('newly-made-file', function (event, path) {
  change_cwd(path);
  
  tinymce.editors[0].setContent(initialContent);

  tinymce.activeEditor.undoManager.reset();
  
  tinymce.editors[0].setDirty(false);
});

ipcRenderer.on('new-file', function (event, path, /*filename, */data) {
  change_cwd(path);
  
  tinymce.editors[0].setContent(data, { format: 'html' });
  
  tinymce.activeEditor.undoManager.reset();
  
  tinymce.editors[0].setDirty(false);
});

// Upon saving file
ipcRenderer.on('saved-file', function (event, pathname/*, filename*/) {
  change_cwd(pathname);
  
  tinymce.editors[0].setDirty(false);
  
  ipcRenderer.send('call-save-', tinymce.editors[0].getContent({ format: 'html' }));
});

ipcRenderer.on('action', (event, arg) => {
  switch (arg) {
    case 'exiting':
      if (EditingMode) {
        quit();
      }

      break;
    default:
      break;
  }
});

tinymce.baseURL = pathToFileURL(__dirname).href + "/" + "node_modules/tinymce";

tinymce.init({
  selector:'div.tinymce-full',
  language: 'zh_CN',
  language_url: 'langs/zh_CN.js',
  height: "99%",
  indent: true,
  /*
  toolbar: true,
  */
  theme: 'silver',
  
  content_css: 'css/editor-area-styles.css',
  content_style: "body { font-family: 'Noto Sans Mono CJK TC', 'Noto Sans Mono CJK TC', sans-serif; font-size: 18px; }",
  branding: false, // Disable TinyMCE branding in status bar
  statusbar: false,
  
  deprecation_warnings: false,
  
  convert_urls: false,
  fullpage_default_encoding: 'UTF-8',
  fullpage_default_font_size: '18px',
  fullpage_default_font_family: "'Noto Sans Mono CJK TC', 'Noto Sans Mono CJK TC', Serif",
  fullpage_default_title: " ",
  /* ... */
  font_formats: 'Andale Mono=andale mono,monospace;' +
  'Arial=arial,helvetica,sans-serif;' +
  'Arial Black=arial black,sans-serif;' +
  'Book Antiqua=book antiqua,palatino,serif;' +
  'Comic Sans MS=comic sans ms,sans-serif;' +
  'Courier New=courier new,courier,monospace;' +
  'Georgia=georgia,palatino,serif;' +
  'Helvetica=helvetica,arial,sans-serif;' +
  'Noto Sans Mono CJK TC=noto sans mono cjk tc,sans-serif;' +
  'Symbol=symbol;' +
  'Tahoma=tahoma,arial,helvetica,sans-serif;' +
  'Terminal=terminal,monaco,monospace;' +
  'Times New Roman=times new roman,times,serif;' +
  'Trebuchet MS=trebuchet ms,geneva,sans-serif;' +
  'Verdana=verdana,geneva,sans-serif;' +
  'Webdings=webdings;' +
  'Wingdings=wingdings,zapf dingbats',
  fontsize_formats: '14pt 18pt 24pt 36pt',
  menu: {
    file: { title: 'File', items: 'menuwd menuwens restoredraft menuload menusave menusaveas | print | menuquit' },
    edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
    view: { title: 'View', items: 'code | visualaid visualchars visualblocks | preview fullscreen' },
    insert: { title: 'View', items: 'image link media template codesample | charmap emoticons hr | pagebreak nonbreaking anchor | insertdatetime' },
    format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align | forecolor backcolor | removeformat' },
    tools: { title: 'Tools', items: 'spellcheckerlanguage | wordcount' },
    table: { title: 'Table', items: 'inserttable tableprops deletetable row column cell' },
    help: { title: 'Help', items: 'help' }
  },
  extended_valid_elements: 'link[rel|href],' +
  'a[class|name|href|target|title|onclick|rel],' +
  'script[type|src],' +
  'iframe[src|style|width|height|scrolling|marginwidth|marginheight|frameborder],' +
  'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
  menubar: 'file edit view insert format tools table tc help',
  toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist',
  plugins: 'print preview fullpage paste importcss searchreplace autolink directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount noneditable help charmap quickbars emoticons menusave',
  /* autosave, */
  file_picker_types: 'file image',
  // and here's our custom image picker
  file_picker_callback: function (callback, value, meta) {
    var filetypex = meta.filetype;
    var pathname = ipcRenderer.sendSync('call-get', filetypex);
    
    if (pathname.length > 0) {
      var filename = path.basename(pathname);
      // Provide file and text for the link dialog
      if (filetypex == 'file') {
        callback(pathToFileURL(pathname).href, { text: filename });
      }
      
      if (filetypex == 'image') {
        callback(pathToFileURL(pathname).href, { alt: filename });
      }
    }
  },
  init_instance_callback: function (editor) {
    // Give edit area focus at start up
    tinyMCE.get('editor').getBody().focus();
    
    initialContent = editor.getContent({ format: 'html' });
  },
  images_dataimg_filter: function (img) {
    return img.hasAttribute('internal-blob'); // Note: The images_dataimg_filter option can also be used to specify a filter predicate function for disabling the logic that converts base64 images into blobs while within the editor. Tiny discourages using images_dataimg_filter for this
  }
});
