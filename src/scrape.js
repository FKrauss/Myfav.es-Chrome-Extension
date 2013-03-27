(function() {
  var

    $saveModal = $('#myfaves-save'),

    currentURL   = window.location.href,
    currentTitle = document.title,

    primarySite,
    allSites,
    icons,

    handler
  ;

  handler = {

    modal: {

      template: function() {
        return ''
        + '<section id="myfaves-save">'
        + '  <h3>Or select a similar site: <select class="site"></select> </h3>'
        + '  <h2>'
        + '    Pick your icon'
        + '  </h2>'
        + '  <ul class="icon-list">'
        + '  </ul>'
        + '  <ul class="pagination tabs">'
        + '  </ul>'
        + '  <div class="actions">'
        + '    <div class="ui fixed-width blue save button">'
        + '      <i class="general ok"></i>'
        + '        Add to Myfaves'
        + '    </div>'
        + '    <div class="ui fixed-width cancel button">'
        + '      <i class="general cancel"></i>'
        + '      Cancel'
        + '    </div>'
        + '  </div>'
        + '</section>';
      },

      create: function() {
        if($saveModal.size() === 0) {
          $saveModal.remove();
        }
        return $( handler.modal.template() ).saveModal().appendTo('body');
      },

      open: function() {

      },

      close: function() {

      }

    }


  };


  if(currentURL) {

    // create modal
   $saveModal = handler.modal.create();

   // check if user already had icon
   $saveModal.saveModal('lookup', currentURL);
  }

}());