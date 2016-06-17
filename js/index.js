var $ = require("jquery");
var lib = require("./lib/library.js");

require("../sass/global.scss");
require("../sass/init.scss");

$(function() {
	setTimeout(function() {
		window.loadReady = true;
	}, 1000);
	var apiDomain = "";
	if (/webdev/.test(location.origin)) {
		apiDomain = "http://test.www.hiyd.com";
	} else {
		apiDomain = location.origin.replace("m.hiyd.com", "www.hiyd.com");
	}

	var T = {
		checkForm : function(){
			var data = {};

			T.initError();
			if(!T.checkPhone()){
				return false;
			}
			if(!T.checkVCode()){
				return false;
			}
			if(!T.checkQQ()){
				return false;
			}
			data.mobile =  $("#phone").val();
			data.qq = $("#qq").val();
			data.vCode = $("#vCode").val();

			T.initError();
			return data;
		},
		checkPhone: function(){
			var reg = /\d{11}/;
			var phone = $("#phone").val();

			if(!reg.test(phone)){
				$('#phone-error').text('手机格式错误');
				return false;
			}
			return true;
		},
		checkVCode: function(){
			var reg = /\d{4}/;
			var vCode = $("#vCode").val();
			if(!reg.test(vCode)){
				$('#vCode-error').text('请输入4位验证码');
				return false;
			}
			return true;
		},
		checkQQ: function(){
			var reg = /\d{5,12}/;
			var qq = $("#qq").val();

			if(!reg.test(qq)){
				$('#qq-error').text('qq填写错误');
				return false;
			}
			return true;
		},
		sendVCode : function(){
			var data = {};
			var url = apiDomain + '/account/sendVCode2';

			data.mobile = $("#phone").val();
			$.ajax({
	             type : "post",
	             async:false,
	             url : url,
	             data: data,
	             // jsonp: "callbackparam",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
	             // jsonpCallback:"success_jsonpCallback",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
	             success : function(result){
	             	if(result.code == 0){
	             		$('#phone-error').text('');
						lib.showDialog("验证码已发送,请注意查收");
	             		V.countVCode(60);
	             	}else{
						lib.showDialog(result.msg);
	             	}
	             }
	         });
		},
		checkMobile : function(){
			var data = {};
			var phone = $("#phone").val();
			var reg = /\d{11}/;
			var url = apiDomain + '/account/checkMobile';
			if (!reg.test(phone)) {
				$('#phone-error').text('手机格式错误');
				return;
			}
			$('#phone-error').text('');
			data.mobile = phone;
			$.ajax({
	             type : "get",
	             async:false,
	             url : url,
	             data: data,
	             jsonp: "callbackparam",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
	             jsonpCallback:"success_jsonpCallback",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
	             success : function(result){
	                if(result.code == 0){
	                	T.sendVCode();
	                }else{
						lib.showDialog(result.msg);
	                }
	             },
	             error:function(json){
	                console.log(json);
	             }
	         });
		},
		submitBox : function(){
			var url = "/activity/box";
			var data = T.checkForm();
			if(!data){
				return;
			}
			$.post(url,data,function(result){
				if (result.code == 0) {
					$("#login-form").hide();
					$("#qq-code").text(data.qq);
					$("#finish-wrap").show();
				}else{
					lib.showDialog(result.msg);
				}
			});
		},
		initForm : function(){
			$("#login-wrap").css({
					'-webkit-transform': 'translate(-50%,-50%)',
	            			'transform': 'translate(-50%,-50%)',
	            			'top': '50%'
			});
		},
		initError : function(){
			$('#phone-error').text('');
			$('#vCode-error').text('');
			$('#qq-error').text('');
		},
		closeForm : function(){
			$('#phone-error').text('');
			$('#vCode-error').text('');
			$('#qq-error').text('');
			T.initForm();
			$("#login-mask").hide();
			$("#login-wrap").hide();
		}
	} 

	var V = {
		init : function(){
			var ObjMask = $("#login-mask");
			var ObjForm = $("#login-wrap");

			$("input[type='text'],input[type='tel']").focus(function(){
				$("#login-wrap").css({
					'-webkit-transform': 'translate(-50%,0)',
	            			'transform': 'translate(-50%,0)',
	            			'top': '1.2rem'
				});
			}).blur(function(){
				T.initForm();
			});
			$("#btn-login").on('click',function(){
				$("#phone").val('');
				$("#qq").val('');
				$("#vCode").val('');

				$("#finish-wrap").hide();
				$("#login-form").show();
				ObjForm.show();
				ObjMask.show();
			})

			ObjForm.on('click','#getVCode',function(){
				if(!$(this).hasClass("disable")) {
					T.checkMobile();
				}
			});
			ObjMask.on('click',function(){
				T.closeForm();
			});

			ObjForm.on('click','#login',function(){
				T.submitBox();
			});

			ObjForm.on('click','#btn-ok',function(){
				T.closeForm();
			});
			$("#close-form").on('click',function(){
				T.closeForm();
			});
		},
		countVCode: function(seconds) {
			var timer = seconds;
			var st = setInterval(function() {
				if(timer < 0) {
					$("#getVCode").text("获取验证码").removeClass("disable");
					clearTimeout(st);
				} else {
					$("#getVCode").addClass("disable");
					$("#getVCode").text(timer + "秒");
					timer -= 1;
				}
			}, 1000);
		}
	};


	V.init();
});