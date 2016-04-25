/*
 * 函数节流 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次
 * @param  fn    {function} 需要调用的函数
 * @param  delay {number}   延迟时间，单位毫秒
 * @return       {function} 实际调用函数
 */
var throttle = function(func, delay) {
    var last = 0
    return function() {
        var curr = +new Date()
        if (curr - last > delay) {
            func.apply(this, arguments)
            last = curr
        }
    }
}

/*
 * 函数去抖 返回函数连续调用时，空闲时间必须大于或等于 delay，fn 才会执行
 * @param  fn    {function} 要调用的函数
 * @param  delay {number}   空闲时间
 * @return       {function} 实际调用函数
 */
var debounce = function(func, delay) {
    var last
    return function() {
        var ctx = this,
            args = arguments
        clearTimeout(last)
        last = setTimeout(function() {
            func.apply(ctx, args)
        }, delay)
    }
}

export default {
    throttle,
    debounce
}