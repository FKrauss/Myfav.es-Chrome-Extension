/*  ******************************
            Fav4 Stub
******************************  */
fav4 = {

  iconExists: function(parameters) {
    var
      settings = {
        dataType: 'json',
        url: 'http://beta.myfav.es/api/icon-exists/',
        data: {
          url      : false,
          extended : true
        },
        success: function(){},
        failure: function(){}
      }
    ;
    $.extend(true, settings, parameters);
    if(settings.url) {
      $.ajax(settings);
    }
  },

  getIcons: function(iconID, parameters) {
    var
      settings = {
        dataType: 'json',
        url: 'http://beta.myfav.es/api/icon/',
        success: function(){},
        failure: function(){}
      }
    ;
    $.extend(true, settings, parameters);
    if(iconID) {
      settings.url = settings.url + iconID;
      $.ajax(settings);
    }
  },

  settings: {
    hasIcon: function(parameters) {
      var
        settings = {
          method: 'POST',
          dataType: 'json',
          url: 'http://beta.myfav.es/include/api/modify-settings.php',
          success: function(){},
          failure: function(){},
          data: {
            action: 'exists',
            identifier: false
          }
        }
      ;
      $.extend(true, settings, parameters);
      if(settings.data.identifier) {
        $.ajax(settings);
      }
    },
    addIcon: function(parameters) {
      // send json request to bookmarklet.php
      var
        settings = {
          method: 'POST',
          dataType: 'json',
          url: 'http://beta.myfav.es/include/api/modify-settings.php',
          success: function(){},
          failure: function(){},
          data: {
            action: 'add',
            identifier: false,
            url: false
          }
        }
      ;
      $.extend(true, settings, parameters);
      if(settings.data.identifier && settings.data.url) {
        $.ajax(settings);
      }
    },
    removeIcon: function(identifier, parameters) {
      var
        settings = {
          method: 'POST',
          dataType: 'json',
          url: 'http://beta.myfav.es/include/api/modify-settings.php',
          success: function(){},
          failure: function(){},
          data: {
            action: 'remove',
            identifier: false
          }
        }
      ;
      $.extend(true, settings, parameters);
      if(settings.data.identifier) {
        $.ajax(settings);
      }
    }
  }

};



/*  ******************************
  Site Add Modal
  Author: Jack Lukic
  Notes: First Commit Feb 13, 2013
******************************  */

