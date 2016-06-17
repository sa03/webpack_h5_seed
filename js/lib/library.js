var $ = require("jquery");
require("./artDialog.js");
var loadingDelayHandler = 0;
var loadingTimeoutHandler = 0;
var loadDialog;

var lib = {
	/**
     * js获取url参数的值，(函数内部decodeURIComponent值)
     * @author benzhan
     * @param {string} name 参数名
     * @return {string} 参数值
     */
	getParam() {
		//先获取#后面的参数
        var str = document.location.hash.substr(2);
        var value = getParam2(name, str);
        if (value == null) {
            str = document.location.search.substr(1);
            value = getParam2(name, str);
        }

        return value;
	},
	getParam2() {
		//获取参数name的值
        var reg = new RegExp("(^|!|&)" + name + "=([^&]*)(&|$)");

        //再获取?后面的参数
        r = str.match(reg);
        if (r != null) {
            try {
                return decodeURIComponent(r[2]);
            } catch (e) {
                console.log(e + "r[2]:" + r[2]);
                return null;
            }
        }
        return null;
	},
	/**
     * js设置url中hash参数的值, (函数内部encodeURIComponent传入的value参数)
     * @author benzhan
     * @param {string} name 参数名
     * @return {string} value 参数值
     */
    setParam(name, value, causeHistory) {
		var hash = document.location.hash.substr(2);
		if ($.type(name) === "object") {
			// 支持 setParam(value, causeHistory)的写法
			causeHistory = value;
			value = name;

			for (var key in value) {
				hash = setParam2(key, value[key], hash);
			}
		} else {
			hash = setParam2(name, value, hash);
		}

		if (causeHistory) {
			document.location.hash = "!" + hash;
		} else {
			if (history.replaceState) {
				history.replaceState({}, null, "#!" + hash);
			} else {
				console.error("history.replaceState:" + history.replaceState);
			}
		}
	},
	setParam2(name, value, str) {
		if ($.type(name) === "object") {
            // 支持 setParam(value, causeHistory)的写法
            str = value;
            value = name;
            for (var key in value) {
				str = setParam2(key, value[key], str);
            }
            return str;
        } else {
            var prefix = str ? "&" : "";
            var reg = new RegExp("(^|!|&)" + name + "=([^&]*)(&|$)");
            r = str.match(reg);
            if (r) {
                if (r[2]) {
                    var newValue = r[0].replace(r[2], value);
                    str = str.replace(r[0], newValue);
                } else {
                    var newValue = prefix + name + "=" + value + "&";
                    str = str.replace(r[0], newValue);
                }
            } else {
                var newValue = prefix + name + "=" + value;
                str += newValue;
            }

            return str;
        }
	},
	/**
     * 删除锚点后的某个参数
     * @author benzhan
     * @param {string} name 参数名
     */
	removeParam(name, causeHistory) {
		var hash = document.location.hash.substr(2);
        var reg = new RegExp("(^|!|&)" + name + "=([^&]*)(&|$)");
        r = hash.match(reg);
        if (r) {
            hash = hash.replace(r[0], "&");
        }
        if (causeHistory) {
            document.location.hash = "!" + hash;
        } else {
            if (history.replaceState) {
                history.replaceState({}, null, "#!" + hash);
            } else {
                console.error("history.replaceState:" + history.replaceState);
            }
        }
	},
	_deserialize(value) {
        if (typeof value != 'string') {
            return undefined
        }
        try {
            return JSON.parse(value)
        } catch (e) {
            return value || undefined
        }
    },
	getCookie(name) {
		var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return decodeURIComponent(arr[2]);
        else
            return null;
	},
	getLocalData(key) {
        return getParam(key) || _deserialize(localStorage.getItem(key));
    },
    setLocalData(key, val) {
        localStorage.setItem(key, JSON.stringify(val))
    },
    showLoading(text, timeout, cancelable, delay) {
		// 超时时间为15s
        timeout = timeout || 15000;
        // 0.5s后才显示loading
        delay = delay || 500;

        if (cancelable == null) {
            cancelable = true;
        } else {
            cancelable = !!cancelable;
        }

        if (loadingDelayHandler) {
			return;
        }

        loadingDelayHandler = setTimeout(function() {
			loadDialog = dialog().showModal();

			loadingTimeoutHandler = setTimeout(function() {
				hideLoading();
				showTip("加载超时，请稍后再试");
			}, timeout);

			$(".ui-popup-backdrop").on("click", function() {
				loadDialog && loadDialog.close().remove();
				loadDialog = null;
			});
        }, delay);
    },
    hideLoading() {
		loadingDelayHandler && clearTimeout(loadingDelayHandler);
		loadingDelayHandler = 0;
		loadingTimeoutHandler && clearTimeout(loadingTimeoutHandler);
		loadingTimeoutHandler = 0;

        if (!OujSdk || !OujSdk.hideLoading()) {
            loadDialog && loadDialog.close().remove();
            loadDialog = null;
        }
    },
    showTip(msg, timeout) {
        if (!msg) { return; }
        timeout = timeout || 2000;
        if (!OujSdk || !OujSdk.showTip(msg, timeout)) {
            var d = dialog({
                content: msg
            }).width(window.innerWidth * 0.75).showModal();

            //2秒后自动关闭
            setTimeout(function() {
                d.close().remove();
            }, timeout);

            $(".ui-popup-backdrop").on(BDY.click, function() {
                try {
                    d.close().remove();
                } catch (e) { }
            });
        }
    },
    checkWXAgent() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    },
    showDialog(msg, callback, title, buttonLabels) {
        title = title || "提示";
        buttonLabels = buttonLabels || "确定";
        var d = dialog({
            title: title,
            content: msg,
            skin: 'weui-dialog',
            okValue: buttonLabels,
            ok: function() {
                callback && callback(true);
                d.close().remove();
            }
        });
        d.width(window.innerWidth * 0.75).showModal();
    },
	confirm(msg, callback, title, buttonLabels) {
        title = title || "提示";
        buttonLabels = buttonLabels || "确定,取消";
        var d = dialog({
            title: title,
            content: msg,
            skin: 'weui-dialog',
            okValue: buttonLabels.split(",")[0],
            ok: function() {
                callback(true);
                d.close().remove();
            },
            cancelValue: buttonLabels.split(",")[1],
            cancel: function() {
                callback(false);
                d.close().remove();
            }
        });
        d.width(window.innerWidth * 0.75).showModal();
    }
}

module.exports = lib;