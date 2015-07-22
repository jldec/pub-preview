/*
 * pub-preview.js
 *
 * browserify entry point for preview helper script
 * auto-injected into preview html by pub-editor
 * binds preview doc to generator via jqueryview
 *
 * NOTE: uses history push/pop-state, which doesn't work in older browers
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
*/

$(function(){

  var generator = window.parent.generator;
  if (!generator) throw new Error('cannot bind preview to pub-generator');
  var opts = generator.opts;
  var appUrl = opts.appUrl;

  // make generator available to jqueryview
  window.generator = generator;

  // bind jqueryview
  var jqv = require('./jqueryview')(generator, $);
  jqv.start();

  // https://github.com/visionmedia/page.js
  window.pager = require('page');

  window.pager('*', function(ctx) {
    var path = ctx.path;

    // strip origin from fq urls
    if (path.slice(0, appUrl.length) === appUrl) {
      path = path.slice(appUrl.length);
    }

    // strip querystring
    path = path.split('?')[0];

    generator.emit('nav',
      path,
      ctx.querystring ? '?' + ctx.querystring : '',
      ctx.hash ? '#' + ctx.hash : ''
    );

  });

  window.pager( {dispatch:false} ); // auto-dispatch loses hash.

  // hook custom client-side logic
  if (window.onGenerator) { window.onGenerator(generator); }

});