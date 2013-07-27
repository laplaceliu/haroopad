/* globally for window event system */
var gui = require('nw.gui');

window.nw = gui.Window.get();
window.ee = new EventEmitter();
window.parent = nw.parent;

if (process.platform != 'darwin') {
  MenuBar(); 
}

function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}

//fixed text.js error on node-webkit
require.nodeRequire = require;

/**
 * require.js 환경 설정
 */
requirejs.config({
  baseUrl: 'js/pad',
  waitSeconds: 30,
  locale: 'ko-kr',
  paths: {
    tpl: '../../tpl',
    vendors: '../vendors',
    text: '../vendors/text',
    store: '../vendors/store',
    keyboard: '../vendors/keymage'
  },
  config: {
    text: {
      env: 'xhr'
    }
  }
});

requirejs.onError = function (e) {
  alert('Oops! Haroopad is crash :-(');
};

requirejs([
    'window/Window',
    'editor/Editor',
    'viewer/Viewer',
    'ui/file/File'
  ], function(Window, Editor, Viewer, File) {
    // var html, res, file, uid, tmp, readOnly, x, y;
    var _tid_;

    // var orgTitle = 'Untitled';
    // var edited = false,
    //   delayClose = false;
    // var params = nw._params;
    var file = nw.file;

    // file = url('#file');
    // file = params.file;
    // tmp = params.tmp;
    // uid = params.uid;
    // readOnly = params.readOnly || false;

    if (!file) {
      Editor.on("change", delayChange);
    }

    nw.on('file.opened', function(file) {
      var opt = file.toJSON();
      window.parent.ee.emit('change.markdown', opt.markdown, function(html) {
        Editor.setValue(opt.markdown);
        
        Viewer.init(opt);
        window.ee.emit('change.after.markdown', Editor.getValue(), html, Editor);

        if (!opt.readOnly) {
          Editor.on("change", delayChange); 
        }
      });
    });

    // window.ee.on('file.opened', function(opt) {
    //   window.parent.ee.emit('change.markdown', opt.markdown, function(html) {
    //     Editor.setValue(opt.markdown);
        
    //     Viewer.init(opt);
    //     window.ee.emit('change.after.markdown', Editor.getValue(), html, Editor);

    //     if (!readOnly) {
    //       Editor.on("change", delayChange); 
    //     }
    //   });

    // });

    window.ee.on('file.reloaded', function(md) {
      Editor.setValue(md);
    });

    window.ee.on('file.saved', function(opt) {
      Viewer.init(opt);
    });

    function delayChange() {
      window.clearTimeout(_tid_);

      window.ee.emit('change.before.markdown', Editor.getValue());

      _tid_ = setTimeout(function() {
        window.parent.ee.emit('change.markdown', Editor.getValue(), function(html) {

          window.ee.emit('change.after.markdown', Editor.getValue(), html, Editor);
        });
      }, 100);
    }

    //run with file open;
    // if (tmp) {
    //   File.openTmp(decodeURIComponent(file), uid);
    // } else {
    //   if (file) {
    //     File.open(decodeURIComponent(file));
    //     Editor.setOption('readOnly', readOnly);
    //   } else {
    //     Editor.on("change", delayChange);
    //   }

    //   File.startAutoSave();
    // }

    nw.on('focus', function() {
      process.emit('actived', nw);
    });

    setTimeout(function() {
      process.emit('actived', nw);
      nw.show();
      window.focus();
    }, 10);

    $("#notifier").click(function(e) {
      var tagName = e.target.tagName.toUpperCase();

      switch(tagName) {
        case 'A' :
          window.parent.ee.emit($(e.target).data('href'));
          e.preventDefault();
        break;
      }
    });
});