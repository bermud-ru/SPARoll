/**
 * @app jsroll.js
 * @category RIA (Rich Internet Application) / SPA (Single-page Application)
 *
 * Классы RIA / SPA javascritp framework
 * @author Андрей Новиков <andrey@novikov.be>
 * @data 16/04/2018
 * @status beta
 * @version 2.0.12b
 * @revision $Id: jsroll.js 2.0.10b 2018-04-16 10:10:01Z $
 */

(function ( g, undefined ) {
    'suspected';
    'use strict';
    var version = '2.0.12b';

    g.HTTP_RESPONSE_CODE = {
        100: 'Continue',
        101: 'Switching Protocol',
        102: 'Processing',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        300: 'Multiple Choice',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        306: 'Switch Proxy',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Request Entity Too Large',
        414: 'Request-URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Requested Range Not Satisfiable',
        417: 'Expectation Failed',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported'
    };

    var xmlHttpRequest = ('XMLHttpRequest' in g ? g.XMLHttpRequest : ('ActiveXObject' in g ? g.ActiveXObject('Microsoft.XMLHTTP') : g.XDomainRequest));

    if (!('indexedDB' in g)) {
        g.indexedDB = g.mozIndexedDB || g.webkitIndexedDB || g.msIndexedDB;
        g.IDBTransaction = g.webkitIDBTransaction || g.msIDBTransaction;
        g.IDBKeyRange = g.webkitIDBKeyRange || g.msIDBKeyRange;
    }

    g.URL = g.URL || g.webkitURL;
    g.requestFileSystem = g.requestFileSystem || g.webkitRequestFileSystem;

    var is_url = /^(?:https?:\/\/)?(?:(?:[\w]+\.)(?:\.?[\w]{2,})+)?([\/\w]+)(\.[\w]+)|^(?:\/[\w]+){1,}/i;

    /**
     * @function re
     * Создание регулярного выражения из строки
     *
     * @argument { String } s - регулярное выражение
     * @argument { String } f - flags
     *      g — глобальный поиск (обрабатываются все совпадения с шаблоном поиска);
     *      i — не различать строчные и заглавные буквы;
     *      m — многострочный поиск.
     *
     * @result { RegExp }
     */
    var re = function (s, f) { return new RegExp(s, f || 'g') }; g.re = re;

    /**
     * str2json
     * Создание JSON объекта из стоки
     *
     * @argument { String } s - строка JSON
     * @returns {*}
     */
    var str2json = function (s, def) { try { var o = (typeof s === 'string' ? JSON.parse(s) : s||(typeof def === 'undefined' ? null : def)); } catch (e) { o = typeof def === 'undefined' ? null : def; }; return o; }; g.str2json = str2json;

    /**
     * obj2array
     * 
     * @param a
     * @returns {Array}
     */
    var obj2array = function (a) { return Array.prototype.slice.call(a); }; g.obj2array = obj2array;

    /**
     * @function coalesce
     * Return first not null or undefined in the function arguments
     *
     * @returns {variant | null}
     */
    var coalesce = function() {
        for (var i in arguments) { if (typeof arguments[i] !== 'undefined' && arguments[i] !== null) return arguments[i] };
        return null;
    }; g.coalesce = coalesce;

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
    }; g.uuid = uuid;

    /**
     * Cyclic redundancy check, CRC32
     *
     * @param str
     * @returns {number}
     */
    var crc32 = function(str) {
        var makeCRCHelper = g.makeCRCHelper || (g.makeCRCHelper = function(){
            var c;
            var makeCRCHelper = [];
            for(var n =0; n < 256; n++){
                c = n;
                for(var k =0; k < 8; k++){
                    c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                }
                makeCRCHelper[n] = c;
            }
            return makeCRCHelper;
        });

        var crc = 0 ^ (-1);

        for (var i = 0; i < str.length; i++ ) {
            crc = (crc >>> 8) ^ makeCRCHelper[(crc ^ str.charCodeAt(i)) & 0xFF];
        }

        return (crc ^ (-1)) >>> 0;
    }; g.crc32 = crc32;

    /**
     * @function merge (...)
     *
     * Метод Object.assign() копирует из исходных объектов в целевой объект только перечисляемые и собственные
     * свойства. Он использует внутренний метод [[Get]] на исходных объектах и внутренний метод [[Set]] на целевом
     * объекте, так что он также вызывает геттеры и сеттеры. Именно поэтому он присваивает свойства вместо простого
     * копирования или определения новых свойств. Это поведение может сделать метод непригодным для вливания новых
     * свойств в прототип, если вливаемые исходные объекты содержат геттеры. Вместо него для копирования в прототипы
     * определений свойств, включая признак их перечисляемости, следует использовать методы
     * Object.getOwnPropertyDescriptor() и Object.defineProperty().
     * @returns {any | {}}
     */
    Object.defineProperty(Object.prototype, 'merge', {
        value: function() {
            if (!arguments.length) return null;
            var o = (typeof this !== 'function' ? this : {});
            Array.prototype.slice.call(arguments).forEach( function(v, k, a) {
                Object.defineProperties(o, Object.keys(v||{}).reduce( function (d, key) {
                    if (o.hasOwnProperty(key) && Object.getOwnPropertyDescriptor(o, key)['set']) {
                        o[key] = v[key]; d[key] = Object.getOwnPropertyDescriptor(o, key);
                    } else d[key] = Object.getOwnPropertyDescriptor(v, key);
                    // d[key] = Object.getOwnPropertyDescriptor(v, key);
                    return d;
                }, {}));
            });
            return o;
        },
        enumerable: false
    });

    /**
     * @function bb (BlobBuilder)
     * Генерация Blob объекта
     *
     * @param data содержимое файла
     * @param params параметры формирвания контейнера Blob mime-type etc
     * @returns {*}
     */
    var bb = function(data, params) {
    	var opt = Object.assign({type:'application/x-www-form-urlencoded'}, params);
        var BlobBuilder = ('MozBlobBuilder' in g ? g.MozBlobBuilder : ('WebKitBlobBuilder' in g ? g.WebKitBlobBuilder : g.BlobBuilder));
        if (BlobBuilder) {
        	var bb = new BlobBuilder();
			bb.append(data);
		 	return bb.getBlob(opt.type);
		}
        return new Blob([data], opt);
    }; g.bb = bb;
    
    /**
     * @function func
     * Создание фкнкции из строки или выполнение кода из строки в контексте
     *
     * @param str Текстовая строка содержащая определение функцц или содержащий JS код
     * @param self Контекст в котором будет выполнен код
     * @returns {*}
     */
    var func = function (str, self, args) {
        if (typeof str !== 'string') return console.error('jsRoll::func(', str, self, args,') ERROR: Source of context not defined!');
        try {
            var s = str.replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[^\r\n]*)/igm,'');
            switch ( true ) {
                case /^\s*function.*[}|;]\s*$/i.test(s) : return new Function('return ' + s + '.apply(this, arguments)');
                default: return (function () { return eval(s) }).apply(self||this, args||[self]);
            }
        } catch( e ) {
            return console.error( 'jsRoll::func(', str, self, args, ') ERROR: ', e );
        }
    }; g.func = func;

    /**
     * @function decoder
     * Возвращает объект (Хеш-таблица) параметров
     *
     * @argument { String | window.location } url строка в формате url (Uniform Resource Locator)
     * @argument RegExp регулярное выражение, по умолчанию /[?&]([^=#]+)=([^&#]*)/
     *
     * @result { Object }
     */
    var decoder = function(search, re) {
        var re=re || /[?&]([^=#]+)=([^&#]*)/g, p={}, m;
        try { while (m = re.exec((search || g.location.search)))
            if (m[1] && m[2]) p[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        } catch(e) { return null }
        return p;
    }; g.location.decoder = decoder;

    /**
     * @function encoder
     * Возвращает строку вида ключ=значение разделёных &
     *
     * @argument { Object } Хеш-таблица параметров
     *
     * @result { String }
     */
    var encoder = function(params, divider) {
        if (typeof params === 'object') return Object.keys(params).map(function(e,i,a) {
            return encodeURIComponent(e) + '=' + encodeURIComponent(params[e])
        }).join(divider || '&');
        return undefined;
    }; g.location.encoder = encoder;

    /**
     * @function update
     * Возвращает Url c обновёнными (если были) или добавленными параметрами
     *
     * @argument { String | window.location } url строка в формате url (Uniform Resource Locator)
     * @argument { JSON object } параметры в формате ключ-значения
     *
     * @result { String }
     */
    var update = function(search, params) {
        var u = [], h = [], url = g.location.search, kv = params || {};
        if (typeof search === 'string' ) url = search; else kv = search;
        var p = g.location.decoder(url);
        if (url.indexOf('#') > -1) h = url.split('#'); if (url.indexOf('?') > -1) u = url.split('?');
        for (var i in kv) p[decodeURIComponent(i)] = decodeURIComponent(kv[i]);
        var res = []; for (var a in p) res.push(a+'='+p[a]);
        if (res.length) return ((!u.length && !h.length) ? url : (u.length?u[0]:h[0])) + '?' + res.join('&') + (h.length ? h[1] : '');
        return url;
    }; g.location.update = update;

    /**
     * @function timer
     * Кратное выполнение функции с заданным интервалом времени
     *
     * @argument { Number } t итервал в милисекунах до вызова функции f
     * @argument { Number } c количество вызовов функции f
     * @argument { Function } f функция
     * @argument { undefined | Function } done функуиф вызвается по завершению всх циклов или сигнала exit
     */
    function timer(t, c, f, done) {
        if (t && c && typeof f === 'function') {
            var fn = function fn (c, f, done) {
                    var r = f.call(this, c);
                    if (!c || (r !== undefined && !r)) {
                        clearTimeout(thread);
                        if (typeof done === 'function') return done.call(this, r);
                        return null;
                    } else {
                        return thread = g.setTimeout(fn.bind(this, --c, f, done), t);
                    }
                },
                thread = g.setTimeout(fn.bind(this, c, f, done), t);
            return thread;
        }
        return undefined;
    }; g.timer = timer;

    /**
     * @function router
     * Хелпер Маршрутизатор SPA
     *
     * @method { function () } fr
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
            root:root, rt:[], itv:0, base:isHistory ? g.location.pathname+g.location.search:'',
            referrer:root,
            clr: function(path) { return path.toString().replace(/\/$/, '').replace(/^\//, ''); },
            fr: isHistory ?
                function(){
                    return this.root + this.clr(decodeURI(g.location.pathname + g.location.search)).replace(/\?(.*)$/, '');
                }:
                function(){
                    var m = g.location.href.match(/#(.*)$/);
                    return this.root + (m ? this.clr(m[1]) : '');
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
                var f = fr || this.fr(), m = false;
                for(var i in this.rt) if (m = f.match(this.rt[i].re)) { this.rt[i].handler.call(m || {}, f); return this; }
                return this;
            },
            lsn: function() {
                var s = this, c = s.fr(), fn = function() { if(c !== s.fr()) { c = s.fr(); s.chk(c); } return s; };
                clearInterval(s.itv); s.itv = setInterval(fn, 50);
                return s;
            },
            set: isHistory ?
                function(path) {
                    this.referrer = g.location.pathname+g.location.search;
                    history.pushState(null, null, this.root + this.clr(path || ''));
                    return this;
                }:
                function(path) {
                    this.referrer = g.location.pathname+g.location.search;
                    window.location.href = g.location.href.replace(/#(.*)$/, '') + '#' + (path || '');
                    return this;
                }
        }
    }; g.router = router('/');

    /**
     * @class chain
     * Хелпер Обработчик цепочки асинхронных объектов поддерживающих интерфейс done, fail
     *
     * @function done
     * @function fail
     */
    function chain(){
        var c = {
            tuple: [], cache: [],
            donned:function(fn){ return false },
            failed:function(fn){ return false },
            pool:function (fn, arg) {
                this.chain.cache.push(this);
                if (this.chain.tuple.length == this.chain.cache.length) this.chain.donned.apply(this.chain, this.chain.cache);
            },
            done: function(fn){ this.donned = fn },
            fail: function(fn){ this.failed = fn }
        };
        c.tuple = Array.prototype.slice.call(arguments).map(function(fn){
            fn.onload =  function(){ c.pool.apply(fn, arguments) };
            fn.chain = c; return fn;
        });
        return c;
    }; g.chain = chain;

    /**
     * @function js
     * Динамическая загрузка javascript
     *
     * @argument { text | url } src источник
     * @argument { Object {container, async, type, onload, onreadystatechange} } opt параметры созадваемого скрипта
     *
     * 1. var head = g.document.getElementsByTagName("head");
     *    head[0].appendChild(s); // записываем в <head></head>
     * 2. g.document.body.appendChild(s); // записываем в <body></body>
     */
    function js(src, opt) {
        if (!src) return null;

        var opt = Object.assign({async:false, type:'text/javascript', container:g.document.body}, opt);
        var s = g.document.createElement('script');
        s.type = opt.type;
        s.async = opt.async; // дождаться заргрузки или нет
        if (opt.hasOwnProperty('id')) s.id = opt.id;
        if (src.match(is_url)) { s.src = src; } else { s.text = src; }
        if (typeof opt.onload === 'funciton') s.onload = onload;
        if (typeof opt.onreadystatechange === 'funciton') s.onreadystatechange = onreadystatechange;

        if (typeof opt.container.appendChild === 'function') opt.container.appendChild(s);
        else console.error('jsRoll::js() Не существущий контейнер', opt.container);
        return s;
    }; g.js = js;

    /**
     * @function xhr
     * Хелпер запросов на основе xmlHttpRequest
     *
     * @argument { String } url (Uniform Resource Locator) путь до шаблона
     * @argument { Boolean } async режим XMLHttpRequest
     * @event { XMLHttpRequest } onload
     * @event { XMLHttpRequest } fail
     * @event { XMLHttpRequest } process
     * @event { XMLHttpRequest } freeze
     * @event { XMLHttpRequest } abort
     *
     * @result { Object }
     */
    function xhr(params){
        var x = new xmlHttpRequest();
        if (!x) return null;

        x.fail = function(fn) {
            if (typeof fn === 'function') return fn.call(x, location.decoder(x.getAllResponseHeaders(), /([^:\s+\r\n]+):\s+([^\r\n]*)/gm));
            return x;
        };

        x.done = function(fn) {
            if (typeof fn === 'function') return fn.call(x, location.decoder(x.getAllResponseHeaders(), /([^:\s+\r\n]+):\s+([^\r\n]*)/gm));
            return x;
        };

        x.process = function(opt) {
            var proc = opt.process;
            x.onreadystatechange = function() {
                if (typeof proc === 'function') return proc.call(x, location.decoder(x.getAllResponseHeaders(), /([^:\s+\r\n]+):\s+([^\r\n]*)/gm));
                else if (x.readyState == 4 && x.status >= 400) return x.fail.call(x, location.decoder(x.getAllResponseHeaders(), /([^:\s+\r\n]+):\s+([^\r\n]*)/gm));
            };

            x.timeout = opt.timeout;
            if (typeof opt.freeze === 'function') {
                x.ontimeout = function () { x.abort(); return opt.freeze.call(x, [opt]); }
            } else {
                x.ontimeout = function () { x.abort(); x.fail.call(x, null); }
            }

            return x;
        };

        x.onload = function(e) {
            x.done.call(x, e, location.decoder(x.getAllResponseHeaders(), /([^:\s+\r\n]+):\s+([^\r\n]*)/gm));
            if (typeof x.after == 'function') x.after.call(this);
            return x;
        };

        if (params && params.hasOwnProperty('responseType')) x.responseType = params['responseType'];
        // x.responseType = 'arraybuffer'; // 'text', 'arraybuffer', 'blob' или 'document' (по умолчанию 'text').
        // x.response - После выполнения удачного запроса свойство response будет содержать запрошенные данные в формате
        // DOMString, ArrayBuffer, Blob или Document в соответствии с responseType.
        var opt = Object.assign({method:'GET',timeout:10000}, params);
        x.method = opt.method.toUpperCase();
        var rs = Object.assign({'Xhr-Version': version,'Content-type':'application/x-www-form-urlencoded'}, (params||{}).rs);
        if (rs['Content-type'] === false || rs['Content-type'].toLowerCase() == 'multipart/form-data') delete rs['Content-type'];

        try {
            for (var i in opt) if (typeof opt[i] == 'function') x[i]=opt[i];
            if ((['GET', 'DELETE'].indexOf(x.method) >= 0) && opt.data) {
                var u = opt.url || g.location;
                opt.url = u  + (u.indexOf('?') !=-1 ? '&':'?') + opt.data;
                opt.data = null;
            }
            if (typeof x.before == 'function') x.before.call(x, opt, x);

            x.open(x.method, opt.url || g.location, opt.async || true, opt.username, opt.password);
            for (var m in rs) x.setRequestHeader(m.trim(), rs[m].trim());
            x.response_header = null;
            x.process(opt).send(opt.data);
        } catch (e) {
            x.abort(); x.fail.call(x, e);
            return x;
        }
        return x;
    }; g.xhr = xhr;

    /**
     * @function InputHTMLElementSerialize
     * Сериализация элемента
     *
     * @param el
     * @param v
     * @returns {*}
     * @constructor
     */
    var InputHTMLElementSerialize = function (el) {
        if (el instanceof HTMLElement) return el.name + '=' + (['checkbox','radio'].indexOf((el.getAttribute('type') || 'text').toLowerCase()) < 0 ? encodeURIComponent(el.value) : (el.checked ? (el.value.indexOf('on') == -1 ? el.value : 1) : (el.value.indexOf('on') == -1 ? '' : 0)));
        return null;
    }; g.InputHTMLElementSerialize = InputHTMLElementSerialize;
    
    var InputHTMLElementValue = function(el, def) {
        var n = undefined;
        if (el instanceof HTMLElement) {
            n = el.value ? (Number(el.value) == el.value ? Number(el.value) : String(el.value)) : (typeof def !== 'undefined' ? def: null);
            if (['checkbox', 'radio'].indexOf((el.getAttribute('type') || 'text').toLowerCase()) > -1) {
                n = el.checked ? (el.value.indexOf('on') == -1 ? n : 1) : (el.value.indexOf('on') == -1 ? (typeof def !== 'undefined' ? def: null) : 0);
            }
        }
        return n;
    }; g.InputHTMLElementValue = InputHTMLElementValue;

    /**
     * @function form
     * Хелпер работы с данными формы
     *
     * @param f DOM элемент форма + f.rolling = ['post','get','put','delete' ets]
     * @param params
     * @returns {result:Object, data: String}}
     */
    Object.defineProperty(JSON, 'form', {
        value: function(f) {
            if (f && !f.hasOwnProperty('MODEL')) {
                Object.defineProperty(f, 'MODEL', {
                    set: function MODEL(d) {
                        if (d && typeof d === 'object') {
                            f.__MODEL__ = d;
                            //TODO: for form elements name as array
                            // var field = /\[([^\]]+)\]/.exec(this.elements[i].name)[1];
                            // if (field && data[field]) this.elements[i].value = data[field];
                            for (var i = 0; i < f.elements.length; i++) if (d.hasOwnProperty(f.elements[i].name)) {
                                f.elements[i].value = d[f.elements[i].name];
                                if (['checkbox', 'radio'].indexOf((f.elements[i].getAttribute('type') || 'text').toLowerCase()) > -1) {
                                    f.elements[i].checked = parseInt(d[f.elements[i].name]) !== 0;
                                }
                            }
                        } else {
                            f.__MODEL__ = {};
                            f.reset();
                        }
                    },
                    get: function MODEL() {
                        f.__MODEL__ = {};
                        for (var i=0; i < f.elements.length; i++) {
                            // var n = this.elements[i].value.length ? new Number(this.elements[i].value) : NaN;
                            // f.__MODEL__[f.elements[i].name || i] = ['checkbox', 'radio'].indexOf((f.elements[i].getAttribute('type') || 'text').toLowerCase()) < 0 ? (isNaN(n) ? f.elements[i].value : n) : (f.elements[i].checked ? (f.elements[i].value.indexOf('on') == -1 ? f.elements[i].value : 1) : (f.elements[i].value.indexOf('on') == -1 ? '' : 0));
                            var field = f.elements[i].name && /\[.*\]$/.test(f.elements[i].name) ? f.elements[i].name.replace(/\[.*\]$/,'') : (f.elements[i].name || String(i));
                            // var value  = this.elements[i].value;
                            // var n = value ? (Number(value) == value ? Number(value) : String(value)) : null;
                            // if (['checkbox', 'radio'].indexOf((f.elements[i].getAttribute('type') || 'text').toLowerCase()) > -1) {
                            //     n = f.elements[i].checked ? (f.elements[i].value.indexOf('on') == -1 ? n : 1) : (f.elements[i].value.indexOf('on') == -1 ? null : 0);
                            // }
                            var n = ['text', 'textarea'].indexOf((f.elements[i].getAttribute('type') || 'text').toLowerCase()) >-1 ? f.elements[i].value : InputHTMLElementValue(f.elements[i]);
                            if ((typeof f.__MODEL__[field] === 'undefined') || (f.__MODEL__[field] === null)) {
                                f.__MODEL__[field] = n;
                            } else if (typeof f.__MODEL__[field] !== 'undefined' && n !== null) {
                                if (typeof f.__MODEL__[field] !== 'object') f.__MODEL__[field] = [f.__MODEL__[field]];
                                f.__MODEL__[field].push(n);
                            }
                        }
                        return f.__MODEL__;
                    }
                });

                f.prepare = function(validator) {
                    var data = [];
                    if (!validator || (typeof validator === 'function' && validator.call(f, data))) {
                        for (var i = 0; i < f.elements.length; i++) { data.push(InputHTMLElementSerialize(f.elements[i])); }
                    } else {
                        f.setAttribute('valid', 0);
                    }
                    return data.join('&');
                };

                f.update = function(data) {
                    for (var i = 0; i < f.elements.length; i++) {
                        if (data[f.elements[i].name]) {
                            f.elements[i].value = data[f.elements[i].name];
                        } else {
                            var field = /\[([^\]]+)\]/.exec(f.elements[i].name)[1];
                            if (field && data[field]) f.elements[i].value = data[field];
                        }
                    }
                    return f;
                };

                f.fail = typeof f.fail == 'function' ? f.fail : function (res) {
                    f.setAttribute('valid', 0);
                    var a = res.form||res.message;
                    if (a) for (var i = 0; i < this.elements.length; i++) {
                        if (a.hasOwnProperty(this.elements[i].name)) this.elements[i].status = 'error';
                        else this.elements[i].status = 'none';
                    }
                    return f;
                };

                f.send = function() {
                    var data = f.prepare(f.validator), before = true, args = arguments;
                    if (f.getAttribute('valid') != 0) {
                        if (typeof f.before == 'function') before = f.before.call(this);
                        if (before == undefined || !!before) {
                            var done = typeof args[0] == 'function' ? function(e, hr) {
                                    f.response_header = hr||{};
                                    var callback = args.shift();
                                    var result = callback.apply(this, args);
                                    return f;
                                } :
                                function(e, hr) {
                                    f.response_header = hr||{};
                                    try {
                                        var res = JSON.parse(this.responseText);
                                    } catch (e) {
                                        res = {result:'error', message: this.status + ': '+ g.HTTP_RESPONSE_CODE[this.status]};
                                    }

                                    if (res.result == 'error' ) {
                                        if (typeof f.fail == 'function') f.fail.call(f, res, hr, args);
                                    } else {
                                        if (typeof f.done == 'function') f.done.call(f, res, hr, args);
                                    }
                                    if (typeof f.after == 'function') { f.after.call(f, res, hr, args) }
                                    return f;
                                };
                            g.xhr(Object.assign({method: f.rest, url: f.action, data: data, done: done}, f.opt));
                        }
                    } else f.setAttribute('valid',1);
                    return f;
                };
            }
            f.setAttribute('valid', 1);
            f.rest = f.getAttribute('rest') || f.method;
            f.validator = f.validator || null;
            f.opt = f.opt || {};

            return f;
        },
        enumerable: false
    });

    /**
     * @function tmpl
     * Хелпер для генерации контескта
     *
     * @argument { String } str (url | html)
     * @argument { JSON } data объект с даннными
     * @argument { undefined | function } cb callback функция
     * @argument { undefined | object } дополнительые методы и своийства
     *
     * @result { String }
     */
    var tmpl = function tmpl( str, data, cb, opt ) {
        var self = Object.merge({
                response_header: null,
                __tmplContext: undefined,
                get tmplContext() {
                    if (this.__tmplContext) this.__tmplContext.owner = self;
                    return this.__tmplContext;
                },
                set tmplContext(v) {
                    this.__tmplContext = v;
                },
                onTmplError: function (type, id, str, args, e ) {
                    console.error('ERROR['+type+'] jsRoll.tmpl()', [id, str], args, e); return;
                }
            }, typeof this !== 'undefined' ? this : {});
        var args = arguments; args[1] = args[1] || {};
        var compile = function( str ) {
            var _e = '_e'+uuid().replace(/-/g,''), source = str.replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[^\r\n]*)|(\<![\-\-\s\w\>\/]*\>)/igm,'').replace(/\>\s+\</g,'><').trim(),tag = ['{%','%}'];
            if (!source.match(/{%(.*?)%}/g) && source.match(/<%(.*?)%>/g)) tag = ['<%','%>'];
            // source = source.replace(/"(?=[^<%]*%>)/g,'&quot;').replace(/'(?=[^<%]*%>)/g,'&#39;');
            return source.length ? new Function(_e,"var p=[], print=function(){ p.push.apply(p,arguments); }; with("+_e+"){p.push('"+
                   source.replace(/[\r\t\n]/g," ").split(tag[0]).join("\t").replace(re("((^|"+tag[1]+")[^\t]*)'","g"),"$1\r").replace(re("\t=(.*?)"+tag[1],"g"),"',$1,'")
                   .split("\t").join("');").split(tag[1]).join("p.push('").split("\r").join("\\'")+"');} return p.join('');") : undefined;
            },
            build = function( str, id ) {
                var isId = typeof id !== 'undefined', data = {}, pattern = null;
                var result = null, after, before, a, pig = g.document.getElementById(id);

                try {
                    if (pig) {
                        var nn = undefined;
                        Array.prototype.slice.call(pig.attributes).forEach(function (i) {
                            if ( i && /^tmpl-*/i.test(i.nodeName.toString()) && (nn=i.nodeName.toString().replace(/^tmpl-/i, '')) )
                                try {
                                    data[nn] = JSON.parse(i.value); //JSON.parse(i.nodeValue);
                                } catch (e) {
                                    data[nn] = i.value;
                                }
                        });
                        if (a = pig.getAttribute('arguments')) try {
                            data = Object.merge(JSON.parse(a) || {}, data);
                        } catch (e) {
                            return self.onTmplError('tmpl-arguments', id, str, args,a);
                        }

                        args[1] = Object.merge(args[1], data);
                        if (before = pig.getAttribute('before')) func(before, self, args);
                    } else {
                        if (opt && typeof opt.before == 'object') {
                            args[1] = Object.assign(args[1], opt.before);
                        } else if (opt && typeof opt.before == 'function') {
                            opt.before.call(self, args);
                        }
                    }

                    if (isId && g.tmpl.cache[id]) {
                        pattern = g.tmpl.cache[id];
                    } else {
                        pattern = compile(str);
                        if (isId) g.tmpl.cache[id] = pattern;
                    }

                    if (!pattern) { return self.onTmplError('tmpl-pattern', id, str, args, 'пустой шаблон') }
                    result = pattern.call(g.tmpl, args[1]);

                    if (typeof cb == 'function') self.tmplContext = cb.call(pattern || g.tmpl, result) || g.tmpl;
                    else if (self.tmplContext instanceof HTMLElement || cb instanceof HTMLElement && (self.tmplContext = cb)) self.tmplContext.innerHTML = result;

                    if (self.tmplContext && pig && (after = pig.getAttribute('after'))) func(after, self.tmplContext, args);
                    else if (opt && typeof opt.after == 'function') opt.after.apply(self.tmplContext, args);

                } catch( e ) { return self.onTmplError('tmpl-build', id, str, args, e) }
                return result;
            };

        try {
            switch ( true ) {
                case str.match(is_url) ? true: false: var id = str.replace(/(\.|\/|\-)/g, '');
                    if (g.tmpl.cache[id]) return build(null, id);
                    var opt = opt || {};  opt.rs = Object.assign(opt.rs||{}, {'Content-type':'text/x-template'});
                    return g.xhr(Object.assign({url:str, async: (typeof cb == 'function'), done: function(e, hr) { self.response_header = hr; build(this.responseText, id); }}, opt));
                case !/[^\w\-\.]/.test(str) : return build( g.document.getElementById( str ).innerHTML, str );
                default: return build( str );
            }
        } catch( e ) { return self.onTmplError('tmpl', id, str, args, e) }
    }; tmpl.cache = {}; g.tmpl = tmpl;

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
        try {
            var s = s || g.localStorage;
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
                    this.p.forEach(function(item){delete this[item];});
                    this.p = [];
                }
            };
        }
        return s;
    }; g.storage = storage();

    /**
     * @function dom
     * Создаёт объект DOM из string
     *
     * @result { DOM | null }
     */
    var dom = function () {
        var p;
        try {
            if ( 'DOMParser' in g ) {
                p = new DOMParser();
                return function(d, mime) {
                    try {
                        return p.parseFromString( d, mime || 'text/xml' );
                    } catch (e) {
                        return null;
                    }
                };
            } else if ( 'ActiveXObject' in g ) {
                p = new ActiveXObject( 'Microsoft.XMLDOM' );
                p.async = 'false';
                return function(d, mime) {
                    try {
                        p.instance.loadXML(d);
                        return p;
                    } catch (e) {
                        return null;
                    }
                };
            }
            return null;
        } catch ( e ) {
            return undefined;
        }

    }; g.dom = dom();

}(window));
