(function() {

  var
    base      =  ('https:' == document.location.protocol 
      ? 'https://' 
      : 'http://'),
    jquery    = base + 'ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js',
    save      = base + 'alpha.myfav.es/javascript/external/save.js',
    scrape    = base + 'alpha.myfav.es/javascript/external/scrape.js',
    css       = base + 'alpha.myfav.es/style/external/save.css',

    hasjQuery  = ($ = window.jQuery),
    oldjQuery = (hasjQuery && +($.fn.jquery.substr(0,3)) <= 1.7),


    load = function(src, callback) {
      var
        script = document.createElement('script')
      ;
      script.src = src;
      script.onload= callback;
      document.body.appendChild(script);
    },
    loadCSS = function(url, callback) {
      var
        link = document.createElement('link'),
        head = document.getElementsByTagName('head')[0],
        img  = document.createElement('img')
      ;
      link.type   = 'text/css';
      link.rel    = 'stylesheet';
      link.href   = url;
      img.onerror = callback;
      img.src     = url;
      head.appendChild(link);
    }
  ;
  if (!hasjQuery || (oldjQuery)  ) {
    load(jquery, function() {
      loadCSS(css, function() {
        load(save, function(){
          load(scrape);
        });
      });
    });
  }
  else {
    loadCSS(css, function() {
      load(save, function(){
        load(scrape);
      });
    });
  }

}());