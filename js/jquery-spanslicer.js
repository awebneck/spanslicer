(function ($) {
  $.fn.spanslicer = function (options) {
    var defaults = {
      numDivisions: 96,
      tickEvery: 4,
      ticks: true,
      ruler: true,
      spans: null
    };  
    var options = $.extend(defaults, options);
    return this.each(function () {
      var selectedIndex = 0;
      var nextOWidth = 0;
      var startPost = 0;
      var prevSpan = null;
      var nextSpan = null;
      var handleString = '<div class="handle"></div>';
      var updateInt = null;
      var handle = null;
      
      if (options.ruler) {
        var ruler = $('<div id="ss_ruler" style="position:relative;"></div>');
        $(this).before(ruler);
        buildRuler(ruler);
      }
      buildSpans();
      /*
      
      $('.ss_span').bind('click',selectSpan);
      enableDrag($('.ss_span_div:has(.ss_handle)'));
      */
      
      function buildRuler(ruler_selector) {
        var firstDivClass = (options.ticks) ? ' ss_tall' : '';
        ruler.append($('<div class="ss_mark_div'+firstDivClass+'"></div>'));
        for (var i = 0; i < options.numDivisions; i++) {
          ruler.append($('<div class="ss_ruler_block"><div class="ss_inner"></div></div>'));
          var divClass = (i % options.tickEvery == options.tickEvery-1 && options.ticks) ? ' ss_tall':''
          ruler.append($('<div class="ss_mark_div'+divClass+'"></div>'));
        }
      }
      
      function buildSpans() {
        if (!options.spans) {
          // if ($(this).children.length == 0) $(this).append('<div id="ss_spans"></div>');
          // $("#ss_spans").append($('<div class="span" style="left:1px;width:1053px;" data-width="96" data-offset="0"><div class="inner selected"></div></div>'));
        }
      }
      
    });
  };
})(jQuery);