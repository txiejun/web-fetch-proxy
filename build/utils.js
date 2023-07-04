
/**
 * format time
 * @param timestampOrdate
 * @param format
 * @returns {string}
 */
const formatDate = (timestampOrdate, format = 'YYYY-MM-DD hh:mm:ss') => {
    let _day = null;
    if (timestampOrdate != undefined) {
        if (timestampOrdate instanceof Date) {
            _day = timestampOrdate;
        }
        else {
            _day = new Date(timestampOrdate);
        }
    }
    else {
        _day = new Date();
    }

    let date = {
        "M+": _day.getMonth() + 1,
        "D+": _day.getDate(),
        "h+": _day.getHours(),
        "m+": _day.getMinutes(),
        "s+": _day.getSeconds(),
        "S+": _day.getMilliseconds()
    };
    if (/(Y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (_day.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            let $1 = RegExp.$1;
            let v = date[k];
            let str = v;
            if ($1.length == 2) {
                str = ("00" + v).substr(("" + v).length);
            }
            format = format.replace($1, str);
        }
    }
    return format;
}


module.exports = {
    formatDate,
};
