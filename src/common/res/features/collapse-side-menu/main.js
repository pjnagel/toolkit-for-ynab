// jscs:disable disallowMultipleLineStrings
// jshint multistr: true

(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.collapseSideMenu = new function() { // jshint ignore:line

      this.collapseBtn = '<li> \
        <li class="ember-view navlink-collapse"> \
          <a href="#"> \
            <span class="ember-view flaticon stroke left-circle-4"> \
            </span>Collapse \
          </a> \
        </li> \
      </li>';

      this.originalSizes = {
        sidebarWidth:   $('.sidebar').width(),
        contentLeft:    $('.content').css('left'),
        headerLeft:     $('.budget-header, .accounts-header').css('left'),
        contentWidth:   $('.budget-content').css('width'),
        inspectorWidth: $('.budget-inspector').css('width'),
      };

      this.invoke = function() {
        ynabToolKit.collapseSideMenu.setupBtns();
      };

      this.observe = function(changedNodes) {
        if (changedNodes.has('pure-g layout user-logged-in')) {
          if ($('.nav-main').length) {
            ynabToolKit.collapseSideMenu.setupBtns();
          }
        }

        if (changedNodes.has('budget-header-flexbox') &&
            $('.collapsed-buttons').is(':visible')) {
          ynabToolKit.collapseSideMenu.setCollapsedSizes();
          ynabToolKit.collapseSideMenu.setActiveButton();
        }

        if (changedNodes.has('accounts-header-balances') &&
            $('.collapsed-buttons').is(':visible')) {
          ynabToolKit.collapseSideMenu.setCollapsedSizes();
          ynabToolKit.collapseSideMenu.setActiveButton();
        }

        if (changedNodes.has('nav-main')) {
          var numNavLinks = $('.nav-main').children().length;
          var collapseIndex = $('.nav-main').children()
            .index($('.navlink-collapse'));

          if (numNavLinks > (collapseIndex + 1)) {
            $('.navlink-collapse').remove();

            ynabToolKit.collapseSideMenu.setUpCollapseBtn();
            ynabToolKit.collapseSideMenu.setUpCollapsedButtons();
          }

        }
      };

      // Add buttons and handlers to screen
      this.setupBtns = function() {

        // Don't proceed if buttons already exist
        if ($('.navlink-collapse').is(':visible') ||
            $('.navbar-expand').is(':visible')) {
          return;
        }

        ynabToolKit.collapseSideMenu.setUpCollapseBtn();
        ynabToolKit.collapseSideMenu.setUpCollapsedButtons();
      };

      this.setUpCollapseBtn = function() {
        $('.nav-main').append(ynabToolKit.collapseSideMenu.collapseBtn);
        $('.navlink-collapse').on('click',
          ynabToolKit.collapseSideMenu.collapseMenu);
      };

      this.setUpCollapsedButtons = function() {
        var expandBtns = ynabToolKit.collapseSideMenu.getUnCollapseBtnGroup;

        if (!$('.collapsed-buttons').length) {
          $('.sidebar').prepend(expandBtns);
        } else {
          $('.collapsed-buttons').remove();
          $('.sidebar').prepend(expandBtns);
        }

        $('.collapsed-buttons').hide();
      };

      this.getUnCollapseBtnGroup = function() {
        var navChildren = $('.nav-main').children();
        var navChildrenLength = navChildren.length;

        var collapsedBtnContainer =
          $('<div>', {
            'class': 'collapsed-buttons'
          });

        for (var i = 0; i < navChildrenLength; i++) {
          var child = navChildren[i];

          // If this is the collapse button, skip
          if (child.className.indexOf('navlink-collapse') > -1) continue;

          var emberAction = $(child).find('a').data('ember-action');
          var span = $(child).find('span')[0];

          // Don't process if not actually a button
          if (!span) continue;

          var btnClasses = span.className;
          var button = $('<button>');
          button.addClass(btnClasses);
          button.addClass('button button-prefs');

          // Create YNAB Buttons
          if (emberAction) {
            var link = $('<a>');
            link.attr('href','#');
            link.attr('data-ember-action',emberAction);
            link.html(button);

            // Set proper class so the active styling can be applued
            if (btnClasses.indexOf('mail-1') > -1) {
              button.addClass('collapsed-budget');
            } else if (btnClasses.indexOf('government-1') > -1) {
              button.addClass('collapsed-account');
            }

            collapsedBtnContainer.append(link);
          } else { // Create custom buttons
            var classes = /.*(navlink-\w*)/g.exec(child.className);
            if (classes.length > 0) {
              button.addClass(classes[1]);

              var ev = $._data(child, 'events');
              if (ev && ev.click) {
                $('body').on('click', '.' + classes[1], ev.click[0].handler);
              }
            }

            collapsedBtnContainer.append(button);
          }
        }

        // Add uncollapse button
        var collapseBtn = $('<button>');
        collapseBtn.addClass('button button-prefs flaticon stroke \
          right-circle-4 navbar-expand');

        collapsedBtnContainer.append(collapseBtn);
        $('body').on('click', '.navbar-expand', function() {
          ynabToolKit.collapseSideMenu
          .expandMenu(ynabToolKit.collapseSideMenu.originalSizes);
        });

        return collapsedBtnContainer;
      };

      // Handle clicking expand button. Puts things back to original sizes
      this.expandMenu = function(originalSizes) {
        $('.collapsed-buttons').hide();
        $('.sidebar > .ember-view').fadeIn();
        $('.sidebar').animate({width: originalSizes.sidebarWidth});
        $('.content').animate({left: originalSizes.contentLeft});
        $('.budget-header').animate({left: originalSizes.headerLeft});
        $('.budget-content').animate({width: originalSizes.contentWidth},
          400, 'swing', function() {
          // Need to remove width after animation completion
          $('.budget-content').removeAttr('style');
        });
        $('.budget-inspector').animate({width: originalSizes.inspectorWidth});
      };

      // Handle clicking the collapse button
      this.collapseMenu = function() {
        ynabToolKit.collapseSideMenu.setActiveButton();
        $('.sidebar > .ember-view').hide();
        $('.collapsed-buttons').fadeIn();
        ynabToolKit.collapseSideMenu.setCollapsedSizes();
      };

      // Set collapsed sizes
      this.setCollapsedSizes = function() {
        $('.sidebar').animate({width: '40px'});
        $('.content').animate({left: '40px'}, 400, 'swing', function() {
          // Need to remove width after animation completion
          $('.ynab-grid-header').removeAttr('style');
        });

        $('.budget-header').animate({left: '40px'});
        $('.budget-content').animate({width: '73%'});
        $('.budget-inspector').animate({width: '27%'});
      };

      // Add the active style to correct button
      this.setActiveButton = function() {
        ynabToolKit.collapseSideMenu.deactivateCollapsedActive();
        if ($('.accounts-toolbar').length) {
          $('.collapsed-account').addClass('collapsed-active');
        }

        if ($('.budget-toolbar').length) {
          $('.collapsed-budget').addClass('collapsed-active');
        }
      };

      // Deactivate collapsed buttons
      this.deactivateCollapsedActive = function() {
        $('.collapsed-account').removeClass('collapsed-active');
        $('.collapsed-budget').removeClass('collapsed-active');
      };
    }();

    ynabToolKit.collapseSideMenu.invoke();

  } else {
    setTimeout(poll, 250);
  }
})();
