/**
 * @app jsroll.js
 * @category RIA (Rich Internet Application) / SPA (Single-page Application)
 *
 * Классы RIA / SPA javascritp framework
 * @author Андрей Новиков <andrey@novikov.be>
 * @data 01/01/2016
 */

(function ( g, undefined ) {
'suspected';
'use strict';
var xmlHttpRequest = ('onload' in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
/**
 * @function uuid
 * Генерация Universally Unique Identifier 16-байтный (128-битный) номер
 *
 * @result { String }
 */
var uuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8); return v.toString(16);
    });
};
g.uuid = uuid;

/**
 * @function params
 * Воздрващает массив (Хеш-таблица) параметров
 *
 * @argument { String | window.location } url строка в формате url (Uniform Resource Locator)
 *
 * @result { Array }
 */
var params = function(search) {
    var re=/[?&]([^=#]+)=([^&#]*)/g,p={},m;
    try { while (m = re.exec((search || g.location.search)))
        if ((m1 = decodeURIComponent(m[1])) && (m2 = decodeURIComponent(m[2])) && !p.hasOwnProperty(m1)) p[m1] = m2;
    }catch(e){return null}
    return p;
}
g.location.params = params;

/**
 * @function fadeOut
 * Функция плавного скрытия элемента - свойство opacity = 0
 *
 * @param el элемент DOM
 * @param cb callback функция
 */
function fadeOut(el, cb){
    var st = null;
    el && (st = setInterval(function() {
        el.style.opacity = el.style.opacity && el.style.opacity > 0 ? (parseFloat(el.style.opacity) - 0.1).toFixed(1) : '1';
        if (parseFloat(el.style.opacity) <= 0){if (cb && typeof cb === 'function' && cb.call(el)) cb.call(el);el.style.display = 'none';clearInterval(st)}
    }, typeof cb === 'number' ? cb : 25));
}
g.fadeOut = fadeOut;

/**
 * @function fadeIn
 * Функция плавного отображения элемента - свойство opacity = 1
 *
 * @param el элемент DOM
 * @param cb callback функция
 */
function fadeIn(el, cb){
    var st = null;
    if (el.style.display == 'none') el.style.display = 'inherit';
    el && (st = setInterval(function() {
        el.style.opacity = el.style.opacity && el.style.opacity < 1 ?  (parseFloat(el.style.opacity) + 0.1).toFixed(1) : '0';
        if (parseFloat(el.style.opacity) >= 1) {if (cb && typeof cb === 'function' && cb.call(el)) cb.call(el);clearInterval(st)}
    }, typeof cb === 'number' ? cb : 25));
}
g.fadeIn = fadeIn;

/**
 * @function form
 * Хелпер сериализации формы
 *
 * @param f DOM элемент форма
 * @param params
 * @returns {result:Object, data: String}}
 */

function form(f, params) {
    var opt = Object.assign({type:'none', validator:null}, params);
    var res = {result: {}, data: opt.type == 'json' ? {} : []};
    if (opt.validator == null || (typeof opt.validator === 'function' && opt.validator.call(f, res)))
        for (var i =0; i < f.elements.length; i++){
            if (opt.type == 'json') return res.data[f.elements[i].name || i] = encodeURIComponent(f.elements[i].value)
            else res.data.push((f.elements[i].name || i) + '=' + encodeURIComponent(f.elements[i].value));
        }
    res.data = opt.type == 'json' ? JSON.stringify(res.data) : '?'+res.data.join('&');
    return res;
}
g.JSON.form = form;

/**
 * @function router
 * Хелпер Маршрутизатор SPA
 *
 * @method { function () } frgm
 * @method { function ( Regex, Callback ) } add
 * @method { function ( Regex | Callback ) } rm
 * @method { function ( String ) } chk
 * @method { function () } lsn
 * @method { function ( String ) } set
 *
 * @result { Object }
 */
function router(r){
    var isHistory = !!(history.pushState) ? 1 : 0;
    var root = r;
    return {
        root:root, rt:[], itv:0, base:isHistory ? window.location.pathname+window.location.search:'',
        clr: function(path) { return path.toString().replace(/\/$/, '').replace(/^\//, '') },
        frgm: isHistory ?
            function(){
                var f = this.clr(decodeURI(location.pathname + location.search)).replace(/\?(.*)$/, '');
                return this.clr(this.root != '/' ? f.replace(this.root, '') : f);
            } :
            function(){
                var m = window.location.href.match(/#(.*)$/);
                return m ? this.clr(m[1]) : '';
            },
        add: function(re, handler) {
            if (typeof re == 'function') { handler = re; re = ''; }
            this.rt.push({ re: re, handler: handler});
            this.rt = this.rt.sort(function(a, b) {
                if (a.re.toString().length < b.re.toString().length) return 1;
                if (a.re.toString().length > b.re.toString().length) return -1;
                return 0;
            });
            return this;
        },
        rm: function(param) {
            for(var i in this.rt) {
                if(this.rt[i].handler === param || this.rt[i].re.toString() === param.toString()) {
                    this.rt.splice(i, 1);
                    return this;
                }
            }
            return this;
        },
        chk: function(fr) {
            var f = fr || this.frgm();
            for(var i in this.rt) {
                var m = f.match(this.rt[i].re);
                if (m) { m.shift(); this.rt[i].handler.apply({}, m); return this }
            }
            return this;
        },
        lsn: function() {
            var s = this, c = s.frgm(), fn = function() { if(c !== s.frgm()) { c = s.frgm();  s.chk(c); } return s };
            clearInterval(s.itv);
            s.itv = setInterval(fn, 50);
            return s;
        },
        set: isHistory ?
            function(path) {
                history.pushState(null, null, this.root + this.clr((path || '')));
                return this;
            } :
            function(path) {
                window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + (path || '');
                return this;
            }
    }
}
g.router = router('/');

/**
 * @function eventhandler
 * Хелпер Обработчик событий
 *
 * @argument { String } id идентификатор события
 * @argument { JSON } param объект в контейнере события
 * @event { window.onbeforeunload & window.onclickhandler }
 *
 * @result { Object }
 */
function eventhandler() {
    var event = function (id, param) {
            return g.dispatchEvent(new CustomEvent(id, {detail: param}));
        },
        bind = function(id, fn, opt) {
            return g.addEventListener(id, fn, !!opt ? opt : false);
        };
    g.onbeforeunload = function(e){ e.preventDefault(); };
    g.onclickhandler = function(e) {
        if (g.eventhandler.onclick(e)) {
            e.preventDefault();
            e.stopPropagation();
        }
    };
    bind('onbeforeunload', g.onbeforeunload.bind(g), false);
    bind('click', g.onclickhandler.bind(g), true);
    return {
        set onbeforeunload(fn){g.onbeforeunload = fn},
        onclick: function(e){return false},
        event: event,
        bind: bind
    }
}
g.eventhandler = eventhandler();

/**
 * @function xhr
 * Хелпер запросов на основе xmlHttpRequest
 *
 * @argument { String } url (Uniform Resource Locator) путь до шаблона
 * @argument { String } id идентификатор шаблона
 * @argument { Boolean } async режим XMLHttpRequest
 * @event { XMLHttpRequest.onload & XMLHttpRequest.process }
 *
 * @result { Object }
 */
function xhr(){
    var x = new xmlHttpRequest();
    if (!x) return null;
    if (!x.hasOwnProperty('ref')) x.ref = {};
    x.request=function(params){
        var opt = Object.assign({method:'GET', rs:{'Content-type':'application/x-www-form-urlencoded'}}, params);
        var id = opt.method + '_' + (opt.url ? opt.url.replace(/(\.|:|\/|\-)/g,'_') : g.uuid());
        //TODO: check double request for resurce
        //if (x.ref.hasOwnProperty(id) && !!x.ref[id].isLoad) return x.ref[id];
        var item = new xhr(); item.isLoad = false;
        //if (['GET','DELETE'].indexOf(opt.method.toUpperCase()) && opt.data){ opt.url = (opt.url || g.location)+'?'+opt.data; opt.data = null }
        item.open(opt.method || 'GET', opt.url || g.location, opt.async || true, opt.username || undefined, opt.password || undefined);
        if (opt.rs) for(var m in opt.rs) item.setRequestHeader(m, opt.rs[m]);
        item.send(opt.data || null);
        item.id = id;
        opt.result && (item.result = x.result(opt.result));
        opt.process && (item.process = x.process(opt.process));
        return x.ref[id] = item;
    };
    //TODO: xmlHttpRequest.abort()
    x.result=function(fn){
        x.onload = function(e){
            this.isLoad = true;
            return fn.call(this, e);
        }
        return this;
    };
    x.process = function(fn){
        x.onreadystatechange = function(e){
            return fn.call(this, e);
        }
        return this;
    };
    return x;
}
g.xhr = xhr();

/**
 * @function load
 * Хелпер для шаблонизатора tmpl получает код шаблона по url
 *
 * @argument { String } url (Uniform Resource Locator) путь до шаблона
 * @argument { String } id идентификатор шаблона
 * @argument { Boolean } async режим XMLHttpRequest
 * @event { XMLHttpRequest.onload }
 *
 * @result { String }
 */
var load = function(url, id, params) {
        var opt = Object.assign({method:'GET', async:false, rs:{'Content-type':'application/xml;charset=utf-8'}}, params);
        load.src[id] = new xmlHttpRequest();
        if (opt.async) load.src[id].onload = function (e) {
            var fn = tmpl.cache[id] = func(this.responseText);
            for (var i in load.pool[id]) load.pool[id][i].cb.call(this, (load.pool[id][i].data ? fn(load.pool[id][i].data) : fn));
            load.pool[id] = undefined;
        }
        load.src[id].open(opt.method, url, opt.async);
        if (opt.rs) for(var m in opt.rs) load.src[id].setRequestHeader(m, opt.rs[m]);
        load.src[id].send(null);
        if (!opt.async) return (load.src[id].status != 200 ? '' : load.src[id].responseText);
        return '';
    },
    func = function(str) {
        return new Function('_e',"var p=[], print=function(){ p.push.apply(p,arguments); };with(_e){p.push('"+str
                .replace(/[\r\t\n]/g," ").split("{%").join("\t").replace(/((^|%})[^\t]*)'/g,"$1\r")
                .replace(/\t=(.*?)%}/g,"',$1,'").split("\t").join("');").split("%}").join("p.push('").split("\r")
                .join("\\'")+ "');} return p.join('').replace(/<%/g,'{%').replace(/%>/g,'%}');");
    },
/**
 * @function load
 * Хелпер для генерации контескта
 *
 * @argument { String } str (url | html)
 * @argument { JSON } data объект с даннными
 * @argument { undefined | function } cb callback функция
 *
 * @result { String }
 */
    tmpl = function tmpl(str, data, cb) {
        var m = str.match(/^(?:https?:\/\/)?(?:(?:[\w]+\.)(?:\.?[\w]{2,})+)?([\/\w]+)(\.[\w]+)/i);
        try {
            if (m) {
                str = str.replace(/(\.|\/|\-)/g, '');
                if (typeof cb === 'function') {
                    if (typeof load.pool[str] === 'undefined') {
                        load.pool[str] = [{data: data, cb: cb}];
                        return load(m.input, str, {async:cb});
                    } else {
                        var a = load.pool[str];a.push({data: data, cb: cb});
                        return '';
                    }
                } else tmpl.cache[str] = tmpl.cache[str] || func(load(m.input, str, false));
            }
            var fn = !/[^\w\-\.]/.test(str) ? tmpl.cache[str] = tmpl.cache[str] ||
                tmpl(g.document.getElementById(str).innerHTML) : func(str);
            var res = data ? fn(data) : fn;
            if (typeof (cb) === 'function') return cb.call(tmpl,res);
            else return res;
        } catch(e) { console.error(e); return ''}
    };
load.src = []; load.pool = []; tmpl.cache = {};
g.tmpl = tmpl;

/**
 * @function storage
 * Хелпер для работы window.localStorage
 * Fix for "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
 *
 * @argument { undefined | Object } s инстанс
 *
 * @result { Object }
 */
var storage = function(s) {
    var s = s || g.localStorage;
    try {
        s.setItem('test', '1');
        s.removeItem('test');
    } catch (e) {
        return {
            p: [],
            setItem:function(key, value){
                this.p.push(key);
                this[key] = value;
            },
            getItem:function(key){
                if (this.hasOwnProperty(key)) return this[key];
                return null;
            },
            removeItem: function(key){
                if (this.hasOwnProperty(key)){
                    delete this.p[key];
                    delete this[key];
                }
            },
            clear:function(){
                this.p.map(function(item){delete this[item];});
                this.p = [];
            }
        };
    }
    return s;
};
g.storage = storage();

}(window));
