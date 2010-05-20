(function ($) {
  $.widget( "ui.spanslicer", {
    options: {
      numDivisions: 96,
      tickEvery: 4,
      ticks: true,
      tickWidth: 1,
      ruler: true,
      spans: null,
      spanWidth: 8,
      spanPadding: 1
    },
    selectedIndex: 0,
    nextOWidth: 0,
    startPost: 0,
    prevSpan: null,
    nextSpan: null,
    updateInt: null,
    unitWidth: null,
    handle: null,
    ruler: null,
    _create: function() {
      var self = this;
      if (!this.options.ticks) this.options.tickWidth = 0;
      this.unitWidth = (this.options.spanWidth+2*this.options.spanPadding+this.options.tickWidth);
      if (this.options.ruler) {
        this.ruler = $('<div id="ss_ruler" style="position:relative;"></div>');
        this.element.before(this.ruler);
        _buildRuler(this.ruler);
      }
      _buildSpans();
      this.element.find('.ss_span').bind('click',function(event) { self._selectSpan(event) });
      this.element.addClass('ss_spanslicer');
      var totalHeight = (this.ruler) ? this.ruler.height() : 0;
      var tempDiv = $('<div class="ss_span_div" style="width:'+this.options.tickWidth+'px;"><div class="ss_handle"></div></div>');
      this.element.append(tempDiv);
      var tempHandle = tempDiv.find('.ss_handle')
      totalHeight += tempHandle.position().top;
      totalHeight += tempHandle.height();
      totalHeight += parseInt(tempHandle.css('border-top-width'),10) + parseInt(tempHandle.css('border-bottom-width'),10);
      tempDiv.remove();
      this.element.css('height',totalHeight);
      this._enableDrag(this.element.find('.ss_span_div:has(.ss_handle)'));
      
      function _buildRuler(ruler_selector) {
        var firstDivClass = (self.options.ticks) ? ' ss_tall' : '';
        if (self.options.ticks) self.ruler.append($('<div class="ss_mark_div'+firstDivClass+'" style="width:'+self.options.tickWidth+'px"></div>'));
        for (var i = 0; i < self.options.numDivisions; i++) {
          self.ruler.append($('<div class="ss_ruler_block" style="padding:'+self.options.spanPadding+'px;"><div class="ss_inner" style="width:'+self.options.spanWidth+'px;"></div></div>'));
          if (self.options.ticks) {
            var divClass = (i % self.options.tickEvery == self.options.tickEvery-1) ? ' ss_tall':''
            self.ruler.append($('<div class="ss_mark_div'+divClass+'" style="width:'+self.options.tickWidth+'px"></div>'));
          }
        }
      }
      function _buildSpans() {
        var children = (self.options.spans) ? self.options.spans : [];
        self.element.children().each(function(i) {
          if (!self.options.spans && $(this).attr('data-offset')) children.push(Number($(this).attr('data-offset')));
          $(this).remove();
        });
        if (children.length == 0) children.push(0);
        self.element.css('position','relative').css('clear','both');
        for (var i = 0; i < children.length; i++) {
          var width = (i < children.length-1) ? children[i+1]-children[i] : self.options.numDivisions - children[i];
          if (i > 0) {
            var spanDiv = $('<div class="ss_span_div" style="left:'+(children[i]*self.unitWidth).toString()+'px;width:'+self.options.tickWidth+'px;"></div>');
            self.element.append(spanDiv);
            if (children[i] - children[i-1] > 1 || width > 1) {
              spanDiv.append($('<div class="ss_handle"></div>'));
            }
          }
          var class = (i == 0) ? ' ss_selected' : ''
          self.element.append($('<div class="ss_span" data-width="'+width+
            '" data-offset="'+children[i]+
            '" style="position:absolute;left:'+(children[i]*self.unitWidth+self.options.tickWidth).toString()+
            'px;width:'+(width*self.unitWidth-2*self.options.spanPadding-self.options.tickWidth).toString()+
            'px;padding:'+self.options.spanPadding+'px"><div class="ss_inner'+class+'"></div></div>'));
        }
      }
    },
    _handleDragRelease: function(event,ui) {
      var self = this;
      self.prevSpan.attr('data-width',(self.prevSpan.width() + 2*self.options.spanPadding+self.options.tickWidth)/self.unitWidth);
      self.nextSpan.attr('data-width',(self.nextSpan.width() + 2*self.options.spanPadding+self.options.tickWidth)/self.unitWidth);
      self.nextSpan.attr('data-offset',(self.nextSpan.position().left - self.options.tickWidth)/self.unitWidth);
      clearInterval(self.updateInt);
      self._stripHandles();
    },
    _handleDragStart: function(event,ui) {
      var self = this;
      self.prevSpan = $(event.target).prev();
      self.nextSpan = $(event.target).next();
      self.handle = $(event.target);
      var prevDiv = $(event.target).prevAll('.ss_span_div:first');
      var leftBound = (prevDiv.length > 0) ? $(prevDiv[0]).position().left + self.unitWidth : self.unitWidth;
      var nextDiv = $(event.target).nextAll('.ss_span_div:first');
      var rightBound = (nextDiv.length > 0) ? $(nextDiv[0]).position().left : self.unitWidth*self.options.numDivisions;
      $(event.target).dyndraggable("option", 'containment', [leftBound, 1, rightBound, 1]);
      self.startPos = $(event.target).position().left;
      self.nextOWidth = $(event.target).next().width();
      self.updateInt = setInterval(function() {
        self.prevSpan.css('width',self.handle.position().left-self.prevSpan.position().left-2*self.options.spanPadding);
        self.nextSpan.css('left',self.handle.position().left+self.options.tickWidth);
        self.nextSpan.css('width',self.nextOWidth+(self.startPos-self.handle.position().left));
      },10);
    },
    _enableDrag: function(set) {
      var self = this;
      set.dyndraggable({
        axis:'x',
        handle:'.ss_handle',
        grid: [self.options.spanWidth+2*self.options.spanPadding+self.options.tickWidth,1],
        containment: [self.unitWidth,1,self.unitWidth*self.options.numDivisions,1],
        start: function(event,ui) { self._handleDragStart(event,ui) },
        stop: function(event,ui) { self._handleDragRelease(event,ui) }
      });
    },
    _selectSpan: function(event) {
      var self = this;
      self.element.find('.ss_span').each(function(i) {
        if (this == event.currentTarget) {
          $(this).find('.ss_inner').addClass("ss_selected");
          self.selectedIndex = i;
        } else {
          $(this).find('.ss_inner').removeClass("ss_selected");
        }
      });
    },
    _stripHandles: function() {
      var self = this;
      self.element.find(".ss_span_div").each(function(i) {
        var handle = $(this).find('.ss_handle');
        if ($(this).next().attr('data-width') == '1' && $(this).prev().attr('data-width') == '1') {
          handle.remove();
          $(this).dyndraggable("destroy");
        } else if (handle.length == 0) {
          $(this).append('<div class="ss_handle"></div>');
          self._enableDrag($(this));
        }
      });
    },
    splitSelected: function() {
      var self = this;
      var spanToSplit = this.element.find('.ss_span')[this.selectedIndex];
      if ($(spanToSplit).attr('data-width') != '1') {
        var widthCount = Number($(spanToSplit).attr('data-width'));
        var offCount = Number($(spanToSplit).attr('data-offset'));
        var leftSpan = $('<div style="left:'+(offCount*this.unitWidth+this.options.tickWidth).toString()+'px;width:'+(Math.floor(widthCount/2)*this.unitWidth - (2*this.options.spanPadding+this.options.tickWidth)).toString()+'px;padding:'+this.options.spanPadding+'px;" class="ss_span" data-width="'+Math.floor(widthCount/2).toString()+'" data-offset="'+offCount.toString()+'"><div class="ss_inner ss_selected"></div></div>');
        var rightSpan = $('<div style="left:'+((offCount+Math.floor(widthCount/2))*this.unitWidth+this.options.tickWidth).toString()+'px;width:'+(((widthCount - Math.floor(widthCount/2))*this.unitWidth) - (2*this.options.spanPadding+this.options.tickWidth)).toString()+'px;padding:'+this.options.spanPadding+'px;" class="ss_span" data-width="'+(widthCount - Math.floor(widthCount/2)).toString()+'" data-offset="'+(offCount+Math.floor(widthCount/2)).toString()+'"><div class="ss_inner"></div></div>');
        var spanDiv = $('<div style="position:absolute;left:'+((offCount+Math.floor(widthCount/2))*this.unitWidth).toString()+'px;width:'+this.options.tickWidth+'px;" class="ss_span_div"></div>');
        if (Math.floor(widthCount/2) > 1 || (widthCount - Math.floor(widthCount/2)) > 1) {
          $(spanDiv).append($('<div class="ss_handle"></div>'));
          this._enableDrag($(spanDiv));
        }
        rightSpan.bind('click',function(event) { self._selectSpan(event) });
        leftSpan.bind('click',function(event) { self._selectSpan(event) });
        $(spanToSplit).after(rightSpan).after(spanDiv).after(leftSpan);
        $(spanToSplit).remove();
        this._stripHandles();
      }
    },
    deleteSelected: function() {
      var self = this;
      if (self.element.find('.ss_span').length > 1) {
        var spanToDelete = $(self.element.find('.ss_span')[self.selectedIndex]);
        if (self.selectedIndex == 0) {
          var nextSpan = $(self.element.find('.ss_span')[self.selectedIndex + 1]);
          nextSpan.css('left',spanToDelete.position().left);
          nextSpan.css('width',nextSpan.width()+spanToDelete.width()+2*self.options.spanPadding+self.options.tickWidth);
          nextSpan.attr('data-width',Number(nextSpan.attr('data-width'))+Number(spanToDelete.attr('data-width')));
          nextSpan.attr('data-offset',0);
          nextSpan.find('.ss_inner').addClass("ss_selected");
          var div = spanToDelete.next();
          div.dyndraggable("destroy");
          div.remove();
          spanToDelete.remove();
        } else {
          var prevSpan = $(self.element.find('.ss_span')[self.selectedIndex - 1]);
          prevSpan.css('width',prevSpan.width()+spanToDelete.width()+2*self.options.spanPadding+self.options.tickWidth);
          prevSpan.attr('data-width',Number(prevSpan.attr('data-width'))+Number(spanToDelete.attr('data-width')));
          prevSpan.find('.ss_inner').addClass("ss_selected");
          var div = spanToDelete.prev();
          div.dyndraggable("destroy");
          div.remove();
          spanToDelete.remove();
          self.selectedIndex--;
        }
        self._stripHandles();
      } else {
        alert("You can't delete your last timespan!");
      }
    }
  });
})(jQuery);