;(function ($, window, document, undefined) {

  $.fn.saveModal = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.saveModal.settings, parameters),

      // modal exists only once
      $modal         = $(this),
      $siteSelect    = $modal.find(settings.selector.siteSelect),
      $siteHeader    = $modal.find(settings.selector.siteHeader),
      $modalMiniIcon = $modal.find(settings.selector.modalMiniIcon),
      $iconList      = $modal.find(settings.selector.iconList),
      $iconPreview   = $modal.find(settings.selector.iconPreview),
      $iconPages     = $modal.find(settings.selector.iconPages),
      $save          = $modal.find(settings.selector.save),
      $cancel        = $modal.find(settings.selector.cancel),

      // hoist arguments
      moduleArguments = arguments || false
    ;

    $(this)
      .each(function(index) {
        var
          $module        = $(this),
          // icon list
          $icons         = $module.find(settings.selector.icons),
          $miniIcon      = $module.find(settings.selector.miniIcon),
          $iconName      = $module.find(settings.selector.iconName),
          $addIcon       = $module.find(settings.selector.addIcon),

          instance       = $module.data('module-save'),
          allSites,

          eventNamespace = settings.eventNamespace,
          className      = settings.className,
          module
        ;

        module = {

          initialize: function() {
            $module
              .data('module-save', module)
            ;
          },

          initializeModal: function() {
            module.debug('Initializing modal');
            // set up icon modal once
            $modal
              .modal()
              .addClass(className.initialize)
            ;
            $cancel
              .state()
            ;
            $save
              .state()
            ;
          },

          toggleActive: function() {
            module.debug('Toggling active icons');
            $(this)
              .addClass(className.active)
              .siblings()
                .removeClass(className.active)
            ;
          },

          lookup: function(url) {
            fav4.iconExists({
              data: {
                url: url
              },
              success: function(response) {
                if(response.success) {
                  if(response.sites !== undefined) {
                    allSites = [];
                    $.each(response.sites, function (id, site){
                      allSites.push(site);
                    });
                    primarySite = allSites[0];
                    module.populate(primarySite);
                  }
                  else {
                    // go to upload form
                    window.alert('Site doesnt exist on myfaves');
                  }
                }
              },
              failure: function() {
                window.alert('There was an error please try again later');
              }
            });
          },

          populate: function(primarySite) {
            var icons = primarySite.icons || false;
            module.site.addTitle(primarySite);
            module.site.addDropdown(allSites, primarySite);
            module.icon.populate(icons);
          },

          site: {

            addTitle: function (site) {
              $siteHeader
                .html('Pick an icon for ' + site.title)
              ;
            },
            addDropdown: function(sites, primarySite) {
              var
                $parent = $siteSelect.parent(),
                html    = '',
                siteID  = primarySite.id || false
              ;
              if(sites.length > 1) {
                $.each(sites, function(name, site){
                  html += settings.templates.dropdown(site);
                });
                $siteSelect
                  .html(html)
                  .off('change')
                  .on('change', function() {
                    var 
                      siteID = $(this).val(),
                      primarySite
                    ;
                    $.each(allSites, function(index, site) {
                      if(site.id == siteID) {
                        primarySite = site;
                      }
                    });
                    module.populate( primarySite );
                  })
                ;
                if(siteID) {
                  $siteSelect.val(siteID);
                }
                $parent.show();
              }
              else {
                $parent.hide();
              }
            },

          },

          icon: {

            populate: function(icons) {
              if( $.isArray(icons) ) {
                $(this).data('icons', icons);
                if(icons.length >= 1 ) {
                  $(this)
                    .addClass(className.pending)
                    .siblings()
                      .removeClass(className.pending)
                  ;
                  module.multi.addIcons(icons);
                  module.multi.pages.setup(icons);
                  module.multi.show();
                }
              }
            },
            add: function(identifier, url, color, shading, title) {
              module.debug('Adding icon ' + identifier);
              var
                $context = $(this)
              ;
              $context
                .addClass(className.loading)
              ;
              fav4.settings.addIcon({
                data: {
                  identifier : identifier,
                  url        : url,
                  color      : color,
                  gradient   : shading,
                  title      : title
                },
                success: function() {
                  $context
                    .removeClass(className.loading)
                    .addClass(className.active)
                  ;
                  $modal.modal('hide');
                  $.proxy(settings.onAdd, $context)();
                },
                failure: function() {
                  $context
                    .removeClass(className.loading)
                  ;
                  alert('There was an error adding your icon');
                  module.error(settings.errors.add);
                  $.proxy(settings.onError, $context)();
                }
              });
              /*
              if(color !== undefined) {
                fav4.changeColor(identifier, color);
              }
              if(shading !== undefined) {
                fav4.changeGradient(identifier, shading);
              }
              if(title !== undefined) {
                fav4.defaultTitle(identifier, title);
              }
              */
            },
            remove: function(identifier) {
              module.debug('Removing icon: ' + identifier);
              var $context = $(this);
              $context
                .addClass(className.loading)
              ;
              fav4.settings.removeIcon(identifier, {
                success: function() {
                  $context
                    .removeClass(className.loading)
                    .removeClass(className.active)
                  ;
                  $.proxy(settings.onRemove, $context)();
                },
                failure: function() {
                  $context
                    .removeClass(className.loading)
                  ;
                  $.proxy(settings.onError, $context)();
                }
              });
            }
          },
          multi: {
            buttons: {
              bind: function(){
                module.debug('Adding modal events');
                $cancel
                  .on('click' + eventNamespace, module.multi.cancel)
                ;
                $save
                  .on('click' + eventNamespace, module.multi.save)
                ;
                $iconPages
                  .children()
                    .state({
                      context: $modal
                    })
                    .on('click' + eventNamespace, $modal, module.multi.pages.click)
                ;
              },
              unbind: function() {
                module.debug('Removing modal events');
                $cancel
                  .off('click' + eventNamespace)
                ;
                $save
                  .off('click' + eventNamespace)
                ;
                $iconPages
                  .children()
                    .off('click' + eventNamespace)
                ;
              }
            },
            keyboardShortcuts: {
              bind: function() {
                module.debug('Binding keyboard shortcuts');
                $(document)
                  .on('keydown' + eventNamespace, module.multi.keyboardShortcuts.changeIcon)
                ;
              },
              unbind: function() {
                module.debug('Removing keyboard shortcuts');
                $(document).off('keydown' + eventNamespace);
              },
              changeIcon: function(event) {
                var
                  $modalIcons  = $iconList.children(),
                  $activeIcon  = $modalIcons.filter('.' + className.active),
                  iconCount    = $modalIcons.size(),
                  currentIndex = $modalIcons.index($activeIcon),
                  iconsPerRow  = settings.iconsPerRow,
                  pressedKey   = event.which,
                  endOfRow     = ( (currentIndex % iconsPerRow) == (iconsPerRow - 1) ),
                  startOfRow   = ( (currentIndex % iconsPerRow) === 0),

                  key          = {
                    left  : 37,
                    up    : 38,
                    right : 39,
                    down  : 40,
                    enter : 13
                  },
                  newIndex
                ;
                if(pressedKey == key.enter) {
                  module.multi.save();
                  $save
                    .addClass(className.down)
                  ;
                  $(document)
                    .one('keyup', function(){
                      $save
                        .removeClass(className.down)
                      ;
                    })
                  ;
                }
                if(currentIndex != -1) {
                  if(pressedKey == key.left) {
                    if(startOfRow) {
                      module.multi.pages.change('previous');
                    }
                    else {
                      newIndex = currentIndex - 1;
                    }
                  }
                  else if(pressedKey == key.right) {
                    if(endOfRow) {
                      module.multi.pages.change('next');
                    }
                    else {
                      newIndex = currentIndex + 1;
                    }
                  }
                  else if(pressedKey == key.up) {
                    newIndex = currentIndex - iconsPerRow;
                  }
                  else if(pressedKey == key.down) {
                    newIndex = currentIndex + iconsPerRow;
                  }
                  if(newIndex >= 0 && newIndex < iconCount) {
                    $modalIcons
                      .removeClass(className.active)
                      .eq(newIndex)
                        .addClass(className.active)
                    ;
                    event.preventDefault();
                  }
                }
              }
            },
            addIcons: function(icons, startPosition, activePosition) {
              var
                activePosition = activePosition || 0,
                startPosition  = startPosition || 0,
                isLastPage     = (startPosition + settings.iconsPerPage > icons.length),
                endPosition    = (isLastPage)
                  ? icons.length
                  : startPosition + settings.iconsPerPage,
                pageIcons      = icons.slice(startPosition, endPosition),
                html           = ''
              ;
              module.debug('Adding icons to modal starting at ' + startPosition);
              $.each(pageIcons, function(index, icon) {
                html += settings.templates.icon(icon, settings.domain);
              });
              console.log(isLastPage);
              if(isLastPage) {
                html += settings.templates.uploadIcon(settings.domain);
              }
              $iconList
                .data('startPosition', startPosition)
                .data('icons', icons)
                .html(html)
                .children()
                  .bind('mousedown', module.toggleActive)
                  .eq(activePosition)
                    .addClass(className.active)
                    .end()
                  .end()
                .find(settings.selector.iconPreview)
                  .state()
                  .end()
                .find(settings.selector.iconTooltip)
                  .popup()
              ;
            },
            pages: {
              setup: function(icons) {
                var
                  pageCount   = Math.ceil(icons.length / settings.iconsPerPage) || 1,
                  pageCounter = 1,
                  html        = ''
                ;
                while(pageCounter <= pageCount) {
                  html += settings.templates.page(pageCounter);
                  pageCounter ++;
                }
                $iconPages
                  .html(html)
                  .children()
                    .eq(0)
                      .addClass(className.active)
                ;
              },
              change: function(direction) {
                module.debug('Changing page to: ' + direction);
                var
                  startPosition = $iconList.data('startPosition') || 0,
                  icons         = $iconList.data('icons') || [],
                  iconCount     = icons.length,
                  page
                ;
                if(direction == 'next') {
                  startPosition = startPosition + settings.iconsPerPage;
                }
                else if(direction == 'previous') {
                  startPosition = startPosition - settings.iconsPerPage;
                }
                else if (typeof direction == 'number') {
                  startPosition = (direction * settings.iconsPerPage) - settings.iconsPerPage;
                }
                if(startPosition >= 0 && startPosition < iconCount) {
                  page = parseInt( ( (startPosition + settings.iconsPerPage) / settings.iconsPerPage), 10);
                  $iconPages
                    .children()
                      .removeClass(className.active)
                      .eq(page - 1)
                      .addClass(className.active)
                  ;
                  module.multi.addIcons(icons, startPosition);
                }
              },
              click: function() {
                module.multi.pages.change( $iconPages.children().index( $(this) ) + 1 );
              }
            },
            show: function() {
              module.debug('Showing modal');
              module.multi.buttons.unbind();
              module.multi.buttons.bind();
              module.multi.keyboardShortcuts.bind();
              $modal.modal('show');
            },
            hide: function() {
              module.debug('Hiding modal');
              module.multi.keyboardShortcuts.unbind();
              module.multi.buttons.unbind();
              $modal.modal('hide');
            },
            save: function() {
              module.debug('Handling saving UI');
              var
                $iconList       = $modal.find(settings.selector.iconList),
                $availableIcons = $iconList.children(),
                $selectedIcon   = $availableIcons.filter('.' + className.active),
                icons           = $iconList.data('icons'),
                iconPosition    = $iconList.data('startPosition') + $availableIcons.index($selectedIcon),
                icon            = icons[iconPosition] || false,
                $icon
              ;
              if(icon) {
                $icon = $icons.filter('.' + className.pending);
                $icon.removeClass(className.pending);
                $.proxy(module.icon.add, $icon)(icon.identifier, icon.url, icon.color, icon.shading, icon.name);
                module.multi.hide();
              }
            },
            cancel: function() {
              module.multi.hide();
              $.proxy(settings.onCancel, this)();
            }
          },

          // handle error logging
          error: function(errorMessage) {
            console.warn('Icon List: ' + errorMessage);
          },

          debug: function(message) {
            if(settings.debug) {
              console.info('Icon List: ' + message);
            }
          },
          invoke: function(query, context, passedArguments) {
            var
              maxDepth,
              found
            ;
            passedArguments = passedArguments || [].slice.call( arguments, 2 );
            if(typeof query == 'string' && instance !== undefined) {
              query    = query.split('.');
              maxDepth = query.length - 1;
              $.each(query, function(depth, value) {
                if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                  instance = instance[value];
                  return true;
                }
                else if( instance[value] !== undefined ) {
                  found = instance[value];
                  return true;
                }
                module.error(settings.errors.method);
                return false;
              });
            }
            if ( $.isFunction( found ) ) {
              return found.apply(context, passedArguments);
            }
            // return retrieved variable or chain
            return found;
          }

        };

        // initialize modal once
        if( index === 0 && !$modal.hasClass(className.initialize) ) {
          module.initializeModal();
        }
        if(typeof moduleArguments[0] == 'string') {
          // simpler than invoke realizing to invoke itself (and losing scope due prototype.call()
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // initialize icons each
        module.initialize();
      })
    ;

    return this;
  };

  $.fn.saveModal.settings = {

    onAdd          : function(){},
    onCancel       : function(){},
    onRemove       : function(){},
    onError        : function(){},

    simple         : false,

    domain: 'http://beta.myfav.es/',

    iconsPerPage   : 8,
    iconsPerRow    : 4,

    debug          : true,
    eventNamespace : '.iconList',

    errors: {
      add     : 'Error adding icon.',
      remove  : 'Error removing icon.',
      method  : 'Method name not defined'
    },

    metadata: {
      color    : 'color',
      gradient : 'gradient',
      title    : 'title'
    },

    className   : {
      disabled   : 'disabled',
      initialize : 'init',
      hover      : 'hover',
      down       : 'down',
      active     : 'active',
      pending    : 'pending',
      loading    : 'loading'
    },

    selector    : {
      // headers
      siteHeader   : 'h2',
      siteSelect   : 'select.site',
      // site list
      icons         : 'li',
      miniIcon      : '.icon',
      iconName      : '.name',
      addIcon       : 'i.icon',

      // modal selectors
      modalMiniIcon : '.mini',
      iconList      : '.icon-list',
      iconPreview   : 'li .preview.icon',
      iconTooltip   : 'li .info',
      iconPages     : '.pagination',
      save          : '.save.button',
      cancel        : '.cancel.button'
    },

    templates: {
      dropdown: function(site) {
        if(site.name !== undefined && site.url !== undefined) {
          return '<option value="'+ site.id +'">' + site.name + '</option>';
        }
      },
      icon: function(icon, domain) {
        var
          html     = '',
          color    = icon.color || '',
          image    = icon.imageURL || '',
          gradient = icon.shading || '',
          iconAdds = icon.iconAdds || 0,
          sheen    = true,
          text = (icon.type == 'Official' || icon.type == 'Original')
            ? 'Official Icon'
            : 'Created by <a href=\'/' + icon.username + '\' target=\'_blank\'>' + icon.username + '</a>'
        ;
        html += '' +
          '<li>' +
          '  <div class="preview icon">' +
          '    <div class="color" style="background-color:' + color + '"></div>' +
          '    <div class="image" style="background-image: url(' + domain  + image + ')"></div>' +
          '    <div class="gradient ' + gradient + '"></div>' +
          '    <div class="' + sheen + ' sheen"></div>' +
          '  </div>'
        ;
        if(text !== undefined && iconAdds !== undefined) {
          html += '' +
            '  <div class="info" data-html="<b>+' + iconAdds + '</b> ' + text + '">' +
            '    <i class="general info-circle"></i>' +
            '  </div>'
          ;
        }
        html += '' +
          '</li>'
        ;
        return html;
      },
      uploadIcon: function(domain) {
        return '' +
          '<li class="upload">' +
          '  <div class="preview icon">' +
          '    <div class="color" style="background-color:#FFFFFF"></div>' +
          '    <div class="image" style="background-image: url(' + domain + 'images/scrape/upload-your-own.png)"></div>' +
          '    <div class="gradient"></div>' +
          '    <div class="sheen"></div>' +
          '  </div>'
      },
      page: function(number) {
        return '<li>' + number + '</li>';
      }
    }

  };

})( jQuery, window , document );

