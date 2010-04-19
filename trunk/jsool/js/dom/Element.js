/*  JSOOL - JavaScript Object Oriented Library 
 *
 *  Copyright (c) 2009, Mikhail Domanoski.
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without modification,
 *  are permitted provided that the following conditions are met:
 *
 *      * Redistributions of source code must retain the above copyright notice,
 *        this list of conditions and the following disclaimer.
 *
 *      * Redistributions in binary form must reproduce the above copyright notice,
 *        this list of conditions and the following disclaimer in the documentation
 *        and/or other materials provided with the distribution.
 *
 *      * Neither the name of Mikhail Domanoski nor the names of its
 *        contributors may be used to endorse or promote products derived from this
 *        software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 *  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

jsool.namespace("js.dom");

/**
 * @class js.dom.Element
 * @extends js.core.Object
 * 
 * Base class for any html element
 */
js.dom.Element = $extends(js.core.Object,{
	/**
	 * @constructor
	 * Creates a new html element.
	 * 
	 * @param {HTMLElement} element
	 * creates an element based on a existing HTMLElement
	 * @param {string} tag
	 * creates a new element and its dom with a valid html tag
	 * 
	 * @throws {js.core.Exception} if the html tag is invalid or the providen object is not a valid dom
	 */
	cons: function(obj){
		var type = typeof obj;
		
		if(type == 'string'){
			this.dom = document.createElement(obj);
		}else if(type == 'object' && obj.tagName){
			this.dom = obj;
		}else{
			throw new js.core.Exception('Invalid tag: ' + obj, this);
		}
		
		this.id = jsool.id(this.dom);
		
		js.dom.Element.cache(this);
	},
	/**
	 * @property {HTMLElement} the dom of the Element
	 */
	dom: null,
	/**
	 * @property {js.dom.Element} parent element
	 */
	parent: null,	
	/**
	 * @function Returns the dom of the Element
	 * @return {HTMLElement} Element's dom
	 */
	getDom: function(){
		return this.dom;
	},
	/**
	 * @function Set the attributes to the dom element
	 * 
	 * @param {string} name
	 * the name of the attribute
	 * @param {string} value
	 * the value of the attribute
	 * @param {object} attributes
	 * a map of attributes
	 */
	set: function(){
		if(arguments.length == 2 && typeof arguments[0] == 'string'){
			var name = arguments[0];
			var value = arguments[1];
			this.dom[name] = value;
		}else if(arguments.length == 1 && typeof arguments[0] == 'object'){
			var options = arguments[0];
			for(var p in options){
				this.dom[p] = options[p];
			}
		}
	},
	/**
	 * @function
	 * 
	 * @param {string} name
	 * the name of the attribute
	 * 
	 * @return {string} value of the attribute
	 */
	get: function(name){
		return this.dom[name];
	},
	/**
	 * @function
	 * 
	 * @return {string} the id of the dom element
	 */
	getId: function(){
		return this.id;
	},
	/**
	 * @function
	 * adds a new child into the elements dom and the children collection
	 * 
	 * @param {js.dom.Element} child 
	 * 
	 * @throws {js.core.Exception} if the object is not an instance of js.dom.Element
	 */
	append: function(child){
		var type = typeof child;
		if(type == 'string'){
			if(jsool.isIE){
				var d = js.dom.Helper.createDom(child);
				this.dom.appendChild(d.cloneNode(true));
			}else{
				this.dom.innerHTML = this.dom.innerHTML + child;
			}
		}else if(type == 'object'){
			if(child.nodeType){
				this.dom.appendChild(child);
			}else if(child.instanceOf(js.dom.Element)){
				if(child.parent){child.parent.remove(child);}
				
				this.dom.appendChild(child.getDom());
				child.parent = this;
			}
		}
	},
	/**
	 * @function
	 * Set the elements inner text.
	 * 
	 * @param {string} string
	 * 
	 * @throws {js.core.Exception} i the argument is not a string
	 */
	setText: function(value){
		this.dom.innerHTML = '';
		this.dom.appendChild(document.createTextNode(new String(value)));
	},
	getText: function(){
		return this.getDom().innerHTML;
	},
	setHtml: function(html){
		this.dom.innerHTML = new String(html);
	},
	/**
	 * @function
	 * 
	 * @return {string} the elements tag name
	 */
	tag: function(){
		return this.dom.tagName;
	},
	/**
	 * @function
	 * Removes a child node from the Element
	 * 
	 * @param {js.dom.Element} element
	 * The element to be removed
	 */
	remove: function(element){
		if(!element.nodeType){
			element = element.getDom();
		}
		this.getDom().removeChild(element);
	},
	/**
	 * Adds an event listener to element
	 */
	on: function(event, handler, scope){
		js.core.EventManager.on(this.dom, event, handler,scope || this);
	},
	un: function(event, handler){
		if(event){
			js.core.EventManager.un(this.dom, event, handler);
		}else{
			js.core.EventManager.destroy(this.dom);
		}
	},
	/**
	 * @function
	 * Removes the events listeners from element
	 * 
	 * @param {null} remove all listeners
	 * @param {string} removes the handlers from the named event
	 * 
	 */
	destroyListeners: function(){
		js.core.EventManager.destroy(this.dom);
	},
	setClass: function(cls){
		if(typeof cls === 'string')
			this.dom.className = cls;
	},
	/**
	 * @function
	 * Adds a new CSS class to the element
	 * 
	 * @param {string} name The name of the CSS class
	 */
	addClass: function(name){
		var current = this.dom.className.split('/\s+/');
		current.push(name.trim());
		this.dom.className = current.join(' ').trim();
	},
	/**
	 * @function
	 * Removes a CSS class from the element
	 * 
	 * @param {string} name The name of the CSS class
	 */
	removeClass: function(name){
		name = name.trim();
		var classes = this.dom.className.split(/\s+/);
		if(classes.length > 0){
			var clsarr = [];
			for(var i = 0, cls;cls = classes[i++];){
				if(cls != name){
					clsarr.push(cls);
				}
			}
			this.dom.className = clsarr.join(' ').trim();
		}
	},
	/**
	 * @function
	 * Sets an attribute of the style of the element
	 * 
	 * @param {string} name The name style attribute
	 * @param {string} value the value of the style attribute
	 * 
	 * @param {object} collection of attributes and its values
	 */
	applyStyle: function(arg1, arg2){		
		var style = this.dom.style;
		if(typeof arg1 == 'string'){
			style[arg1] = arg2;
		}else if(typeof arg1 == 'object'){
			for(var prop in arg1)
				style[prop] = arg1[prop];
		}
	},
	/**
	 * @function
	 * Returns the child elements
	 * 
	 * @param {boolean} dom
	 * if <code>true</code> to the returned values be the dom elements
	 * or <code>false|null</code> to returns a <code>js.util.List</code> of Elements 
	 * 
	 * @param {object} collection of attributes and its values
	 * 
	 * @return {collection} the element's children
	 */
	children: function(el){
		return Raze.query("*",this.dom);
	},
	/**
	 * @function
	 * Gets the absolute position of the element on the page
	 * 
	 * @return {object} the element position like {x,y}
	 */
	getPosition: function(){
		var element = this.dom;
		var y = 0, x = 0;
		while(element != null){
			y += element.offsetTop;
			x += element.offsetLeft;
			element = element.offsetParent;
		}
		return {y:y,x:x};
	},
	getBox: function(){
		var pos = this.getPosition();
		var dom = this.dom;
		pos.w = dom.clientWidth;
		pos.h = dom.clientHeight;
		return pos;
	},
	getWidth: function(){
		return this.dom.clientWidth;
	},
	getHeight: function(){
		return this.dom.clientHeight;
	},
	/**
	 * @function
	 * Return parent Element
	 * 
	 * @return {js.dom.Element} The parent Element
	 */
	getParent: function(){
		return this.parent; 
	},
	/**
	 * @function
	 * Destroys this element
	 */
	destroy: function(){
		//Remove from dom
		if(this.getParent() != null){
			this.getParent().remove(this);
		}
		if(this.dom.parentNode){
			var parent = this.dom.parentNode;
			parent.removeChild(this.dom);
		}
		
		//Destroy listeners
		this.destroyListeners();
		
		//kill dom attributes
		for(var a in this.dom){
			this.dom[a] = null;
		}
		js.dom.Element.unCache(this);
		//Delete DOM
		delete this.dom;
	},
	query: function(selector){
		return Raze.query(selector, this.dom);
	},
	setOpacity: function(op){
		var s = this.dom.style;
		if(jsool.isIE){
			s.filter = 'alpha(opacity=' + (op * 100) + ')';
		}else{
			s.opacity = op;
		}
	}
},'js.dom.Element');

