# pub-preview

Browserify script for client-side navigation and pub-pkg-editor preview rendering (uses jQuery).

### Installation

- This module is included as a dependency of `pub-pkg-editor`
- The module simply exports a fully qualified path to `pub-preview.js`which can then can be served as a browserScript through `pub-config.js`. E.g

```js
{ path: require('pub-preview'),  route: '/pub/js' }
```

The script can be injected into any pub-server generated HTML with

```js
var $script = $('<script src="/pub/js/pub-preview.js"></script>');
$('body').append($script);
```

#### Note

- the script assumes a global instance of `pub-generator` in `window.generator`

- client-side navigation is performed by the [page](https://github.com/visionmedia/page.js) module which depends on history.pushstate support in the browser.


### How it works

- `pub-preview.js` loads the `page` module which takes over click events and manages browser history. Any internal link to another page will trigger a generator `nav` event.

- `jqueryview.js` listens for generator 'nav', 'loaded', and 'updatedText' events and emits 'update-view' when content in the DOM has been replaced with newly generated HTML. This allows the same mechanism to be used for offline navigation as well as source changes in an editor.

### html template guidelines

When content is modified an attempt is made to determine whether the edit affects the layout, the page or fragment container, or just the  html rendered from markdown

In order to maximize responsiveness, the editor relies on data attributes on html tags to replace just the affected HTML


- `data-render-layout` = name of layout template - wrapper auto-inserted by {{{renderLayout}}})
- `data-render-page` = name of page template - wrapper div auto-inserted by  {{{renderPage}}}
- `data-render-html` = _href of fragment or page - wrapper div auto-inserted by {{{html}}}
