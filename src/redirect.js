function redirect() {
  chrome.storage.sync.get(['homepage', 'username'], function(settings) {
    window.alert('ok');
    var
      defaults     = {
        username : false,
        homepage : false,
        subDomain: 'https://www.'
      },
      username     = settings['username'] || false,
      homepage     = settings['homepage'] || false,
      subDomain    = defaults.subDomain,
      redirectPage = chrome.extension.getURL('src/options.html'),
      refresh = document.createElement('meta')
    ;
    if(homepage) {
      if(homepage == 'homepage') {
        redirectPage = subDomain + 'myfav.es/';
      }
      if(homepage == 'fast') {
        redirectPage = subDomain + 'myfav.es/fast';
      }
      if(homepage == 'custom') {
        if(username) {
          redirectPage = subDomain + 'myfav.es/' + username;
        }
        else {
          redirectPage = subDomain + 'myfav.es/';
        }
      }
    }
    document.location.href = redirectPage;
  });
}
window.addEventListener("DOMContentLoaded", redirect, true);
