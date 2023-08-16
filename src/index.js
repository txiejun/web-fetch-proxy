/*
 * description: proxying fetch function in browser
 * author: txiejun
 * email: txiejun@126.com
 */

var prototype = 'prototype'

function Handler(resolve, reject) {
  this._resolve = resolve
  this._reject = reject
}

Handler[prototype] = Object.create({
  resolve: function resolve(res) {
    this._resolve && this._resolve(res.response)
  },
  reject: function reject(err) {
    this._reject && this._reject(err.error)
  }
})

function makeHandler(next) {
  function sub(resolve, reject) {
    Handler.call(this, resolve, reject)
  }

  sub[prototype] = Object.create(Handler[prototype])
  sub[prototype].next = next
  return sub
}

function proxyFetch(proxy, win) {
  const onRequest = proxy.onRequest
  const onResponse = proxy.onResponse
  const onError = proxy.onError
  const originalFetch = win.fetch
  if (!originalFetch) {
    console.error("fetch is null")
    return {}
  }

  /**
   * @param url A URL string or a Request object
   * @param init config
   */
  win.fetch = function (url, init) {
    let config = { url, init }
    return new Promise((resolve, reject) => {
      let RequestHandler = makeHandler(function (cfg) {
        cfg = cfg || config;
        callFetch(cfg)
      })
      let ResponseHandler = makeHandler(function (res) {
        this.resolve(res)
      })
      let ErrorHandler = makeHandler(function (err) {
        this.reject(err)
      })
      const callFetch = (config) => {
        originalFetch.apply(this, [config.url, config.init]).then((response) => {
          let handler = new ResponseHandler(resolve, reject)
          let ret = {
            config: config,
            response: response,
          }
          if (!onResponse) {
            return handler.resolve(ret)
          }
          onResponse(ret, handler)
        }).catch((error) => {
          let handler = new ErrorHandler(resolve, reject)
          let err = { config: config, error: error }
          if (onError) {
            onError(err, handler)
          } else {
            handler.next(err)
          }
        })
      }
      if (onRequest) {
        onRequest(config, new RequestHandler(resolve, reject))
      }
      else {
        callFetch(config)
      }
    })
  }

  function unProxy() {
    win.fetch = originalFetch
    originalFetch = undefined
  }

  return {
    originalFetch,
    unProxy
  }
}

export default function webFetchProxy(proxy, win) {
  win = win || window;
  return proxyFetch(proxy, win)
}