/*  ******************************
  Modal -  Components
  Author: Jack Lukic
  Notes: First Commit May 14, 2012

  Manages modal state and
  stage dimming

******************************  */

;(function ( $, window, document, undefined ) {

  $.dimScreen = function(parameters) {
    var
      // if parameter is string it is callback function
      settings       = (typeof parameters == 'function')
        ? $.extend({}, $.fn.modal.settings, { dim: parameters })
        : $.extend({}, $.fn.modal.settings, parameters),

      $context       = $(settings.context),
      $dimmer        = $context.children(settings.selector.dimmer),
      dimmerExists   = ($dimmer.size() > 0),
      currentOpacity = $dimmer.css('opacity')
    ;
    if(!dimmerExists) {
      $dimmer = $('<div/>')
        .attr('id','dimmer')
        .html('<div class="content"></div>')
      ;
      $context
        .append($dimmer)
      ;
    }
    if(currentOpacity != settings.opacity) {
      $dimmer
        .one('click', function() {
          settings.unDim();
          $.unDimScreen();
        })
      ;
      if(settings.duration == 0) {
        $dimmer
          .css({
            visibility : 'visible'
          })
          .find('.content')
            .css({
              opacity    : settings.opacity,
              visibility : 'visible'
            })
        ;
      }
      else {
        $dimmer
          .css({
            visibility : 'visible'
          })
          .find('.content')
            .css({
              opacity    : 0,
              visibility : 'visible'
            })
            .fadeTo(settings.duration, settings.opacity, settings.dim)
        ;
      }
    }
    return this;
  };
  $.unDimScreen = function(parameters) {
    var
      settings     = (typeof parameters == 'function')
        ? $.extend({}, $.fn.modal.settings, { unDim: parameters })
        : $.extend({}, $.fn.modal.settings, parameters),

      $context     = $(settings.context),
      $dimmer      = $context.children(settings.selector.dimmer),
      dimmerExists = ($dimmer.size() > 0)
    ;
    if(dimmerExists) {
      // callback before unDim
      settings.unDim();
      if(settings.duration == 0) {
        $dimmer
          .css({
            visibility: 'hidden'
          })
          .remove()
        ;
      }
      else {
        $dimmer
          .find('.content')
            .fadeTo(settings.duration, 0, function(){
              $dimmer.remove();
            })
        ;
      }
    }
    return this;
  };

  $.fn.modal = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.modal.settings, parameters),
      moduleArguments = arguments || false
    ;

    $(this)
      .each(function() {
        var
          $modal       = $(this),
          $closeButton = $modal.find(settings.selector.closeButton),
          $dimmer      = $(settings.context).find(settings.selector.dimmer),
          $modals      = $(settings.context).children(settings.selector.modal),
          $otherModals = $modals.not($modal),

          instance     = $modal.data('module'),
          module
        ;

        module  = {

          initialize: function() {
            // attach events
            $modal
              .on('modalShow', module.show)
              .on('modalHide', module.hide)
              .data('module', module)
            ;
          },

          show: function() {
            var
              modalHeight   = $modal.outerHeight(),
              windowHeight  = $(window).height(),

              cantFit       = (modalHeight > windowHeight),
              topCentering  = (cantFit)
                ? '0'
                : '50%',
              offsetTop     = (cantFit)
                ? (windowHeight / 8)
                : -( (modalHeight  - settings.closeSpacing) / 2),

              finalPosition = ($modal.css('position') == 'absolute')
                ? offsetTop + $(window).prop('pageYOffset')
                : offsetTop,
              startPosition = finalPosition + settings.animationOffset
            ;
            // set top margin as offset
            if($.fn.popIn !== undefined) {
              $modal
                .css({
                  display   : 'block',
                  opacity   : 0,
                  top: topCentering,
                  marginTop : finalPosition + 'px'
                })
                .popIn(settings.duration)
              ;
            }
            else {
              $modal
                .css({
                  display   : 'block',
                  opacity   : 0,
                  top: topCentering,
                  marginTop : startPosition + 'px'
                })
                .animate({
                  opacity   : 1,
                  marginTop : finalPosition + 'px'
                }, (settings.duration + 300), settings.easing)
              ;
            }
            if( $otherModals.is(':visible') ) {
              $otherModals
                .filter(':visible')
                  .hide()
              ;
            }
            $.dimScreen({
              context  : settings.context,
              duration : settings.duration,
              dim      : function() {
                $(document)
                  .on('keyup.modal', function(event) {
                    var
                      keyCode   = event.which,
                      escapeKey = 27
                    ;
                    switch(keyCode) {
                      case escapeKey:
                        $modal.trigger('modalHide');
                        event.preventDefault();
                        break;
                    }
                  })
                ;
                $closeButton
                  .one('click', function() {
                    $modal.trigger('modalHide');
                  })
                ;
                settings.dim();
              },
              unDim: function() {
                $modal.trigger('modalHide');
                $closeButton.unbind('click');
              }
            });
          },

          hide: function() {
            // remove keyboard detection
            $(document)
              .off('keyup.modal')
            ;
            $.unDimScreen({
              unDim: function() {
                $modal
                  .fadeOut(300)
                ;
                settings.unDim();
              }
            });
          },

          debug: function(message) {
            if(settings.debug) {
              console.info(settings.moduleName + ': ' + message);
            }
          },
          error: function(errorMessage) {
            console.warn(settings.moduleName + ': ' + errorMessage);
          },

          invoke: function(methodName, context, methodArguments) {
            var
              methodArguments = methodArguments || Array.prototype.slice.call( arguments, 2 ),
              method
            ;
            if(typeof methodName == 'string' && instance !== undefined) {
              methodName = methodName.split('.');
              $.each(methodName, function(index, name) {
                if( $.isPlainObject( instance[name] ) ) {
                  instance = instance[name];
                  return true;
                }
                else if( $.isFunction( instance[name] ) ) {
                  method = instance[name];
                  return true;
                }
                module.error(settings.errors.method);
                return false;
              });
            }
            return ( $.isFunction( method ) )
              ? method.apply(context, methodArguments)
              : false
            ;
          }
        };

        if(instance !== undefined && moduleArguments) {
          // simpler than invoke realizing to invoke itself (and losing scope due prototype.call()
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // initializing
        module.initialize();

      })
    ;
    return $(this);
  };

  $.fn.modal.settings = {

    moduleName      : 'Modal',
    debug           : false,

    errors: {
      method : 'The method you called is not defined'
    },

    dim             : function(){},
    unDim           : function(){},
    hide            : function(){},
    show            : function(){},

    context         : 'body',
    opacity         : 0.8,

    closeSpacing    : 0,
    animationOffset : 15,

    duration        : 500,
    easing          : 'easeOutExpo',

    selector        : {
      dimmer      : '#dimmer',
      modal       : '.modal',
      closeButton : '.close'
    }
  };


})( jQuery, window , document );