js.dom.Element.attributes={
	"class":"className"
};

jsool.onSystemReady(function init_element(){
	var cache = new js.util.HashMap();
	var El = js.dom.Element;
	
	El.get = function(el){
		if(typeof el == 'string'){//Is an id
			var cached = cache.get(el);
			if(cached) return cached;
			var dom = document.getElementById(el);
			if(dom) return new js.dom.Element(dom);
		}else if(typeof el == 'object' && el.nodeType){//DOM Element
			if(el.id){
				var e = El.get(el.id);
				if(e != null) return e;
			}
			return new js.dom.Element(el);
		}
		return null;
	};
	
	jsool.get = El.get;
	
	El.cache = function(el){
		if(el.instanceOf(El)){
			cache.put(el.getId(),el);
			return true;
		}
		return false;
	};
	
	El.unCache = function(el){
		if(el.instanceOf(EL)){
			cache.remove(el);
			return true;
		}
		return false;
	};
	
	El.query = function(selector, context){
		return Raze.query(selector,context);
	};
	
	jsool.query = El.query;
	
	El.queryNode = function(selector, context){
		return Raze.queryNode(selector,context);
	};
	
	jsool.queryNode = El.queryNode;
	
	El.BODY = new js.dom.Element(Raze.queryNode("body"));
	
	var brw = js.core.Browser;
	
	if(brw.isIE){
		El.BODY.addClass('ie');
	}else if(brw.isFF){
		El.BODY.addClass('ff');
	}else if(brw.isOpera){
		El.BODY.addClass('opera');
	}
});