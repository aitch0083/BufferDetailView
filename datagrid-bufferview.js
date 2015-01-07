$.extend($.fn.datagrid.defaults, {
	onBeforeFetch: function(page){},
	onFetch: function(page, rows){}
});

var bufferview = $.extend({}, $.fn.datagrid.defaults.view, {
	onAfterRender : function(target){
    },
	render: function(target, container, frozen){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var rows = this.rows || [];
		if (!rows.length) {
			return;
		}
		var fields = $(target).datagrid('getColumnFields', frozen);
		
		if (frozen){
			if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))){
				return;
			}
		}

		var index = parseInt(opts.finder.getTr(target,'','last',(frozen?1:2)).attr('datagrid-row-index'))+1 || 0;
		if(index >= state.data.total){
			return;
		}

		var table = ['<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>'];
		for(var i=0; i<rows.length; i++) {
			// get the class and style attributes for this row
			var css = opts.rowStyler ? opts.rowStyler.call(target, index, rows[i]) : '';
			var classValue = '';
			var styleValue = '';
			if (typeof css == 'string'){
				styleValue = css;
			} else if (css){
				classValue = css['class'] || '';
				styleValue = css['style'] || '';
			}

			var cls = 'class="datagrid-row ' + (index % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue + '"';
			var style = styleValue ? 'style="' + styleValue + '"' : '';
			var rowId = state.rowIdPrefix + '-' + (frozen?1:2) + '-' + index;
			table.push('<tr id="' + rowId + '" datagrid-row-index="' + index + '" ' + cls + ' ' + style + '>');
			table.push(this.renderRow.call(this, target, fields, frozen, index, rows[i]));
			table.push('</tr>');

			// render the detail row
			if (opts.detailFormatter){
				table.push('<tr style="display:none;">');
				if (frozen){
					table.push('<td colspan=' + (fields.length+2) + ' style="border-right:0">');
				} else {
					table.push('<td colspan=' + (fields.length) + '>');
				}
				table.push('<div class="datagrid-row-detail">');
				if (frozen){
					table.push('&nbsp;');
				} else {
					table.push(opts.detailFormatter.call(target, index, rows[i]));
				}
				table.push('</div>');
				table.push('</td>');
				table.push('</tr>');
			}

			index++;
		}
		table.push('</tbody></table>');
		
		$(container).append(table.join(''));
	},

	renderRow : function(target, fields, frozen, rowIndex, rowData) { //method backup from the source
	    var opts = $.data(target, "datagrid").options,
	    	cc = [],
	    	rowSpanField = typeof opts.columns[0]['rowSpanField'] !== 'undefined' ? opts.columns[0]['rowSpanField'] : '',
	    	rowSpan = rowSpanField !== '' && typeof rowData[rowSpanField]['numRows'] !== 'undefined' ? rowData[rowSpanField]['numRows'] : 1;

	    if (frozen && opts.rownumbers) {
	        var _726 = rowIndex + 1;
	        if (opts.pagination) {
	            _726 += (opts.pageNumber - 1) * opts.pageSize;
	        }
	        cc.push("<td class=\"datagrid-td-rownumber\"><div class=\"datagrid-cell-rownumber\">" + _726 + "</div></td>");
	    }

	    for (var i = 0; i < fields.length; i++) {
	        var _727 = fields[i];
	        var col = $(target).datagrid("getColumnOption", _727);
	        if (col) {
	            var _728 = rowData[_727];
	            var css = col.styler ? (col.styler(_728, rowData, rowIndex) || "") : "";
	            var _729 = "";
	            var _72a = "";
	            if (typeof css == "string") {
	                _72a = css;
	            } else {
	                if (css) {
	                    _729 = css["class"] || "";
	                    _72a = css["style"] || "";
	                }
	            }
	            var cls = _729 ? "class=\"" + _729 + ( frozen ? 'frozen-td' : '' ) + "\"" : ( frozen ? 'class="frozen-td"' : '' );
	            var _72b = col.hidden ? "style=\"display:none;" + _72a + "\"" : (_72a ? "style=\"" + _72a + "\"" : "");
	            cc.push("<td field=\"" + _727 + "\" " + cls + " " + _72b + ">");
	            var _72b = "";
	            if (!col.checkbox) {
	                if (col.align) {
	                    _72b += "text-align:" + col.align + ";";
	                }else if (col.expander){
						style = "text-align:center;height:16px;";
					}
	                if (!opts.nowrap) {
	                    _72b += "white-space:normal;height:auto;";
	                } else {
	                    if (opts.autoRowHeight) {
	                        _72b += "height:auto;";
	                    }
	                }
	            }
	            cc.push("<div style=\"" + _72b + "\" ");
	            cc.push(col.checkbox ? "class=\"datagrid-cell-check\"" : "class=\"datagrid-cell " + col.cellClass + "\"");
	            cc.push(">");

	            if (col.checkbox) {
	                cc.push("<input type=\"checkbox\" " + (rowData.checked ? "checked=\"checked\"" : ""));
	                cc.push(" name=\"" + _727 + "\" value=\"" + (_728 != undefined ? _728 : "") + "\">");
	            }else if (col.expander) {
					//cc.push('<div style="text-align:center;width:16px;height:16px;">');
					cc.push('<span class="datagrid-row-expander datagrid-row-expand" style="display:inline-block;width:16px;height:16px;cursor:pointer;" />');
					//cc.push('</div>');
				} else if (col.formatter){
					cc.push(col.formatter(_728, rowData, rowIndex));
				} else {
					cc.push(_728);
				}

	            cc.push("</div>");
	            cc.push("</td>");
	        }
	    }
	    return cc.join("");
	},

	bindEvents: function(target){
		var state = $.data(target, 'datagrid');
		var dc = state.dc;
		var opts = state.options;
		var body = dc.body1.add(dc.body2);
		var clickHandler = ($.data(body[0],'events')||$._data(body[0],'events')).click[0].handler;
		body.unbind('click').bind('click', function(e){
			var tt = $(e.target);
			var tr = tt.closest('tr.datagrid-row');
			if (!tr.length){return}
			if (tt.hasClass('datagrid-row-expander')){
				var rowIndex = parseInt(tr.attr('datagrid-row-index'));
				if (tt.hasClass('datagrid-row-expand')){
					$(target).datagrid('expandRow', rowIndex);
				} else {
					$(target).datagrid('collapseRow', rowIndex);
				}
				$(target).datagrid('fixRowHeight');
				
			} else {
				clickHandler(e);
			}
			e.stopPropagation();
		});
	},
	
	onBeforeRender: function(target){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		var view = this;
		this.renderedCount = 0;
		this.rows = [];
		
		dc.body1.add(dc.body2).empty();
		init();
		createHeaderExpander();
		
		function init(){
			// erase the onLoadSuccess event, make sure it can't be triggered
			state.onLoadSuccess = opts.onLoadSuccess;
			opts.onLoadSuccess = function(){};
			setTimeout(function(){
				dc.body2.unbind('.datagrid').bind('scroll.datagrid', function(e){
					if (state.onLoadSuccess){
						opts.onLoadSuccess = state.onLoadSuccess;	// restore the onLoadSuccess event
						state.onLoadSuccess = undefined;
					}
					if (view.scrollTimer){
						clearTimeout(view.scrollTimer);
					}
					view.scrollTimer = setTimeout(function(){
						scrolling.call(view);
					}, 50);
				});
				dc.body2.triggerHandler('scroll.datagrid');
			}, 0);
		}
		
		function scrolling(){
			if (getDataHeight() < dc.body2.height() && view.renderedCount < state.data.total){
				this.getRows.call(this, target, function(rows){
					this.rows = rows;
					this.populate.call(this, target);
					dc.body2.triggerHandler('scroll.datagrid');
				});
			} else if (dc.body2.scrollTop() >= getDataHeight() - dc.body2.height()){
				this.getRows.call(this, target, function(rows){
					this.rows = rows;
					this.populate.call(this, target);
				});
			}
		}
		
		function getDataHeight(){
			var h = 0;
			dc.body2.children('table.datagrid-btable').each(function(){
				h += $(this).outerHeight();
			});
			if (!h){
				h = view.renderedCount * 25;
			}
			return h;
		}

		function createHeaderExpander(){
			if (!opts.detailFormatter){return}
			
			var t = $(target);
			var hasExpander = false;
			var fields = t.datagrid('getColumnFields',true).concat(t.datagrid('getColumnFields'));
			for(var i=0; i<fields.length; i++){
				var col = t.datagrid('getColumnOption', fields[i]);
				if (col.expander){
					hasExpander = true;
					break;
				}
			}
			if (!hasExpander){
				if (opts.frozenColumns && opts.frozenColumns.length){
					opts.frozenColumns[0].splice(0,0,{field:'_expander',expander:true,width:24,resizable:false,fixed:true});
				} else {
					opts.frozenColumns = [[{field:'_expander',expander:true,width:24,resizable:false,fixed:true}]];
				}
				
				var t = dc.view1.children('div.datagrid-header').find('table');
				var td = $('<td rowspan="'+opts.frozenColumns.length+'"><div class="datagrid-header-expander" style="width:24px;"></div></td>');
				if ($('tr',t).length == 0){
					td.wrap('<tr></tr>').parent().appendTo($('tbody',t));
				} else if (opts.rownumbers){
					td.insertAfter(t.find('td:has(div.datagrid-header-rownumber)'));
				} else {
					td.prependTo(t.find('tr:first'));
				}
			}
			
			setTimeout(function(){
				view.bindEvents(target);
			},0);
		}
	},
	
	getRows: function(target, callback){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var page = Math.floor(this.renderedCount/opts.pageSize) + 1;
		
		if (this.renderedCount >= state.data.total){return;}
		if (opts.onBeforeFetch.call(target, page) == false){return}
		
		var index = (page-1)*opts.pageSize;
		var rows = state.data.rows.slice(index, index+opts.pageSize);
		if (rows.length){
			opts.onFetch.call(target, page, rows);
			callback.call(this, rows);
		} else {
			var param = $.extend({}, opts.queryParams, {
				page: Math.floor(this.renderedCount/opts.pageSize)+1,
				rows: opts.pageSize
			});
			if (opts.sortName){
				$.extend(param, {
					sort: opts.sortName,
					order: opts.sortOrder
				});
			}
			if (opts.onBeforeLoad.call(target, param) == false){return;}
			
			$(target).datagrid('loading');
			var result = opts.loader.call(target, param, function(data){
				$(target).datagrid('loaded');
				var data = opts.loadFilter.call(target, data);
				opts.onFetch.call(target, page, data.rows);
				if (data.rows && data.rows.length){
					state.data.rows = state.data.rows.concat(data.rows);
					callback.call(opts.view, data.rows);
				} else {
					opts.onLoadSuccess.call(target, data);
				}
			}, function(){
				$(target).datagrid('loaded');
				opts.onLoadError.apply(target, arguments);
			});
			if (result == false){
				$(target).datagrid('loaded');
				if (!state.data.rows.length){
					opts.onFetch.call(target, page, state.data.rows);
					opts.onLoadSuccess.call(target, state.data);
				}
			}
		}
	},
	
	populate: function(target){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		if (this.rows.length){
			this.renderedCount += this.rows.length;
			this.render.call(this, target, dc.body2, false);
			this.render.call(this, target, dc.body1, true);
			opts.onLoadSuccess.call(target, {
				total: state.data.total,
				rows: this.rows
			});
		}
	}
});