/*  ******************************
  Module
  State
  Change text based on state context
  Hover/Pressed/Active/Inactive
  Author: Jack Lukic
  Last revision: May 2012

  State text module is used to apply text to a given node
  depending on the elements "state"

  State is either defined as "active" or "inactive" depending
  on the returned value of a test function

  Usage:

  $button
    .state({
      states: {
        active: true
      },
      text: {
        inactive: 'Follow',
        active  : 'Following',
        enable  : 'Add',
        disable : 'Remove'
      }
    })
  ;

  "Follow", turns to "Add" on hover, then "Following" on active
  and finally "Remove" on active hover

  This plugin works in correlation to API module and will, by default,
  use deffered object accept/reject to determine state.

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.state = function(parameters) {
  var

    $allModules     = $(this),

    // make arguments available
    query           = arguments[0],
    passedArguments = [].slice.call(arguments, 1),
    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        $module       = $(this),

        settings      = $.extend(true, {}, $.fn.state.settings, parameters),

        selector      = $module.selector || '',
        element       = this,
        instance      = $module.data('module-' + settings.namespace),
        methodInvoked = (typeof query == 'string'),

        // shortcuts
        namespace     = settings.namespace,
        metadata      = settings.metadata,
        className     = settings.className,
        states        = settings.states,
        text          = settings.text,

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module for', element);

          // allow module to guess desired state based on element
          if(settings.automatic) {
            module.add.defaults();
          }

          // bind events with delegated events
          if(settings.context && selector !== '') {
            if( module.allows('hover') ) {
              $(element, settings.context)
                .on(selector, 'mouseenter.' + namespace, module.hover.enable)
                .on(selector, 'mouseleave.' + namespace, module.hover.disable)
              ;
            }
            if( module.allows('pressed') ) {
              $(element, settings.context)
                .on(selector, 'mousedown.' + namespace, module.pressed.enable)
                .on(selector, 'mouseup.'   + namespace, module.pressed.disable)
              ;
            }
            if( module.allows('focus') ) {
              $(element, settings.context)
                .on(selector, 'focus.' + namespace, module.focus.enable)
                .on(selector, 'blur.'  + namespace, module.focus.disable)
              ;
            }
            $(settings.context)
              .on(selector, 'mouseover.' + namespace, module.text.change)
              .on(selector, 'mouseout.'  + namespace, module.text.reset)
              .on(selector, 'click.'     + namespace, module.toggle)
            ;

          }
          else {
            if( module.allows('hover') ) {
              $module
                .on('mouseenter.' + namespace, module.hover.enable)
                .on('mouseleave.' + namespace, module.hover.disable)
              ;
            }
            if( module.allows('pressed') ) {
              $module
                .on('mousedown.' + namespace, module.pressed.enable)
                .on('mouseup.'   + namespace, module.pressed.disable)
              ;
            }
            if( module.allows('focus') ) {
              $module
                .on('focus.' + namespace, module.focus.enable)
                .on('blur.'  + namespace, module.focus.disable)
              ;
            }
            $module
              .on('mouseover.' + namespace, module.text.change)
              .on('mouseout.'  + namespace, module.text.reset)
              .on('click.'     + namespace, module.toggle)
            ;
          }
          $module
            .data('module-' + namespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .off('.' + namespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache for', element);
          $module = $(element);
        },

        add: {
          defaults: function() {
            var
              userStates = parameters && $.isPlainObject(parameters.states)
                ? parameters.states
                : {}
            ;
            $.each(settings.defaults, function(type, typeStates) {
              if( module.is[type] !== undefined && module.is[type]() ) {
                module.verbose('Adding default states for detected type:', type, element);
                $.extend(settings.states, typeStates, userStates);
              }
            });
          }
        },

        is: {

          active: function() {
            return $module.hasClass(className.active);
          },
          loading: function() {
            return $module.hasClass(className.loading);
          },
          inactive: function() {
            return !( $module.hasClass(className.active) );
          },

          enabled: function() {
            return !( $module.is(settings.filter.active) );
          },
          disabled: function() {
            return ( $module.is(settings.filter.active) );
          },
          textEnabled: function() {
            return !( $module.is(settings.filter.text) );
          },

          // definitions for automatic type detection
          button: function() {
            return $module.is('.button:not(a, .submit)');
          },
          input: function() {
            return $module.is('input');
          }
        },

        allows: function(state) {
          return states[state] || false;
        },
        enable: function(state) {
          if(module.allows(state)) {
            $module.addClass( className[state] );
          }
        },
        disable: function(state) {
          if(module.allows(state)) {
            $module.removeClass( className[state] );
          }
        },
        textFor: function(state) {
          return text[state] || false;
        },

        focus : {
          enable: function() {
            $module.addClass(className.focus);
          },
          disable: function() {
            $module.removeClass(className.focus);
          }
        },

        hover : {
          enable: function() {
            $module.addClass(className.hover);
          },
          disable: function() {
            $module.removeClass(className.hover);
          }
        },

        pressed : {
          enable: function() {
            $module
              .addClass(className.pressed)
              .one('mouseleave', module.pressed.disable)
            ;
          },
          disable: function() {
            $module.removeClass(className.pressed);
          }
        },

        // determines method for state activation
        toggle: function() {
          var
            apiRequest = $module.data(metadata.promise)
          ;
          if( module.allows('active') && module.is.enabled() ) {
            module.refresh();
            if(apiRequest !== undefined) {
              module.listenTo(apiRequest);
            }
            else {
              module.change();
            }
          }
        },

        listenTo: function(apiRequest) {
          module.debug('API request detected, waiting for state signal');
          if(apiRequest) {
            if(text.loading) {
              module.text.update(text.loading);
            }
            $.when(apiRequest)
              .then(function() {
                if(apiRequest.state() == 'resolved') {
                  module.debug('API request succeeded');
                  settings.activateTest   = function(){ return true; };
                  settings.deactivateTest = function(){ return true; };
                }
                else {
                  module.debug('API request failed');
                  settings.activateTest   = function(){ return false; };
                  settings.deactivateTest = function(){ return false; };
                }
                module.change();
              })
            ;
          }
          // xhr exists but set to false, beforeSend killed the xhr
          else {
            settings.activateTest   = function(){ return false; };
            settings.deactivateTest = function(){ return false; };
          }
        },

        // checks whether active/inactive state can be given
        change: function() {
          module.debug('Determining state change direction');
          // inactive to active change
          if( module.is.inactive() ) {
            module.activate();
          }
          else {
            module.deactivate();
          }
          if(settings.sync) {
            module.sync();
          }
          settings.onChange();
        },

        activate: function() {
          if( $.proxy(settings.activateTest, element)() ) {
            module.debug('Setting state to active');
            $module
              .addClass(className.active)
            ;
            module.text.update(text.active);
          }
        },

        deactivate: function() {
          if($.proxy(settings.deactivateTest, element)() ) {
            module.debug('Setting state to inactive');
            $module
              .removeClass(className.active)
            ;
            module.text.update(text.inactive);
          }
        },

        sync: function() {
          module.verbose('Syncing other buttons to current state');
          if( module.is.active() ) {
            $allModules
              .not($module)
                .state('activate');
          }
          else {
            $allModules
              .not($module)
                .state('deactivate')
            ;
          }
        },

        text: {

          // finds text node to update
          get: function() {
            return (settings.textFilter)
              ? $module.find(settings.textFilter).text()
              : $module.html()
            ;
          },

          change: function() {
            if( module.is.textEnabled() ) {
              if( module.is.active() ) {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.text.update(text.hover);
                }
                else if(text.disable) {
                  module.verbose('Changing text to disable text', text.disable);
                  module.text.update(text.disable);
                }
                else {
                  module.verbose('Changing text to active text', text.active);
                  module.text.update(text.active);
                }
              }
              else {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.text.update(text.hover);
                }
                else if(text.enable){
                  module.verbose('Changing text to enable text', text.enable);
                  module.text.update(text.enable);
                }
                else {
                  module.verbose('Changing text to inactive text', text.inactive);
                  module.text.update(text.inactive);
                }
              }
            }
          },

          // on mouseout sets text to previous value
          reset : function() {
            var
              activeText   = text.active   || $module.data(metadata.storedText),
              inactiveText = text.inactive || $module.data(metadata.storedText)
            ;
            if( module.is.textEnabled() ) {
              if( module.is.active() && activeText) {
                module.verbose('Resetting active text', activeText);
                module.text.update(activeText);
              }
              else if(inactiveText) {
                module.verbose('Resetting inactive text', activeText);
                module.text.update(inactiveText);
              }
            }
          },

          update: function(text) {
            var
              currentText = module.text.get()
            ;
            if(text && text !== currentText) {
              module.debug('Updating text to', text);
              if(settings.textFilter) {
                $module
                  .data(metadata.storedText, text)
                  .find(settings.textFilter)
                    .text(text)
                ;
              }
              else {
                $module
                  .data(metadata.storedText, text)
                  .html(text)
                ;
              }
            }
          }
        },
        /* standard module */
        setting: function(name, value) {
          if(value === undefined) {
            return settings[name];
          }
          settings[name] = value;
        },
        verbose: function() {
          if(settings.verbose) {
            module.debug.apply(this, arguments);
          }
        },
        debug: function() {
          var
            output    = [],
            message   = settings.moduleName + ': ' + arguments[0],
            variables = [].slice.call( arguments, 1 ),
            log       = console.info || console.log || function(){}
          ;
          log = Function.prototype.bind.call(log, console);
          if(settings.debug) {
            output.push(message);
            log.apply(console, output.concat(variables) );
          }
        },
        error: function() {
          var
            output       = [],
            errorMessage = settings.moduleName + ': ' + arguments[0],
            variables    = [].slice.call( arguments, 1 ),
            log          = console.warn || console.log || function(){}
          ;
          log = Function.prototype.bind.call(log, console);
          if(settings.debug) {
            output.push(errorMessage);
            output.concat(variables);
            log.apply(console, output.concat(variables) );
          }
        },
        invoke: function(query, context, passedArguments) {
          var
            maxDepth,
            found
          ;
          passedArguments = passedArguments || [].slice.call( arguments, 2 );
          if(typeof query == 'string' && instance !== undefined) {
            query    = query.split('.');
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( instance[value] ) && (depth != maxDepth) ) {
                instance = instance[value];
                return true;
              }
              else if( instance[value] !== undefined ) {
                found = instance[value];
                return true;
              }
              module.error(settings.errors.method);
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            return found.apply(context, passedArguments);
          }
          // return retrieved variable or chain
          return found;
        }
      };

      // check for invoking internal method
      if(methodInvoked) {
        invokedResponse = module.invoke(query, this, passedArguments);
      }
      // otherwise initialize
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  // chain or return queried method
  return (invokedResponse !== undefined)
    ? invokedResponse
    : this
  ;
};

