/**
 * jqueryview.js
 *
 * pub-generator plugin for jquery views
 * Copyright (c) 2015-2024 Jürgen Leschner - github.com/jldec - MIT license
 *
 * listens for 'nav', 'loaded', and 'updatedText' events
 * emits 'update-view' when content has been replaced
 *
 * minimize html replacements by looking for attributes
 * data-render-layout
 * data-render-page
 * data-render-html
 *
 *
**/

module.exports = function(generator, window) {

  var $ = window.$;
  var opts = generator.opts;
  var u = generator.util;
  var lang = generator.handlebars.pageLang;
  var log = opts.log;

  // if there is no data-render-layout attribute, updateLayout will not be called
  var $layout = $('[data-render-layout]');

  var view = {
    start: start, // call start() after views are created
    stop: stop    // call stop() before views are deleted
  };

  return view;

  function start() {
    log('jqueryview start');
    generator.on('nav', nav);
    generator.on('loaded', nav); // full reload after structural edits
    generator.on('updatedText', updateHtml); // handle minor edits
  }

  function stop() {
    log('jqueryview stop');
    generator.off('nav', nav);
    generator.off('loaded', nav);
    generator.off('updatedText', updateHtml);
  }

  // navigate or reload by regenerating just the page or the whole layout
  function nav(path, query, hash, forceReload) {
    log('jqueryview nav %s%s%s %s', path, query || '', hash || '', !!forceReload);

    var reload = forceReload || !path;

    path =  path  || location.pathname;
    query = query || (reload && location.search) || '';
    hash =  hash  || (reload && location.hash)   || '';

    var newpage = generator.findPage(path);
    if (!newpage) return generator.emit('notify', 'Oops, jqueryview cannot find new page object ' + path);

    var oldpath = u.unPrefix(location.pathname, opts.staticRoot);
    var oldpage = generator.findPage(oldpath);
    if (!oldpage) return generator.emit('notify', 'Oops, jqueryview cannot find current page object ' + oldpath);

    if (!reload && newpage === oldpage) return; // hash navigation doesn't require repaint

    // simulate server-side request
    generator.req = { query: query ? require('querystring').parse(query.slice(1)) : {} };

    if ($layout.length && (reload || layoutChanged(oldpage, newpage))) {
      updateLayout();
      return;
    }

    // else just update page
    updatePage();

    ///// helper functions /////

    function updateLayout() {
      var layout = generator.layoutTemplate(newpage);
      $layout.html(generator.renderLayout(newpage));
      $layout.attr('data-render-layout', layout);
      log('jqueryview updateLayout', path, query, hash);
      generator.emit('update-view', path, query, hash, window, $layout);
    }

    function updatePage() {
      var $page = $('[data-render-page]');
      if (!$page.length) return generator.emit('notify', 'Oops, jqueryview cannot update page ' + path);

      $page.html(generator.renderPage(newpage));
      $page.attr('data-render-page', newpage._href);
      log('jqueryview updatePage:', path, query, hash)
      generator.emit('update-view', path, query, hash, window, $page);
    }

    // return true if newpage layout is different from current layout
    function layoutChanged(oldpage, newpage) {
      if (oldpage && oldpage.fixlayout) return true;
      if (lang(oldpage) !== lang(newpage)) return true;
      var currentlayout = $layout.attr('data-render-layout') || 'main-layout';
      var newlayout = generator.layoutTemplate(newpage);
      return (newlayout !== currentlayout);
    }

  }

  // this won't work if the href of a fragment is edited
  function updateHtml(href) {
    var fragment = generator.fragment$[href];
    if (!fragment) return generator.emit('notify', 'Oops, jqueryview cannot find fragment: ' + href);

    var $html = $('[data-render-html="' + href + '"]');
    if (!$html.length) return generator.emit('notify', 'Oops, jqueryview cannot update html for fragment: ' + href);

    $html.html(generator.renderHtml(fragment));
    var path = u.unPrefix(location.pathname, opts.staticRoot);
    log('jqueryview updateHtml', path, location.search, location.hash);
    generator.emit('update-view', path, location.search, location.hash, window, $html);
  }

}
