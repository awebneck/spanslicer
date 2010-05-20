(function ($) {
  $.spanslicer = {
    reference: function(selector) {
      var o = $(selector); 
      if(!o.size()) o = $("#" + obj);
      if(!o.size()) return null; 
      o = (o.is(".ss_spanslicer")) ? o.attr("id") : o.parents(".ss_spanslicer:eq(0)").attr("id"); 
      return ssSpanslicer.inst[o] || null;
    },
    splitSpan: function(selector) {
      if (selector.data) selector = selector.data.obj;
      _this = $.spanslicer.reference(selector);
      var spanToSplit = _this.element.find('.ss_span')[_this.selectedIndex];
      if ($(spanToSplit).attr('data-width') != '1') {
        var widthCount = Number($(spanToSplit).attr('data-width'));
        var offCount = Number($(spanToSplit).attr('data-offset'));
        var leftSpan = $('<div style="left:'+(offCount*_this.unitWidth+_this.options.tickWidth).toString()+'px;width:'+(Math.floor(widthCount/2)*_this.unitWidth - (2*_this.options.spanPadding+_this.options.tickWidth)).toString()+'px;padding:'+_this.options.spanPadding+'px;" class="ss_span" data-width="'+Math.floor(widthCount/2).toString()+'" data-offset="'+offCount.toString()+'"><div class="ss_inner ss_selected"></div></div>');
        var rightSpan = $('<div style="left:'+((offCount+Math.floor(widthCount/2))*_this.unitWidth+_this.options.tickWidth).toString()+'px;width:'+(((widthCount - Math.floor(widthCount/2))*_this.unitWidth) - (2*_this.options.spanPadding+_this.options.tickWidth)).toString()+'px;padding:'+_this.options.spanPadding+'px;" class="ss_span" data-width="'+(widthCount - Math.floor(widthCount/2)).toString()+'" data-offset="'+(offCount+Math.floor(widthCount/2)).toString()+'"><div class="ss_inner"></div></div>');
        var spanDiv = $('<div style="position:absolute;left:'+((offCount+Math.floor(widthCount/2))*_this.unitWidth).toString()+'px;width:'+_this.options.tickWidth+'px;" class="ss_span_div"></div>');
        if (Math.floor(widthCount/2) > 1 || (widthCount - Math.floor(widthCount/2)) > 1) {
          $(spanDiv).append($('<div class="ss_handle"></div>'));
          _this.enableDrag($(spanDiv));
        }
        rightSpan.bind('click',_this.selectSpan);
        leftSpan.bind('click',_this.selectSpan);
        $(spanToSplit).after(rightSpan).after(spanDiv).after(leftSpan);
        $(spanToSplit).remove();
        _this.stripHandles();
      }
    },
    deleteSpan: function() {
      if (selector.data) selector = selector.data.obj;
      _this = $.spanslicer.reference(selector);
      if (_this.element.find('.ss_span').length > 1) {
        var spanToDelete = $(_this.element.find('.ss_span')[_this.selectedIndex]);
        if (_this.selectedIndex == 0) {
          var nextSpan = $(_this.element.find('.ss_span')[_this.selectedIndex + 1]);
          nextSpan.css('left',spanToDelete.position().left);
          nextSpan.css('width',nextSpan.width()+spanToDelete.width()+2*_this.options.spanPadding+_this.options.tickWidth);
          nextSpan.attr('data-width',Number(nextSpan.attr('data-width'))+Number(spanToDelete.attr('data-width')));
          nextSpan.attr('data-offset',0);
          nextSpan.find('.ss_inner').addClass("ss_selected");
          var div = spanToDelete.next();
          div.dyndraggable("destroy");
          div.remove();
          spanToDelete.remove();
        } else {
          var prevSpan = $(_this.element.find('.ss_span')[_this.selectedIndex - 1]);
          prevSpan.css('width',prevSpan.width()+spanToDelete.width()+2*_this.options.spanPadding+_this.options.tickWidth);
          prevSpan.attr('data-width',Number(prevSpan.attr('data-width'))+Number(spanToDelete.attr('data-width')));
          prevSpan.find('.ss_inner').addClass("ss_selected");
          var div = spanToDelete.prev();
          div.dyndraggable("destroy");
          div.remove();
          spanToDelete.remove();
          _this.selectedIndex--;
        }
        _this.stripHandles();
      } else {
        alert("You can't delete your last timespan!");
      }
    }
  }
  
  $.fn.spanslicer = function (opts) {
    return this.each(function() {
      var defaults = {
        numDivisions: 96,
        tickEvery: 4,
        ticks: true,
        tickWidth: 1,
        ruler: true,
        spans: null,
        spanWidth: 8,
        spanPadding: 1
      };
      var conf = $.extend(defaults,opts);
      new ssSpanslicer().init(this, conf);
    });
  };
  
  function ssSpanslicer () {
    return {
      element: null,
      options: null,
      selectedIndex: 0,
      nextOWidth: 0,
      startPost: 0,
      prevSpan: null,
      nextSpan: null,
      updateInt: null,
      unitWidth: null,
      handle: null,
      ruler: null,
      _this: null,
      init: function(elem,conf) {
        _this = this;
        this.element = $(elem);
        this.options = conf;
        if (!this.options.ticks) this.options.tickWidth = 0;
        this.unitWidth = (this.options.spanWidth+2*this.options.spanPadding+this.options.tickWidth);
        if (this.options.ruler) {
          this.ruler = $('<div id="ss_ruler" style="position:relative;"></div>');
          this.element.before(this.ruler);
          this.buildRuler(this.ruler);
        }
        this.buildSpans();
        this.element.find('.ss_span').bind('click',this.selectSpan);
        this.element.addClass('ss_spanslicer');
        if (!this.element.attr('id')) this.element.attr('id','ss_spanslicer_'+ssSpanslicer.cntr.toString());
        var totalHeight = (this.ruler) ? this.ruler.height() : 0;
        var tempDiv = $('<div class="ss_span_div" style="width:'+this.options.tickWidth+'px;"><div class="ss_handle"></div></div>');
        this.element.append(tempDiv);
        var tempHandle = tempDiv.find('.ss_handle')
        totalHeight += tempHandle.position().top;
        totalHeight += tempHandle.height();
        totalHeight += parseInt(tempHandle.css('border-top-width'),10) + parseInt(tempHandle.css('border-bottom-width'),10);
        tempDiv.remove();
        this.element.css('height',totalHeight);
        ssSpanslicer.cntr++;
        ssSpanslicer.inst[this.element.attr('id')] = this;
        this.enableDrag(this.element.find('.ss_span_div:has(.ss_handle)'));
      },
      buildRuler: function (ruler_selector) {
        var firstDivClass = (this.options.ticks) ? ' ss_tall' : '';
        if (this.options.ticks) this.ruler.append($('<div class="ss_mark_div'+firstDivClass+'" style="width:'+this.options.tickWidth+'px"></div>'));
        for (var i = 0; i < this.options.numDivisions; i++) {
          this.ruler.append($('<div class="ss_ruler_block" style="padding:'+this.options.spanPadding+'px;"><div class="ss_inner" style="width:'+this.options.spanWidth+'px;"></div></div>'));
          if (this.options.ticks) {
            var divClass = (i % this.options.tickEvery == this.options.tickEvery-1) ? ' ss_tall':''
            this.ruler.append($('<div class="ss_mark_div'+divClass+'" style="width:'+this.options.tickWidth+'px"></div>'));
          }
        }
      },
      buildSpans: function () {
        var children = (this.options.spans) ? this.options.spans : [];
        this.element.children().each(function(i) {
          if (!_this.options.spans && $(this).attr('data-width') !=0 && $(this).attr('data-offset')) children.push(Number($(this).attr('data-offset')));
          $(this).remove();
        });
        if (children.length == 0) children.push(0);
        this.element.css('position','relative').css('clear','both');
        for (var i = 0; i < children.length; i++) {
          var width = (i < children.length-1) ? children[i+1]-children[i] : this.options.numDivisions - children[i];
          if (i > 0) {
            var spanDiv = $('<div class="ss_span_div" style="left:'+(children[i]*this.unitWidth).toString()+'px;width:'+this.options.tickWidth+'px;"></div>');
            this.element.append(spanDiv);
            if (children[i] - children[i-1] > 1 || width > 1) {
              spanDiv.append($('<div class="ss_handle"></div>'));
            }
          }
          var class = (i == 0) ? ' ss_selected' : ''
          this.element.append($('<div class="ss_span" data-width="'+width+
            '" data-offset="'+children[i]+
            '" style="position:absolute;left:'+(children[i]*this.unitWidth+this.options.tickWidth).toString()+
            'px;width:'+(width*this.unitWidth-2*this.options.spanPadding-this.options.tickWidth).toString()+
            'px;padding:'+this.options.spanPadding+'px"><div class="ss_inner'+class+'"></div></div>'));
        }
      },
      selectSpan: function(event) {
        _this.element.find('.ss_span').each(function(i) {
          if (this == event.currentTarget) {
            $(this).find('.ss_inner').addClass("ss_selected");
            _this.selectedIndex = i;
          } else {
            $(this).find('.ss_inner').removeClass("ss_selected");
          }
        });
      },
      updateSpans: function(event,ui) {
        _this.prevSpan.css('width',_this.handle.position().left-_this.prevSpan.position().left-2*_this.options.spanPadding);
        _this.nextSpan.css('left',_this.handle.position().left+_this.options.tickWidth);
        _this.nextSpan.css('width',_this.nextOWidth+(_this.startPos-_this.handle.position().left));
      },
      handleDragRelease: function(event,ui) {
        _this.prevSpan.attr('data-width',(_this.prevSpan.width() + 2*_this.options.spanPadding+_this.options.tickWidth)/_this.unitWidth);
        _this.nextSpan.attr('data-width',(_this.nextSpan.width() + 2*_this.options.spanPadding+_this.options.tickWidth)/_this.unitWidth);
        _this.nextSpan.attr('data-offset',(_this.nextSpan.position().left - _this.options.tickWidth)/_this.unitWidth);
        clearInterval(_this.updateInt);
        _this.stripHandles();
      },
      handleDragStart: function(event,ui) {
        _this.prevSpan = $(event.target).prev();
        _this.nextSpan = $(event.target).next();
        _this.handle = $(event.target);
        var prevDiv = $(event.target).prevAll('.ss_span_div:first');
        var leftBound = (prevDiv.length > 0) ? $(prevDiv[0]).position().left + _this.unitWidth : _this.unitWidth;
        var nextDiv = $(event.target).nextAll('.ss_span_div:first');
        var rightBound = (nextDiv.length > 0) ? $(nextDiv[0]).position().left : _this.unitWidth*_this.options.numDivisions;
        $(event.target).dyndraggable("option", 'containment', [leftBound, 1, rightBound, 1]);
        _this.startPos = $(event.target).position().left;
        _this.nextOWidth = $(event.target).next().width();
        _this.updateInt = setInterval(_this.updateSpans,10);
      },
      stripHandles: function() {
        this.element.find(".ss_span_div").each(function(i) {
          var handle = $(this).find('.ss_handle');
          if ($(this).next().attr('data-width') == '1' && $(this).prev().attr('data-width') == '1') {
            handle.remove();
            $(this).dyndraggable("destroy");
          } else if (handle.length == 0) {
            $(this).append('<div class="ss_handle"></div>');
            _this.enableDrag($(this));
          }
        });
      },
      enableDrag: function(set) {
        set.dyndraggable({
          axis:'x',
          handle:'.ss_handle',
          grid: [this.options.spanWidth+2*this.options.spanPadding+this.options.tickWidth,1],
          containment: [_this.unitWidth,1,_this.unitWidth*this.options.numDivisions,1],
          start: this.handleDragStart,
          stop: this.handleDragRelease
        });
      }
    }
  };
  ssSpanslicer.cntr = 0;
  ssSpanslicer.inst = {};
})(jQuery);