$.fn.state.settings = {

  // module info
  moduleName : 'State Module',

  // debug output
  debug      : true,
  // verbose debug output
  verbose    : false,

  namespace  : 'state',

  // callback occurs on state change
  onChange: function() {},

  // state test functions
  activateTest   : function() { return true; },
  deactivateTest : function() { return true; },

  // whether to automatically map default states
  automatic: true,
  // activate / deactivate changes all elements instantiated at same time
  sync: false,

  // selector filter
  filter     : {
    text   : '.loading, .actived',
    active : '.disabled'
  },

  textFilter : false,
  context    : false,
  // errors
  errors: {
    method : 'The method you called is not defined.'
  },

  // metadata
  metadata: {
    promise    : 'promise',
    storedText : 'stored-text'
  },

  // change class on state
  className: {
    focus   : 'focus',
    hover   : 'hover',
    pressed : 'down',
    active  : 'active',
    loading : 'loading'
  },

  defaults : {
    input: {
      hover   : true,
      focus   : true,
      pressed : true,
      loading : false,
      active  : false
    },
    button: {
      hover   : true,
      focus   : false,
      pressed : true,
      active  : false,
      loading : true
    }
  },

  states     : {
    hover   : true,
    focus   : true,
    pressed : true,
    loading : false,
    active  : false
  },

  text     : {
    hover    : false,
    active   : false,
    inactive : false,
    enable   : false,
    disable  : false
  }

};



})( jQuery, window , document );

