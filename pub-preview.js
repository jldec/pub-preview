/*
 * pub-preview.js
 *
 * browserify entry point for preview helper script
 * auto-injected into preview html by pub-editor
 * binds preview doc to generator via jqueryview
 *
 * NOTE: uses history push/pop-state, which doesn't work in older browers
 * Copyright (c) 2015-2024 Jürgen Leschner - github.com/jldec - MIT license
 *
*/

$(function(){

  var generator = window.parent.generator;
  if (!generator) throw new Error('cannot bind preview to pub-generator');
  var u = generator.util;
  var opts = generator.opts;
  var log = opts.log;
  var appUrl = opts.appUrl;

  // make generator available to jqueryview
  window.generator = generator;

  // bind jqueryview
  var jqv = require('./jqueryview')(generator, window);
  jqv.start();

  // navigate to page= parameter on startup
  var startPage = window.parent.location.search ?
    require('querystring').parse(window.parent.location.search.slice(1)).page : '';

  if (!startPage) {
    startPage = u.unPrefix(u.unPrefix(window.parent.location.pathname, opts.staticRoot), opts.editorPrefix);
  }

  // https://github.com/visionmedia/page.js
  window.pager = require('page');

  window.pager('*', function(ctx) {
    var path = ctx.path;

    // strip origin from fq urls
    path = u.unPrefix(path, appUrl);

    // strip static root (see /server/client/init-opts.js)
    path = u.unPrefix(path, opts.staticRoot);

    // strip querystring
    path = path.split('?')[0];

    log('pager nav %s%s%s%s',
      path,
      ctx.querystring ? '?' + ctx.querystring : '',
      ctx.hash ? '#' + ctx.hash : '',
      !!startPage ? ' (forceReload)' : '');

    generator.emit('nav',
      path,
      ctx.querystring ? '?' + ctx.querystring : '',
      ctx.hash ? '#' + ctx.hash : '',
      !!startPage
    );

    startPage = undefined; // only forceReload once on startPage

  });

  // start pager
  window.pager( {dispatch:false} ); // auto-dispatch loses hash.

  if (startPage) { pager.show(startPage); }

  // hook custom client-side logic
  if (window.onGenerator) { window.onGenerator(generator); }

});
