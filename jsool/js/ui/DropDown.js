jsool.namespace("js.ui");

(function(){
	var EM = js.core.EventManager,
		DH = js.dom.Helper;
	
	
	js.ui.DropDown = $extends(js.util.Observable,{
		cons: function(config){
			//Default configuration
			this.config = config || {} ;
			this.items = config.items || [];
			
			if(config.render)this.render(config.render);
		},
		events:['click','select'],
		render: function(el){
			this.wrapper = el = jsool.get(el);
			var items = [],c =this.config,html;
			
			Array.iterate(this.items,function(i,el){
				items.push({
					tag:'li',
					html: c.label ? el[c.label] : el,
					index: i
				});
			});
			
			html = DH.createHTML({
				className:'js-dd',
				children:[{
					tag:'input',
					type:'text',
					disabled:'disabled'
				},{
					tag:'input',
					type:'button',
					value:'V'
				},{
					tag:'ul',
					className:'js-dd no-select',
					children: items
				}]
			});
			
			el.append(html);
			
			el.on('click',this.fireEvent,this);
		},
		dropVisible:false,
		onclick: function(ev){
			
			if(ev.button == 0){//left click
				var src = ev.source,
					t = ev.source.tagName,
					w = this.wrapper,
					d,
					me = this;
				
				if(t == 'LI'){//selecting element
					
					this.selected = this.items[src.getAttribute('index')];
					w.query("input",true)[0].value=src.innerHTML;
					this.fireEvent('select',this.selected);
					
				}else if(t == 'INPUT' && src.type=="button"){ //Drop
					if(!this.dropVisible){
						d = w.query("ul",true)[0].style;
						
						d.display = 'block';
						this.dropVisible = true;
						
						function hideDrop(ev){
							d.display='none';
							me.dropVisible = false;
							EM.un(document,'click',hideDrop);
						}
						
						EM.on(document,'click',hideDrop);
						ev.original.cancelBubble = true;
					}
				}
				
			}
		}
	},"js.ui.DropDown");
})();