/*  ******************************
  Module - Tooltip / Popup
  Author: Jack Lukic
  Notes: First Commit Sep 07, 2012
******************************  */

;(function ($, window, document, undefined) {

  $.fn.popup = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.popup.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function() {
        var
          $module       = $(this),
          $offsetParent = $module.offsetParent(),
          // allow popup content to be either inside module or beside
          $popup        = $module.next(settings.selector.popup),

          timer,

          instance      = $module.data('module'),
          className     = settings.className,
          module
        ;

        module = {

          // binds events
          initialize: function() {
            module.debug('Initializing module');
            if(settings.event == 'hover') {
              $module
                .on('mouseenter.' + settings.namespace, module.event.mouseenter)
                .on('mouseleave.' + settings.namespace, module.event.mouseleave)
              ;
            }
            else {
              $module
                .on(settings.event + '.' + settings.namespace, module.event[settings.event])
              ;
            }
            $module
              .data('module', module)
            ;
          },

          refresh: function() {
            $popup        = $module.next(settings.selector.popup);
            $offsetParent = $module.offsetParent();
          },

          destroy: function() {
            $module
              .off('.' + settings.namespace)
            ;
          },

          event: {
            mouseenter:  function(event) {
              var element = this;
              timer = setTimeout(function() {
                $.proxy(module.toggle, element)();
                if( $(element).hasClass(className.active) ) {
                  event.stopPropagation();
                }
              }, settings.delay);
            },
            mouseleave:  function(event) {
              clearTimeout(timer);
              if( $module.is(':visible') ) {
                module.hide();
              }
            },
            click: function(event) {
              $.proxy(module.toggle, this)();
              if( $(this).hasClass(className.active) ) {
                event.stopPropagation();
              }
            }
          },

          // generates popup html from metadata
          create: function() {
            module.debug('Creating pop-up content');
            var
              html    = $module.data(settings.metadata.html)    || settings.html,
              title   = $module.data(settings.metadata.title)   || settings.title,
              content = $module.data(settings.metadata.content) || $module.attr('title') || settings.content
            ;
            if(html || content || title) {
              if(!html) {
                html = settings.template({
                  title   : title,
                  content : content
                });
              }
              $('<div/>')
                .addClass(className.popup)
                .html(html)
                .insertAfter($module)
              ;
            }
            else {
              module.error(settings.errors.content);
            }
          },

          // determines popup state
          toggle: function() {
            $module = $(this);
            module.debug('Toggling pop-up');
            // refresh state of module
            module.refresh();
            if($popup.size() == 0) {
              module.create();
              module.refresh();
            }
            if( !$module.hasClass(className.active) ) {
              module.position();
              module.show();
            }
            else {
              module.hide();
            }
          },

          position: function() {
            var
              offset       = $module.position(),
              windowWidth  = $(window).width(),
              windowHeight = $(window).height(),
              offsetWidth  = $offsetParent.outerWidth(),
              offsetHeight = $offsetParent.outerHeight(),
              width        = $module.outerWidth(),
              height       = $module.outerHeight(),
              popupWidth   = $popup.outerWidth(),
              popupHeight  = $popup.outerHeight(),

              position
            ;
            switch(settings.position) {
              case 'top left':
                position = {
                  top    : 'auto',
                  bottom :  offsetHeight - offset.top + settings.popupOffset,
                  left   : offset.left - settings.arrowOffset
                };
              break;
              case 'top center':
                position = {
                  top    : 'auto',
                  bottom :  offsetHeight - offset.top + settings.popupOffset,
                  left   : offset.left + (width / 2) - (popupWidth / 2)
                };
              break;
              case 'top right':
                position = {
                  top    : 'auto',
                  bottom :  offsetHeight - offset.top + settings.popupOffset,
                  left   : offset.left + width - popupWidth + settings.arrowOffset
                };
              break;
              case 'left center':
                position = {
                  top    :  offset.top + (height / 2) - (popupHeight / 2),
                  right  : offsetWidth - offset.left + settings.popupOffset,
                  bottom : 'auto',
                  left   : 'auto'
                };
              break;
              case 'right center':
                position = {
                  top    :  offset.top + (height / 2) - (popupHeight / 2),
                  left   : offset.left + width + settings.popupOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                position = {
                  top    :  offset.top + height + settings.popupOffset,
                  left   : offset.left + settings.arrowOffset,
                  bottom : 'auto'
                };
              break;
              case 'bottom center':
                position = {
                  top    :  offset.top + height + settings.popupOffset,
                  left   : offset.left + (width / 2) - (popupWidth / 2),
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                position = {
                  top    :  offset.top + height + settings.popupOffset,
                  left   : offset.left + width - popupWidth + settings.arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
            }
            $.extend(position, {
              width: $popup.width()
            });
            $popup
              .addClass(settings.position)
              .css(position)
            ;
          },

          show: function() {
            module.debug('Showing pop-up');
            $(settings.selector.popup)
              .filter(':visible')
                .stop()
                .fadeOut(200)
                .prev($module)
                  .removeClass(className.active)
            ;
            $module
              .addClass(className.active)
            ;
            if(settings.animation == 'pop' && $.fn.popIn !== undefined) {
              $popup
                .stop()
                .popIn(settings.duration, settings.easing)
              ;
            }
            else {
              $popup
                .stop()
                .fadeIn(settings.duration, settings.easing)
              ;
            }
            if(settings.event == 'click' && settings.clicktoClose) {
              module.debug('Binding click-away');
              $(document)
                .on('click.' + settings.namespace, module.graceful.hide)
              ;
            }
            $.proxy(settings.onShow, $popup)();
          },

          hide: function() {
            module.debug('Hiding pop-up');
            $module
              .removeClass(className.active)
            ;
            if($popup.is(':visible') ) {
              if(settings.animation == 'pop' && $.fn.popOut !== undefined) {
                $popup
                  .stop()
                  .popOut(settings.duration, settings.easing, function() {
                    $popup.hide();
                  })
                ;
              }
              else {
                $popup
                  .stop()
                  .fadeOut(settings.duration, settings.easing)
                ;
              }
            }
            if(settings.event == 'click' && settings.clicktoClose) {
              $(document)
                .off('click.popup')
              ;
            }
            $.proxy(settings.onHide, $popup)();
          },

          graceful: {

            hide: function(event) {
              if( $(event.target).closest(settings.selector.popup).size() == 0) {
                module.hide();
              }
            }

          },

          debug: function(message) {
            if(settings.debug) {
              console.info(settings.moduleName + ': ' + message);
            }
          },
          error: function(errorMessage) {
            console.warn(settings.moduleName + ': ' + errorMessage);
          },

          // allows for dot notation method calls
          invoke: function(methodName, context, methodArguments) {
            var
              methodArguments = methodArguments || Array.prototype.slice.call( arguments, 2 ),
              method
            ;
            if(typeof methodName == 'string' && instance !== undefined) {
              methodName = methodName.split('.');
              $.each(methodName, function(index, name) {
                if( $.isPlainObject( instance[name] ) ) {
                  instance = instance[name];
                  return true;
                }
                else if( $.isFunction( instance[name] ) ) {
                  method = instance[name];
                  return true;
                }
                module.error(settings.errors.method);
                return false;
              });
            }
            return ( $.isFunction( method ) )
              ? method.apply(context, methodArguments)
              : false
            ;
          }

        };

        if(instance !== undefined && moduleArguments) {
          // simpler than invoke realizing to invoke itself (and losing scope due prototype.call()
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // initializing
        module.initialize();
      })
    ;

    return this;
  };

  $.fn.popup.settings = {

    moduleName     : 'Pop-up Module',
    debug          : false,
    namespace      : 'popup',

    onShow         : function(){},
    onHide         : function(){},

    content        : false,
    html           : false,
    title          : false,

    position       : 'top center',
    delay          : 0,

    duration       : 150,
    easing         : 'easeOutQuint',
    animation      : 'pop',

    errors: {
      content : 'Warning: Your popup has no content specified',
      method  : 'The method you called is not defined.'
    },

    popupOffset  : 2,
    arrowOffset  : 11,

    event        : 'hover',
    clicktoClose : true,

    metadata: {
      content : 'content',
      html    : 'html',
      title   : 'title'
    },

    className   : {
      popup   : 'ui popup',
      active  : 'active',
      loading : 'loading'
    },

    selector    : {
      popup    : '.ui.popup'
    },

    template: function(data) {
      var html = '';
      if(typeof data !== undefined) {
        if(typeof data.title !== undefined && data.title) {
          html += '<h2>' + data.title + '</h2>';
        }
        if(typeof data.content !== undefined && data.content) {
          html += '<div class="content">' + data.content + '</div>';
        }
      }
      return html;
    }

  };

})( jQuery, window , document );
/*  ******************************
  Module - Tooltip / Popup
  Author: Jack Lukic
  Notes: First Commit Sep 07, 2012
******************************  */

;(function ($, window, document, undefined) {

  $.fn.popup = function(parameters) {
    var
      settings        = $.extend(true, {}, $.fn.popup.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    $(this)
      .each(function() {
        var
          $module       = $(this),
          $offsetParent = $module.offsetParent(),
          // allow popup content to be either inside module or beside
          $popup        = $module.next(settings.selector.popup),

          timer,

          instance      = $module.data('module'),
          className     = settings.className,
          module
        ;

        module = {

          // binds events
          initialize: function() {
            module.debug('Initializing module');
            if(settings.event == 'hover') {
              $module
                .on('mouseenter.' + settings.namespace, module.event.mouseenter)
                .on('mouseleave.' + settings.namespace, module.event.mouseleave)
              ;
            }
            else {
              $module
                .on(settings.event + '.' + settings.namespace, module.event[settings.event])
              ;
            }
            $module
              .data('module', module)
            ;
          },

          refresh: function() {
            $popup        = $module.next(settings.selector.popup);
            $offsetParent = $module.offsetParent();
          },

          destroy: function() {
            $module
              .off('.' + settings.namespace)
            ;
          },

          event: {
            mouseenter:  function(event) {
              var element = this;
              timer = setTimeout(function() {
                $.proxy(module.toggle, element)();
                if( $(element).hasClass(className.active) ) {
                  event.stopPropagation();
                }
              }, settings.delay);
            },
            mouseleave:  function(event) {
              clearTimeout(timer);
              if( $module.is(':visible') ) {
                module.hide();
              }
            },
            click: function(event) {
              $.proxy(module.toggle, this)();
              if( $(this).hasClass(className.active) ) {
                event.stopPropagation();
              }
            }
          },

          // generates popup html from metadata
          create: function() {
            module.debug('Creating pop-up content');
            var
              html    = $module.data(settings.metadata.html)    || settings.html,
              title   = $module.data(settings.metadata.title)   || settings.title,
              content = $module.data(settings.metadata.content) || $module.attr('title') || settings.content
            ;
            if(html || content || title) {
              if(!html) {
                html = settings.template({
                  title   : title,
                  content : content
                });
              }
              $('<div/>')
                .addClass(className.popup)
                .html(html)
                .insertAfter($module)
              ;
            }
            else {
              module.error(settings.errors.content);
            }
          },

          // determines popup state
          toggle: function() {
            $module = $(this);
            module.debug('Toggling pop-up');
            // refresh state of module
            module.refresh();
            if($popup.size() == 0) {
              module.create();
              module.refresh();
            }
            if( !$module.hasClass(className.active) ) {
              module.position();
              module.show();
            }
            else {
              module.hide();
            }
          },

          position: function() {
            var
              offset       = $module.position(),
              windowWidth  = $(window).width(),
              windowHeight = $(window).height(),
              offsetWidth  = $offsetParent.outerWidth(),
              offsetHeight = $offsetParent.outerHeight(),
              width        = $module.outerWidth(),
              height       = $module.outerHeight(),
              popupWidth   = $popup.outerWidth(),
              popupHeight  = $popup.outerHeight(),

              position
            ;
            switch(settings.position) {
              case 'top left':
                position = {
                  top    : 'auto',
                  bottom :  offsetHeight - offset.top + settings.popupOffset,
                  left   : offset.left - settings.arrowOffset
                };
              break;
              case 'top center':
                position = {
                  top    : 'auto',
                  bottom :  offsetHeight - offset.top + settings.popupOffset,
                  left   : offset.left + (width / 2) - (popupWidth / 2)
                };
              break;
              case 'top right':
                position = {
                  top    : 'auto',
                  bottom :  offsetHeight - offset.top + settings.popupOffset,
                  left   : offset.left + width - popupWidth + settings.arrowOffset
                };
              break;
              case 'left center':
                position = {
                  top    :  offset.top + (height / 2) - (popupHeight / 2),
                  right  : offsetWidth - offset.left + settings.popupOffset,
                  bottom : 'auto',
                  left   : 'auto'
                };
              break;
              case 'right center':
                position = {
                  top    :  offset.top + (height / 2) - (popupHeight / 2),
                  left   : offset.left + width + settings.popupOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                position = {
                  top    :  offset.top + height + settings.popupOffset,
                  left   : offset.left + settings.arrowOffset,
                  bottom : 'auto'
                };
              break;
              case 'bottom center':
                position = {
                  top    :  offset.top + height + settings.popupOffset,
                  left   : offset.left + (width / 2) - (popupWidth / 2),
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                position = {
                  top    :  offset.top + height + settings.popupOffset,
                  left   : offset.left + width - popupWidth + settings.arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
            }
            $.extend(position, {
              width: $popup.width()
            });
            $popup
              .addClass(settings.position)
              .css(position)
            ;
          },

          show: function() {
            module.debug('Showing pop-up');
            $(settings.selector.popup)
              .filter(':visible')
                .stop()
                .fadeOut(200)
                .prev($module)
                  .removeClass(className.active)
            ;
            $module
              .addClass(className.active)
            ;
            if(settings.animation == 'pop' && $.fn.popIn !== undefined) {
              $popup
                .stop()
                .popIn(settings.duration, settings.easing)
              ;
            }
            else {
              $popup
                .stop()
                .fadeIn(settings.duration, settings.easing)
              ;
            }
            if(settings.event == 'click' && settings.clicktoClose) {
              module.debug('Binding click-away');
              $(document)
                .on('click.' + settings.namespace, module.graceful.hide)
              ;
            }
            $.proxy(settings.onShow, $popup)();
          },

          hide: function() {
            module.debug('Hiding pop-up');
            $module
              .removeClass(className.active)
            ;
            if($popup.is(':visible') ) {
              if(settings.animation == 'pop' && $.fn.popOut !== undefined) {
                $popup
                  .stop()
                  .popOut(settings.duration, settings.easing, function() {
                    $popup.hide();
                  })
                ;
              }
              else {
                $popup
                  .stop()
                  .fadeOut(settings.duration, settings.easing)
                ;
              }
            }
            if(settings.event == 'click' && settings.clicktoClose) {
              $(document)
                .off('click.popup')
              ;
            }
            $.proxy(settings.onHide, $popup)();
          },

          graceful: {

            hide: function(event) {
              if( $(event.target).closest(settings.selector.popup).size() == 0) {
                module.hide();
              }
            }

          },

          debug: function(message) {
            if(settings.debug) {
              console.info(settings.moduleName + ': ' + message);
            }
          },
          error: function(errorMessage) {
            console.warn(settings.moduleName + ': ' + errorMessage);
          },

          // allows for dot notation method calls
          invoke: function(methodName, context, methodArguments) {
            var
              methodArguments = methodArguments || Array.prototype.slice.call( arguments, 2 ),
              method
            ;
            if(typeof methodName == 'string' && instance !== undefined) {
              methodName = methodName.split('.');
              $.each(methodName, function(index, name) {
                if( $.isPlainObject( instance[name] ) ) {
                  instance = instance[name];
                  return true;
                }
                else if( $.isFunction( instance[name] ) ) {
                  method = instance[name];
                  return true;
                }
                module.error(settings.errors.method);
                return false;
              });
            }
            return ( $.isFunction( method ) )
              ? method.apply(context, methodArguments)
              : false
            ;
          }

        };

        if(instance !== undefined && moduleArguments) {
          // simpler than invoke realizing to invoke itself (and losing scope due prototype.call()
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // initializing
        module.initialize();
      })
    ;

    return this;
  };

  $.fn.popup.settings = {

    moduleName     : 'Pop-up Module',
    debug          : false,
    namespace      : 'popup',

    onShow         : function(){},
    onHide         : function(){},

    content        : false,
    html           : false,
    title          : false,

    position       : 'top center',
    delay          : 0,

    duration       : 250,
    easing         : 'easeOutQuint',
    animation      : 'pop',

    errors: {
      content : 'Warning: Your popup has no content specified',
      method  : 'The method you called is not defined.'
    },

    popupOffset  : 2,
    arrowOffset  : 11,

    event        : 'hover',
    clicktoClose : true,

    metadata: {
      content : 'content',
      html    : 'html',
      title   : 'title'
    },

    className   : {
      popup   : 'ui popup',
      active  : 'active',
      loading : 'loading'
    },

    selector    : {
      popup    : '.ui.popup'
    },

    template: function(data) {
      var html = '';
      if(typeof data !== undefined) {
        if(typeof data.title !== undefined && data.title) {
          html += '<h2>' + data.title + '</h2>';
        }
        if(typeof data.content !== undefined && data.content) {
          html += '<div class="content">' + data.content + '</div>';
        }
      }
      return html;
    }

  };

})( jQuery, window , document );


/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
});