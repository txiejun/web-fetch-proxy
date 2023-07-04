/*!
 * fetch-proxy.js - 1.0.0 - 2023-07-04
 * 
 * Copyright (c) 2023 txiejun;
 * Licensed under the MIT license
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.fetchProxy = factory());
})(this, (function () { 'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var readOnlyError = createCommonjsModule(function (module) {
	function _readOnlyError(name) {
	  throw new TypeError("\"" + name + "\" is read-only");
	}
	module.exports = _readOnlyError, module.exports.__esModule = true, module.exports["default"] = module.exports;
	});

	var _readOnlyError = unwrapExports(readOnlyError);

	var prototype = 'prototype';
	function Handler(resolve, reject) {
	  this._resolve = resolve;
	  this._reject = reject;
	}
	Handler[prototype] = Object.create({
	  resolve: function resolve(res) {
	    this._resolve && this._resolve(res.response);
	  },
	  reject: function reject(err) {
	    this._reject && this._reject(err.error);
	  }
	});
	function makeHandler(next) {
	  function sub(resolve, reject) {
	    Handler.call(this, resolve, reject);
	  }
	  sub[prototype] = Object.create(Handler[prototype]);
	  sub[prototype].next = next;
	  return sub;
	}
	function proxyFetch(proxy, win) {
	  var onRequest = proxy.onRequest;
	  var onResponse = proxy.onResponse;
	  var onError = proxy.onError;
	  var originalFetch = win.fetch;
	  if (!originalFetch) {
	    console.error("fetch is null");
	    return {};
	  }

	  /**
	   * @param url A URL string or a Request object
	   * @param init config
	   */
	  win.fetch = function (url, init) {
	    var _this = this;
	    var config = {
	      url: url,
	      init: init
	    };
	    return new Promise(function (resolve, reject) {
	      var RequestHandler = makeHandler(function (cfg) {
	        cfg = cfg || config;
	        callFetch(cfg);
	      });
	      var ResponseHandler = makeHandler(function (res) {
	        this.resolve(res);
	      });
	      var ErrorHandler = makeHandler(function (err) {
	        this.reject(err);
	      });
	      var callFetch = function callFetch(config) {
	        originalFetch.apply(_this, [config.url, config.init]).then(function (response) {
	          var handler = new ResponseHandler(resolve, reject);
	          var ret = {
	            config: config,
	            response: response
	          };
	          if (!onResponse) {
	            return handler.resolve(ret);
	          }
	          onResponse(ret, handler);
	        })["catch"](function (error) {
	          var handler = new ErrorHandler(resolve, reject);
	          var err = {
	            config: config,
	            error: error
	          };
	          if (onError) {
	            onError(err, handler);
	          } else {
	            handler.next(err);
	          }
	        });
	      };
	      if (onRequest) {
	        onRequest(config, new RequestHandler(resolve, reject));
	      } else {
	        callFetch(config);
	      }
	    });
	  };
	  function unProxy() {
	    win.fetch = originalFetch;
	    _readOnlyError("originalFetch");
	  }
	  return {
	    originalFetch: originalFetch,
	    unProxy: unProxy
	  };
	}
	function fetchProxy(proxy, win) {
	  win = win || window;
	  return proxyFetch(proxy, win);
	}

	return fetchProxy;

}));
