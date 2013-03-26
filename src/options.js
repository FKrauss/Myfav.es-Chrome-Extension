$(document)
  .ready(function() {

    var
      $saveModal      = $('#myfaves-save'),
      $options        = $('.option'),
      $username       = $('.username.option'),
      $select         = $('select'),
      $customHomepage = $select.find('.custom'),
      $saveButton     = $('.save.button'),
      $topSitesButton = $('.top.button'),
      $buttons        = $('.button'),

      topSites        = [],
      site            = {},
      siteIndex       = 0,

      handler         = {}
    ;

    handler = {

      returnFalse: function() {
        return false;
      },

      modal: {

        template: function() {
          return ''
          + '<section id="myfaves-save">'
          + '  <h3>You can use the arrows keys to navigate quickly</h3>'
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
          return $( handler.modal.template() ).saveModal({
            onAdd: handler.topSites.next
          }).appendTo('body');
        }
      },

      topSites: {

        initialize: function() {
          // create modal
          $saveModal = handler.modal.create();
          // grab sites
          chrome.topSites.get(function(sites) {
            topSites  = sites;
            siteIndex = 0;
            handler.topSites.add();
          });
        },

        add: function() {
          site = topSites[siteIndex] || false;
          if(site) {
            fav4.iconExists({
              data: {
                url: site.url
              },
              success: function(response) {
                if(response.success) {
                  if(response.sites !== undefined) {
                    var allSites = [];
                    $.each(response.sites, function (id, site){
                      allSites.push(site);
                    });
                    primarySite = allSites[0];
                    icons       = primarySite.icons || false;
                    if(icons) {
                      $saveModal.saveModal('icon.populate', icons);
                    }
                  }
                  else {
                    handler.topSites.next();
                  }
                }
              },
              failure: handler.topSites.next
            });
          }
        },

        next: function() {
          siteIndex++;
          if(topSites[siteIndex] !== undefined) {
            setTimeout(handler.topSites.add, 500);
          }
          return true;
        }

      },

      options: {

        initialize: function() {
          chrome.storage.sync.get(null, function(settings){
            var
              defaults = {
                username : '',
                homepage : 'http://www.myfav.es'
              },
              settings = $.extend(true, {}, defaults, settings)
            ;
            // add default text
            if(settings['username'] != '') {
              $customHomepage
                .html('Myfav.es/' + settings['username'])
              ;
            }
            else {
              $customHomepage
                .html('Myfav.es/yourusername')
              ;
            }
            $username
              .val(settings['username'])
            ;
            $select
              .val(settings['homepage'])
              .trigger('change')
            ;
          });
        },

        changed: function() {
          $saveButton
            .state('deactivate')
          ;
        },

        save: function() {
          var
            options = {}
          ;

          $options
            .each(function() {
              var
                name  = $(this).attr('name'),
                value = $(this).val()
              ;
              options[name] = value;
            })
          ;
          chrome.storage.sync.set(options, function(settings) {
            options.initialize();
          });
          return true;
        }
      }
    };

    handler.options.initialize();

    $select
      .select2()
    ;

    $options
      .on('change', handler.options.change)
    ;

    $buttons
      .state()
    ;

    $topSitesButton
      .on('click', handler.topSites.initialize)
    ;

    $saveButton
      .state({
        activateTest: handler.options.save,
        deactivateTest: handler.returnFalse,
        filter: {
          text: 'span'
        },
        states: {
          active: true
        },
        text: {
          active   : 'Changes saved!',
          inactive : 'Save Changes'
        }
      })
    ;

  })
;