$.extend($.fn.datagrid.methods, {
	fixDetailRowHeight: function(jq, index){
		return jq.each(function(){
			var opts = $.data(this, 'datagrid').options;
			var dc = $.data(this, 'datagrid').dc;
			var tr1 = opts.finder.getTr(this, index, 'body', 1).next();
			var tr2 = opts.finder.getTr(this, index, 'body', 2).next();
			// fix the detail row height
			if (tr2.is(':visible')){
				tr1.css('height', '');
				tr2.css('height', '');
				var height = Math.max(tr1.height(), tr2.height());
				tr1.css('height', height);
				tr2.css('height', height);
			}
			dc.body2.triggerHandler('scroll');
		});
	},
	getExpander: function(jq, index){	// get row expander object
		var opts = $.data(jq[0], 'datagrid').options;
		return opts.finder.getTr(jq[0], index).find('span.datagrid-row-expander');
	},
	// get row detail container
	getRowDetail: function(jq, index){
		var opts = $.data(jq[0], 'datagrid').options;
		var tr = opts.finder.getTr(jq[0], index, 'body', 2);
		return tr.next().find('div.datagrid-row-detail');
	},
	expandRow: function(jq, index){
		return jq.each(function(){
			var opts = $(this).datagrid('options');
			var dc = $.data(this, 'datagrid').dc;
			var expander = $(this).datagrid('getExpander', index);
			if (expander.hasClass('datagrid-row-expand')){
				expander.removeClass('datagrid-row-expand').addClass('datagrid-row-collapse');
				var tr1 = opts.finder.getTr(this, index, 'body', 1).next();
				var tr2 = opts.finder.getTr(this, index, 'body', 2).next();
				tr1.show();
				tr2.show();
				$(this).datagrid('fixDetailRowHeight', index);
				if (opts.onExpandRow){
					var row = $(this).datagrid('getRows')[index];
					opts.onExpandRow.call(this, index, row);
				}
			}
		});
	},
	collapseRow: function(jq, index){
		return jq.each(function(){
			var opts = $(this).datagrid('options');
			var dc = $.data(this, 'datagrid').dc;
			var expander = $(this).datagrid('getExpander', index);
			if (expander.hasClass('datagrid-row-collapse')){
				expander.removeClass('datagrid-row-collapse').addClass('datagrid-row-expand');
				var tr1 = opts.finder.getTr(this, index, 'body', 1).next();
				var tr2 = opts.finder.getTr(this, index, 'body', 2).next();
				tr1.hide();
				tr2.hide();
				dc.body2.triggerHandler('scroll');
				if (opts.onCollapseRow){
					var row = $(this).datagrid('getRows')[index];
					opts.onCollapseRow.call(this, index, row);
				}
			}
		});
	}
});
