//京东上门安装文案
var shmazhTips = $('#shmazh').val();

function isEmptyText(text) {
    if (text && text.trim() != "") {
        return false;
    }
    return true;
}

function appendText(origin, toReplace, prefix) {
    var spanIndex = origin.indexOf(toReplace);
    var innerHtml = origin;
    if (spanIndex > -1) {
        var tail = origin.substr(spanIndex);
        innerHtml = origin.substr(0, spanIndex) + prefix + tail;
    }
    return innerHtml;
}

function buildJdShipmentText(origin, additionalText) {
    var innerHtml = origin;
    var spanIndex = origin.indexOf('</span>');
    if (spanIndex > -1) {
        spanIndex += '</span>'.length;
        innerHtml = origin.substr(0, spanIndex);
        var tail = origin.substr(spanIndex);
        if (tail.indexOf('预计') > -1) {
            innerHtml += appendText(tail, '预计', additionalText);
            //innerHtml = innerHtml.replace('&nbsp;送达','<br/>送达');
        } else {
            innerHtml += additionalText + origin.substr(spanIndex);
        }
    } else {
        innerHtml = isEmptyText(origin) ? defaultAdditionalText : origin;
    }
    return innerHtml;
}

function setJdShipmentCalendarDate(text) {
    var jdShipmentDiv = $("#jd_shipment_calendar_date");
    if (jdShipmentDiv && !jdShipmentDiv[0]) {
        return;
    }
    var additionalText = jdShipmentDiv.data("text");
    var defaultText = '<span class="ftx-03">配送时间：</span>工作日、双休日与节假日均可送货';
    var innerHtml = "";
    if (!isEmptyText(additionalText)) {
        additionalText = additionalText.trim();
        var defaultAdditionalText = '<span class="ftx-03">配送时间：</span>' + additionalText + '工作日、双休日与节假日均可送货';
        if (isEmptyText(text) || defaultText == text.trim()) {
            innerHtml = defaultAdditionalText;
        } else {
            var spanIndex = text.indexOf('</span>');
            if (spanIndex > -1) {
                innerHtml = buildJdShipmentText(text, additionalText);
            } else {
                innerHtml = isEmptyText(text) ? defaultAdditionalText : text;
            }
        }
    } else {
        innerHtml = isEmptyText(text) ? defaultText : text;
    }
    jdShipmentDiv.html(innerHtml);
}

function setdjJdShipmentCalendarDate() {
    var text = $("#shipment_date_div").html();
    var djjdShipmentDiv = $("#shipment_date_div");
    if (djjdShipmentDiv && !djjdShipmentDiv[0]) {
        return;
    }
    var additionalText = djjdShipmentDiv.data("text");
    var defaultText = '<span class="ftx-03">配送时间：</span>工作日、双休日与节假日均可送货';
    var innerHtml = "";
    if (!isEmptyText(additionalText)) {
        additionalText = additionalText.trim();
        var defaultAdditionalText = '<span class="ftx-03">配送时间：</span>' + additionalText + '工作日、双休日与节假日均可送货';
        if (isEmptyText(text) || defaultText == text.trim()) {
            innerHtml = defaultAdditionalText;
        } else {
            var spanIndex = text.indexOf('</span>');
            if (spanIndex > -1) {
                innerHtml = buildJdShipmentText(text, additionalText);
            } else {
                innerHtml = isEmptyText(text) ? defaultAdditionalText : text;
            }
        }
    } else {
        innerHtml = isEmptyText(text) ? defaultText : text;
    }
    djjdShipmentDiv.html(innerHtml);
}

function isDoRefresh(cartJson, type) {
    //如果商品串不相等则刷新商品清单
    var sopCartJson = $("#sopCartJson").val();
    //如果保存的是大家电配送时间也需要刷新，否则安装时间偏移量计算不准确
    var isRefreshInstallDate = $("#is_refresh_installdate").val();
    if (cartJson != sopCartJson || isRefreshInstallDate == "1") {
        $("#is_refresh_installdate").val("");
        save_Pay(payId);
        return;
    }
    //否则刷新价格
    var actionUrl = OrderAppConfig.DynamicDomain + "/payAndShip/getAdditShipment.action";
    var payId = $('.payment-item.item-selected').attr('payId');
    var otype = $('.payment-item.item-selected').attr('onlinepaytype');
    var reset311 = $('#reset_promise_311').val();
    var presaleSelectType;
    if ($(".presale-payment-item").hasClass("item-selected")) {
        presaleSelectType = $(".presale-payment-item.item-selected").attr("selectType");
    }

    if (isEmpty(payId)) {
        payId = 4;
    }
    if (isEmpty(otype)) {
        otype = 0;
    }
    var promiseTagType = $("#zxj_promiseTagType").val();//获取京准达时效类型
    promiseTagType = doLocalStorageValue(promiseTagType, "zxj_promiseTagType");
    var param = "paymentId=" + payId;
    param = param + "&shipParam.reset311=" + reset311 + "&shipParam.onlinePayType=" + otype + "&promiseTagType=" + promiseTagType;
    if (presaleSelectType != null) {
        param = param + "&shipParam.payType4YuShou=" + presaleSelectType;
    }
    param = addFlowTypeParam(param);
    var easyBuyFlag = $("#easyBuyFlag").val();
    if (easyBuyFlag == "1" || easyBuyFlag == "2") {
        param += "&ebf=" + easyBuyFlag;
    }
    //分期参数
    var fq = $("#fq").val();
    if (fq) {
        param += "&fq=" + fq;
    }

    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: actionUrl,
        data: param,
        cache: false,
        success: function (dataResult, textStatus) {
            // 没有登录跳登录
            if (isUserNotLogin(dataResult)) {
                goToLogin();
                return;
            }
            var jsonO = dataResult;
            var flag = 0;
            if (jsonO.usedPickView != null && jsonO.usedPickView != "" && jsonO.usedPickView.selfpickSiteAvailable === true) {
                flag = 1;
            }
            if (jsonO.nearestPickView != null && jsonO.nearestPickView != "") {
                npv = jsonO.nearestPickView;
                if (npv.pickId != 0) {
                    flag = 1;
                }
            }
            if (flag == 1) {
                $("#justPickCopy").val("1");
            } else {
                $("#justPickCopy").val("0");
            }
            shipmentTips618();

            // 更新续重运费相关的总重和超额重量
            $("#allFreightWeight").val(dataResult.allFreightWeight);
            $("#overFreightWeight").val(dataResult.overFreightWeight);
            $("#allSxFreightWeight").val(dataResult.allSxFreightWeight);
            $("#overSxFreightWeight").val(dataResult.overSxFreightWeight);
            $("#allWmFreightWeight").val(dataResult.allWmFreightWeight);
            $("#overWMFreightWeight").val(dataResult.overWmFreightWeight);

            $("#allXuZhongWeightSamSXShow").val(dataResult.allXuZhongWeightSamSXShow);
            $("#overXuZhongWeightSamSX").val(dataResult.overXuZhongWeightSamSX);
            $("#allXuZhongWeightSamGenShow").val(dataResult.allXuZhongWeightSamGenShow);
            $("#overXuZhongWeightSamGen").val(dataResult.overXuZhongWeightSamGen);
            $("#allXuZhongWeightSCFShow").val(dataResult.allXuZhongWeightSCFShow);
            $("#overXuZhongWeightSCF").val(dataResult.overXuZhongWeightSCF);
            refreshFreightWeight();
            resetFreightDetailWeight();
            if (dataResult.cjshFlag) {
                if ($(".orderInfo-tip").css("display") != 'none') {
                    $("#cjshtip").html($("#cjsh").val());
                } else {
                    $(".orderInfo-tip").show();
                    $("#cjshtip").html($("#cjsh").val());
                }
            } else {
                $("#cjshtip").html("温馨提示：订单中存在不支持7天无理由退货商品，请确认相关商品信息后提交订单。");
                orderInfoTip2();
            }

            doResetShipTime(dataResult.resetShipTime);
            //处理311、411日历信息
            doDealCalenderInfo(dataResult);
            //处理大家电京准达和标准达日历信息
            if (typeof dataResult.promiseDjdBzd !== 'undefined') {
                doDealBigShipCalenderInfo(dataResult);
                setdjJdShipmentCalendarDate();
            }

            var promiseSop = dataResult.promiseSopViewList;

            $("#promiseSopViewList").val(JSON.stringify(promiseSop));

            //新版日历
            if (dataResult.calendarVersion == 1 || dataResult.calendarVersion == 2) {
                newVersionCalendarzy(dataResult);
                $("#calendarVersion").val(dataResult.calendarVersion);
            }
            //处理sop日历信息
            if (typeof dataResult.promiseSopViewList !== 'undefined' && dataResult.promiseSopViewList != null && dataResult.promiseSopViewList.length != 0 && !$(".selfPickInCommonItem").hasClass("item-selected")) {
                doDealSopCalenderInfo(dataResult);
            }
            //处理sop大件日历
            if (typeof $("#saveParam_sopShipment").val() !== 'undefined' && $("#saveParam_sopShipment").val() != null && $("#saveParam_sopShipment").val() != "") {
                doDealSopBigShipCalenderInfo(dataResult);
            }

            //处理自提信息
            doSelfPickStatus(dataResult.selfPick, 0, dataResult.gsd);

            var selfPickShutDownFlag = dataResult.isSelfPickShutDown;

            if (selfPickShutDownFlag == 1) {
                //轻松购和礼品购过来的按照原来的逻辑走，不相当于降级
                if (easyBuyFlag == "1" || easyBuyFlag == "2" || isGiftBuy()) {
                    $("#selfPickShutDownFlag").attr("value", "0");
                } else {
                    if ($(".selfPickInCommonItem").hasClass("item-selected")) {
                        $("#jd_shipment_item").addClass("hide");
                        $("#_jdpay").addClass("hide");
                        $("#gsd_shipment_item").addClass("hide");
                        $("#car_shipment_item").addClass("hide");
                        var honorVenderIds = $("#saveParam_honorVenderIds").val();
                        if (honorVenderIds != null && honorVenderIds != "") {
                            var honors = honorVenderIds.split(",");
                            for (var i = 0; i < honors.length; i++) {
                                $("#Honor_shipment_item_" + honors[i]).addClass("hide");
                                $("#Honor_tip_" + honors[i]).addClass("hide");
                                $("#honorFeetip").addClass("hide");
                            }
                        }
                    } else {
                        $("#pick_shipment_item").addClass("hide");
                    }
                    $("#selfPickShutDownFlag").attr("value", "1");
                }
            } else {
                $("#selfPickShutDownFlag").attr("value", "0");
            }

            var selfPickOptimize = dataResult.selfPickOptimize;
            if (selfPickOptimize == 1) {
                $("#selfPickOptimize").attr("value", "1");
            } else {
                $("#selfPickOptimize").attr("value", "0");
            }
            if (typeof $("#bestCouponCheck")[0] !== 'undefined') {
                $("[id='bestCouponCheck']").attr("checked", 'true');
                getBastCouponList($("#bestCouponCheck")[0]);
                showCouponItem(true);
            }
            //加载库存、获取店铺名称
            window.orderApi.loadSkuStock();
            doGetVendorName();
            showFreightInsurance(dataResult);
            locShopInfo();
            //根据商品属性加载订单备注信息
            //loadOrderRemark();
            showPickDateList();

            flushOrderPrice(dataResult.orderPrice, false);
        },
        error: function (XMLHttpResponse) {
            //alert("系统繁忙，请稍后再试！");
            goOrder();
        }
    });
}

//根据name获取localStorage中对应的值
function doLocalStorageValue(element_value, local_name) {
    if (element_value == "") {
        var ptt = localStorage.getItem(local_name);
        if (ptt != "undefined" && ptt != "" && ptt != null && ptt != "null") {
            element_value = ptt;
        }
    }
    return element_value;
}

//根据name获取LocalStorage的队对象
function getLocalStorageObject(local_name) {
    var obj = localStorage.getItem(local_name);
    var djd_param_obj = null;
    if (obj != null && obj != undefined && obj != "") {
        djd_param_obj = JSON.parse(obj);
    }
    return djd_param_obj;
}

//大仓极速达信息设置
function setLocalStorageObject(dataResult) {
    var obj = new Object();
    if (dataResult != null && dataResult != undefined) {
        obj.speedHour = dataResult.promiseDjdJsd.speedHour;
        var obj_sendPay = dataResult.promiseDjdJsd.sendPay;
        if (obj_sendPay != null && obj_sendPay != undefined) {
            obj.sendPay = JSON.stringify(obj_sendPay);
        }
        obj.codDate = dataResult.promiseDjdJsd.codDate;
        obj.speedMark = dataResult.promiseDjdJsd.speedMark;
        obj.carriageMoney = dataResult.promiseDjdJsd.carriageMoney;
        obj.txtTag = dataResult.promiseDjdJsd.txtTag;
        obj.txtMsg = dataResult.promiseDjdJsd.txtMsg;
        obj = JSON.stringify(obj);
    }
    localStorage.setItem("djd_promiseParam", obj);
}

//保存大家电日历后,查询配送信息标识
function setDjdCaldarSaveFlag() {
    localStorage.setItem("djd_caldar_save_flag", "1");
}

//大家电极速达送达的时间
function do_djd_jsd_speedHour() {
    var speedHour = "2";//极速达送达时效
    var obj = getLocalStorageObject("djd_promiseParam");
    if (obj != null) {
        speedHour = obj.speedHour;
    }
    return speedHour;
}

//大家电极速达送达时间文案
function do_djd_jsd_msg() {
    var obj = getLocalStorageObject("djd_promiseParam");
    if (obj != null) {
        var txtMsg = obj.txtMsg;
        $("#tab_jsd_msg").html(txtMsg);
    } else {
        $("#tab_jsd_msg").html("下单后或支付成功后2小时送达");
    }

}

//保存大家电日历后,查询配送信息标识
function setDjdCaldarSaveFlag() {
    localStorage.setItem("djd_caldar_save_flag", "1");
}

function doResetShipTime(resetShipTime) {
    if (resetShipTime == null) {
        return
    }
    if (resetShipTime.reset) {
        setJdShipmentCalendarDate(resetShipTime.shipName);
    }
}

/**
 * 处理sop日历信息显示
 * 1、配送时间话术展示
 * @return
 */
function doDealSopCalenderInfo(dataResult) {
    var shipment = new Object();
    var promiseSop = dataResult.promiseSopViewList;

    $("#promiseSopViewList").val(JSON.stringify(promiseSop));

    for (var i = 0; i < promiseSop.length; i++) {
        var promiseItem = promiseSop[i];
        var venderId = promiseItem.venderId;
        var promiseTxt = promiseItem.showSopText;
        var PromisesopJdTxt = promiseItem.showSopJdText;
        shipment.venderId = venderId;
        if (promiseItem.sopVenderPickState) {
            $("#sop_pick_item_" + venderId).removeClass("hide");
        }
        if (promiseItem.sopVenderPickShipment) {
            $("#sop_pick_" + venderId).removeClass("hide");
            $("#sop_shipment_" + venderId).addClass("hide");
            $("#sop_jd_shipment_item_" + venderId).removeClass("curr");
            $("#sop_other_shipment_item_" + venderId).removeClass("curr");
            shipment.sopShipment = "70";
        } else {
            if (promiseItem.sopOtherShipment) {
                if (promiseTxt != null) {
                    $("#sop_shipment_date_" + venderId).html(promiseTxt);
                } else {
                    $("#sop_shipment_date_" + venderId).html('<span class="mode-label ftx-03">配送时间：</span> <div class="mode-infor">工作日、双休日与节假日均可送货</div>');
                }
                if (!$("#Honor_shipment_item_" + venderId).hasClass("curr") && !$("#sop_Consolidator_item_" + venderId).hasClass("curr") && !$("#sop_gsd_item_" + venderId).hasClass("curr")) {
                    $("#sop_other_shipment_item_" + venderId).addClass("curr");
                }
                $("#sop_jd_shipment_item_" + venderId).removeClass("curr");
                $("#sop_pick_item_" + venderId).removeClass("curr");
                shipment.sopShipment = "67";
                if (promiseItem.sopVenderPickState) {
                    $("#sop_pick_" + venderId).addClass("hide");
                    $("#sop_shipment_" + venderId).removeClass("hide");
                    $("#sopPickStoreinfo_" + venderId).addClass("hide");
                    $("#noSopPickStoreinfo_" + venderId).addClass("hide");
                    $("#sopPickStorePhoneinfo_" + venderId).addClass("hide");
                }
            } else if (promiseItem.sopJdShipment) {

                if (PromisesopJdTxt != null) {
                    $("#sop_shipment_date_" + venderId).html(PromisesopJdTxt);
                } else {
                    $("#sop_shipment_date_" + venderId).html('<span class="mode-label ftx-03">配送时间：</span> <div class="mode-infor">工作日、双休日与节假日均可送货</div>');
                }
                if ($("#Honor_shipment_item_" + venderId).hasClass("curr")) {
                    $("#sop_jd_shipment_item_" + venderId).removeClass("curr");
                } else {
                    $("#sop_jd_shipment_item_" + venderId).addClass("curr");
                }
                $("#sop_other_shipment_item_" + venderId).removeClass("curr");
                $("#sop_pick_item_" + venderId).removeClass("curr");
                shipment.sopShipment = "68";
                if (promiseItem.sopVenderPickState) {
                    $("#sop_pick_" + venderId).addClass("hide");
                    $("#sop_shipment_" + venderId).removeClass("hide");
                    $("#sopPickStoreinfo_" + venderId).addClass("hide");
                    $("#noSopPickStoreinfo_" + venderId).addClass("hide");
                    $("#sopPickStorePhoneinfo_" + venderId).addClass("hide");
                }
            }
            if (promiseItem.jdPromiseType != 2) {
                if (promiseItem.days != null && promiseItem.days.length > 0) {
                    $("#sop_shipment_botton_" + venderId).show();
                    $("#sop_jzdshipment_botton_" + venderId).hide();
                } else {
                    $("#sop_shipment_botton_" + venderId).hide();
                }
                if (typeof promiseItem.newVersionCalendar !== 'undefined' && promiseItem.newVersionCalendar != null && promiseItem.newVersionCalendar.length > 2) {
                    $("#sop_shipment_botton_" + venderId).show();
                    $("#sop_jzdshipment_botton_" + venderId).hide();
                }
            }
            if (promiseItem.jdPromiseType == 2) {
                $("#sop_jzdshipment_botton_" + venderId).show();
                $("#sop_shipment_botton_" + venderId).hide();
            }

            if (promiseItem.supportSopPromise311) {
                $("#delivery-info-li-zxj-sop_" + venderId).show();
                $("#sop_zxj_show_id_" + venderId).removeClass("hide");
                $("#sop_311_show_id_" + venderId).removeClass("hide");
                shipment.supportSopPromise311 = promiseItem.supportSopPromise311;
            } else {
                $("#delivery-info-li-zxj-sop_" + venderId).hide();
                $("#sop_zxj_show_id_" + venderId).addClass("hide");
                $("#sop_311_show_id_" + venderId).addClass("hide");
            }

            shipment.promiseDate = promiseItem.promiseDate;
            shipment.promiseSendPay = promiseItem.promiseSendPay;
            shipment.promiseTimeRange = promiseItem.promiseTimeRange;
            shipment.batchId = promiseItem.batchId;
            shipment.jdPromiseType = promiseItem.jdPromiseType;
        }
        if ($("#sop_Consolidator_item_" + venderId).hasClass("curr")) {
            $("#sop_shipment_" + venderId).addClass("hide");
        }
//         if(promiseItem.promiseGsdView !=null && promiseItem.promiseGsdView.sopGsdShipment){
//        	 $("#sop_gsd_item_"+venderId).addClass("curr")
//         }else{
//        	 $("#sop_gsd_item_"+venderId).removeClass("curr")
//         }
        if ($("#sop_gsd_item_" + venderId).hasClass("curr")) {
            $("#sop_shipment_" + venderId).addClass("hide");
            $("#gsd_shipment_" + venderId).removeClass("hide");
            $("#sop_jd_shipment_item_" + venderId).removeClass("curr");
            $("#sop_other_shipment_item_" + venderId).removeClass("curr");
            if (promiseItem.promiseGsdView != null && promiseItem.promiseGsdView.hasCalendar) {
                if (promiseItem.promiseGsdView.forcedChoice && $("#forcedChoiceItem_" + venderId).val() != "1") {
                    $("#gsd-new-times-wmr_" + venderId).show();
                    $("#gsd-new-times-ymr_" + venderId).hide();
                } else {
                    $("#gsd_shipment_calendar_date_" + venderId).html(promiseItem.promiseGsdView.shipText);
                    $("#gsd-new-times-ymr_" + venderId).show();
                    $("#gsd-new-times-wmr_" + venderId).hide();
                }
                if (promiseItem.promiseGsdView.forcedChoice && promiseItem.promiseGsdView.selectedItem != 1 && promiseItem.promiseGsdView.promiseTimeRange == "立即送达") {
                    $("#gsd-new-times-wmr_" + venderId).show();
                    $("#gsd-new-times-ymr_" + venderId).hide();
                }
                $("#gsd-old-ships_" + venderId).hide();
                shipment.promiseDate = promiseItem.promiseGsdView.promiseDate;
                shipment.promiseTimeRange = promiseItem.promiseGsdView.promiseTimeRange;
                shipment.batchId = promiseItem.promiseGsdView.batchId;
                shipment.promiseSendPay = promiseItem.promiseGsdView.sendpay;
                shipment.selectedItem = promiseItem.promiseGsdView.selectedItem;
                shipment.sopShipment = "71";
            } else {
                $("#gsd_date_" + venderId).html("<span class='ftx-03'>极速达：工作日、双休日与节假日均可送货</span>");
                $("#gsd_shipment_" + venderId).removeClass("hide");
                $("#gsd-old-ships_" + venderId).show();
                $("#gsd-new-times-ymr_" + venderId).hide();
                $("#gsd-new-times-wmr_" + venderId).hide();
            }
        } else {
            $("#gsd_shipment_" + venderId).addClass("hide");
        }
    }
    $("#saveParam_sopShipment").val(JSON.stringify(shipment));
}

var calendarSopJzd;

//sop商品点击选择配送方式，显示sop日历
function doEditSopShipment(venderId, selectCalenType, newCalendarType) {
    var id = "sopjd_shipment_calendar_v2_" + venderId;
    if ($("#sop_gsd_item_" + venderId).hasClass("curr")) {
        id = "gsd_shipment_calendar_v2_" + venderId;
        newCalendarType = "0";
    }
    if (id != null && ($("#calendarVersion").val() == "1" || $("#calendarVersion").val() == "2") && typeof $("#" + id).html() !== 'undefined' && $("#" + id).html() != "" && $("#" + id).html() != null && $("#" + id).html() != "[]") {
        showDeliveryDialog(id, newCalendarType);
        return;
    }
    seajs.use(['user/purchase/2.0.0/js/deliveryCalendarFreight.js', 'user/purchase/2.0.0/js/deliveryCalendar.js'], function (DeliveryCalendarFreight, DeliveryCalendar) {
        //seajs.use('user/purchase/2.0.0/js/deliveryCalendar.js', function(DeliveryCalendar) {
        var venderList = jQuery.parseJSON($("#promiseSopViewList").val());
        var venderItem = null;
        var venderItembig = null;

        for (var i = 0; i < venderList.length; i++) {

            if (venderId == venderList[i].venderId) {

                venderItem = venderList[i];
                venderItembig = venderList[i].sopBigShipmentDateView;
                break;
            }

        }
        var hData = venderItem.timeRangeTitle;
        var dData = venderItem.days;
        var jzdhData;
        var jzddData;
        if (venderItem.supportSopPromise311) {
            jzdhData = venderItem.sopPromise311View.timeRangeTitle;
            jzddData = venderItem.sopPromise311View.days;
        }
        if ($("#sop_gsd_item_" + venderId).hasClass("curr")) {
            hData = venderItem.promiseGsdView.timeRangeTitle;
            dData = venderItem.promiseGsdView.days;
        }
        var _width = 650;

        var calendarHtml = $("#sop_shipment_hidediv").html();
        $('body').dialog({
            title: '配送时间',
            width: _width,
            type: 'html',
            source: calendarHtml,
            onReady: function () {
                var xy = new Array();
                var mn = new Array();
                xy[0] = venderItem.date_x;
                xy[1] = venderItem.date_y;
                if ($("#sop_gsd_item_" + venderId).hasClass("curr")) {
                    xy[0] = venderItem.promiseGsdView.date_x;
                    xy[1] = venderItem.promiseGsdView.date_y;
                    $("#sopjsd").show();
                    $("#sopbzd").hide();
                } else {
                    $("#sopjsd").hide();
                    $("#sopbzd").show();
                }
                if (!venderItem.supportSopPromise311) {
                    $("#sopjzd").hide();
                } else {
                    $("#sopjzd").show();
                }
                if (venderItem.supportSopPromise311) {
                    mn[0] = venderItem.sopPromise311View.date_x;
                    mn[1] = venderItem.sopPromise311View.date_y;
                }
                xy[0] = venderItem.date_x;
                xy[1] = venderItem.date_y;
                if (venderItem.supportSopPromise311 && selectCalenType == 2) {
                    $("#sopjzd").addClass("tab-item-selected");
                    $("#sopbzd").removeClass("tab-item-selected");
                } else {
                    $("#sopjzd").removeClass("tab-item-selected");
                    $("#sopbzd").addClass("tab-item-selected");
                }
                if (selectCalenType == 2) {
                    $("#tab_sop_div").addClass("hide");
                    $("#tab_sop_jzd_div").removeClass("hide");
                } else {
                    $("#tab_sop_jzd_div").addClass("hide");
                    $("#tab_sop_div").removeClass("hide");
                }
                if (venderItem.sopPromise311View != null && venderItem.sopPromise311View.calendarTagText != null) {
                    $("#jzd_calendar_tag_sop").html(venderItem.sopPromise311View.calendarTagText);
                }
                var calendar = new DeliveryCalendar(hData, dData, $('#date-delivery-sop'), xy);
                //var calendar1;
                if (venderItem.supportSopPromise311) {
                    calendarSopJzd = new DeliveryCalendarFreight(jzdhData, jzddData, $('#date-delivery-sop-jzd'), mn);
                }
                $('#timeSavejzdSop').bind('click', function () {
                    var shipment = new Object();
                    var shopCalendarTag;
                    if (typeof $(".delivery-gap-item.delivery-gap-item-selected").attr("onclick") !== 'undefined' && $(".delivery-gap-item.delivery-gap-item-selected").attr("onclick").split(",").length > 0) {
                        var tag = $(".delivery-gap-item.delivery-gap-item-selected").attr("onclick").split(",")[0];
                        if (tag != null && tag.length > 0 && tag.split("(").length > 1) {
                            shopCalendarTag = tag.split("(")[1];
                        }
                    }
                    if (venderItembig != null) {
                        shipment.bigOffset = venderItembig.offset;
                    }
                    if (JSON.stringify(calendarSopJzd.result) == "{}" && venderItem.sopPromise311View.date_x == null) {
                        alert("您还没有指定配送时间");
                        return;
                    } else if (JSON.stringify(calendarSopJzd.result) != "{}") {
                        //给隐藏域赋值
                        var data = (calendarSopJzd.result['date-range']).split('-');
                        var saveParam_batchId = null;
                        if (data.length > 1) {
                            saveParam_batchId = data[1];
                        }
                        venderItem.promiseDate = calendarSopJzd.result.day;  //配送日期
                        venderItem.promiseTimeRange = calendarSopJzd.result.range; //配送时间段
                        venderItem.batchId = saveParam_batchId;
                        venderItem.promiseSendPay = data[0];
                        venderItem.jdPromiseType = 2;

                        shipment.venderId = venderItem.venderId;
                        if (venderItem.sopJdShipment) {
                            shipment.sopShipment = "68";
                        } else if (venderItem.sopGsdShipment) {
                            shipment.sopShipment = "71";
                        } else {
                            shipment.sopShipment = "67";
                        }

                        shipment.batchId = saveParam_batchId;
                        shipment.promiseSendPay = data[0];
                        shipment.promiseDate = calendarSopJzd.result.day;  //配送日期
                        shipment.promiseTimeRange = calendarSopJzd.result.range; //配送时间段
                        shipment.jdPromiseType = 2;
                        if (shopCalendarTag != null) {
                            shipment.shopCalendarTag = shopCalendarTag;
                        }

                        $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                        $("#promiseSopViewList").val(JSON.stringify(venderList));
                    } else {
                        shipment.venderId = venderItem.venderId;
                        if (venderItem.sopJdShipment) {
                            shipment.sopShipment = "68";
                        } else {
                            shipment.sopShipment = "67";
                        }

                        shipment.promiseDate = venderItem.sopPromise311View.promiseDate;  //配送日期
                        shipment.promiseTimeRange = venderItem.sopPromise311View.promiseTimeRange; //配送时间段
                        shipment.batchId = venderItem.sopPromise311View.batchId;
                        shipment.promiseSendPay = venderItem.sopPromise311View.promiseSendPay;
                        shipment.jdPromiseType = 2;
                        if (shopCalendarTag != null) {
                            shipment.shopCalendarTag = shopCalendarTag;
                        }
                        $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                    }
                    $("#reset_promise_311").val("1"); //是否需要重置配送日期
                    jQuery.closeDialog();
                    //保存数据
                    doSavePayAndShipmentInfo("sop_shipment");
                });
                $('#timeSaveSop').bind('click', function () {

                    var shipment = new Object();
                    if (venderItembig != null) {
                        shipment.bigOffset = venderItembig.offset;
                    }

                    if (JSON.stringify(calendar.result) == "{}" && venderItem.date_x == null && venderItem.promiseGsdView.date_x == null) {
                        alert("您还没有指定配送时间");
                        return;
                    } else if (JSON.stringify(calendar.result) != "{}") {
                        $("#forcedChoiceItem_" + venderItem.venderId).val("1");
                        if (calendar.result.range == "立即送达") {
                            venderItem.selectedItem = "1";
                            shipment.selectedItem = "1";
                        } else {
                            venderItem.selectedItem = "2";
                            shipment.selectedItem = "2";
                        }
                        //给隐藏域赋值
                        var data = (calendar.result['date-range']).split('-');

                        var saveParam_batchId = null;
                        if (data.length > 1) {
                            saveParam_batchId = data[1];
                        }
                        venderItem.promiseDate = calendar.result.day;  //配送日期
                        venderItem.promiseTimeRange = calendar.result.range; //配送时间段
                        venderItem.batchId = saveParam_batchId;
                        venderItem.promiseSendPay = data[0];
                        venderItem.jdPromiseType = 1;

                        shipment.venderId = venderItem.venderId;
                        if (venderItem.sopJdShipment) {
                            shipment.sopShipment = "68";
                        } else if (venderItem.sopGsdShipment) {
                            shipment.sopShipment = "71";
                        } else {
                            shipment.sopShipment = "67";
                        }

                        shipment.promiseDate = calendar.result.day;  //配送日期
                        shipment.promiseTimeRange = calendar.result.range; //配送时间段
                        shipment.batchId = saveParam_batchId;
                        shipment.promiseSendPay = data[0];
                        shipment.jdPromiseType = 1;
                        $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                        $("#promiseSopViewList").val(JSON.stringify(venderList));

                    } else {
                        shipment.venderId = venderItem.venderId;
                        if (venderItem.sopJdShipment) {
                            shipment.sopShipment = "68";
                        } else {
                            shipment.sopShipment = "67";
                        }

                        shipment.promiseDate = venderItem.promiseDate;  //配送日期
                        shipment.promiseTimeRange = venderItem.promiseTimeRange; //配送时间段
                        shipment.batchId = venderItem.batchId;
                        shipment.promiseSendPay = venderItem.promiseSendPay;
                        if ($("#sop_gsd_item_" + venderId).hasClass("curr")) {
                            $("#forcedChoiceItem_" + venderItem.venderId).val("1");
                            shipment.sopShipment = "71";
                            shipment.promiseDate = venderItem.promiseGsdView.promiseDate;  //配送日期
                            shipment.promiseTimeRange = venderItem.promiseGsdView.promiseTimeRange; //配送时间段
                            shipment.batchId = venderItem.promiseGsdView.batchId;
                            shipment.promiseSendPay = venderItem.promiseGsdView.promiseSendPay;
                            if (venderItem.promiseGsdView.promiseTimeRange == "立即送达") {
                                venderItem.selectedItem = "1";
                                shipment.selectedItem = "1";
                            } else {
                                venderItem.selectedItem = "2";
                                shipment.selectedItem = "2";
                            }
                        } else {
                            shipment.jdPromiseType = 1;
                        }
                        $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                    }
                    $("#reset_promise_311").val("1"); //是否需要重置配送日期
                    jQuery.closeDialog();
                    doSavePayAndShipmentInfo("sop_shipment");
                });

            } //onready end
        });
    })
}

function doSopSwithTab(type) {
    if (type == 'jzd') {
        $("#tab_sop_div").addClass("hide");
        $("#tab_sop_jzd_div").removeClass("hide");
        $("#sopjzd").addClass("tab-item-selected");
        $("#sopbzd").removeClass("tab-item-selected");
    }
    if (type == 'bzd') {
        $("#tab_sop_jzd_div").addClass("hide");
        $("#tab_sop_div").removeClass("hide");
        $("#sopjzd").removeClass("tab-item-selected");
        $("#sopbzd").addClass("tab-item-selected");
    }
}

/**
 * 加载门店页面
 * @return
 */
function getSelfDeliveryStores(type, sopvenderId, storeId) {
    var url = OrderAppConfig.DynamicDomain + "/payAndShip/getSelfDeliveryStores.action";
    var provinceId = 0;
    var cityId = 0;
    var countyId = 0;
    var pageIndex = 1;
    var pageSize = 30;
    var tit = "";
    if (type == 1) {
        provinceId = $("#consignee-list .item-selected").attr("provinceId");
        cityId = $("#consignee-list .item-selected").attr("cityId");
        //countyId = $("#consignee-list .item-selected").attr("countyId");
        tit = "选择门店";
    }
    if (type == 2) {
        provinceId = $("#consignee-list .item-selected").attr("provinceId");
        cityId = $("#consignee-list .item-selected").attr("cityId");
        //countyId = $("#consignee-list .item-selected").attr("countyId");
        tit = "更换门店";
    }
    if (provinceId == null || typeof provinceId == 'undefined') {
        provinceId = 0;
    }
    if (cityId == null || typeof cityId == 'undefined') {
        cityId = 0;
    }
    if (countyId == null || typeof countyId == 'undefined') {
        countyId = 0;
    }
    url = url + "?shipParam.provinceId=" + provinceId + "&shipParam.cityId=" + cityId + "&shipParam.countyId=" + countyId + "&shipParam.venderId=" + sopvenderId;
    url = url + "&shipParam.pageIndex=" + pageIndex + "&shipParam.pageSize=" + pageSize + "&shipParam.storeId=" + storeId;
    url = addFlowTypeParam(url);
    $('body').dialog({
        title: tit,
        width: 556,
        height: 490,
        type: 'iframe',
        iframeTimestamp: false,
        source: url
    });
}

window.getSelfDeliveryStores = getSelfDeliveryStores;


/**
 * 处理大家电日历信息显示
 * @return
 */
function doDealBigShipCalenderInfo(dataResult) {
    if (dataResult.success == false) {
        $("#delivery-info-li-djd").hide();
        $("#shipment_date_div").html('<span class="ftx-03">配送时间：</span>工作日、双休日与节假日均可送货');
        return;
    }
    $("#bigshipment_bzd_support").val("0");
    $("#sopCartJson").val(dataResult.cartJson);
    if (dataResult.promiseDjdBzd.support) {
        $("#bigshipment_bzd_support").val("1");
        $("#bigshipment_bzd_shipAndInstall").val(dataResult.promiseDjdBzd.shipAndInstall);
        $("#bigshipment_bzd_type").val(dataResult.promiseDjdBzd.type);
        $("#djdBzd_show_id").removeClass("hide");
        if (dataResult.promiseDjdBzd.type == 1) { //如果支持大家电标准达日历
            //设置日历参数
            $("#calendar_big_bzd_hdata").val(JSON.stringify(dataResult.promiseDjdBzd.timeRangeTitle));
            $("#calendar_big_bzd_ddata").val(JSON.stringify(dataResult.promiseDjdBzd.days));
            //设置日历坐标
            $("#calendar_big_bzd_x").val(dataResult.promiseDjdBzd.date_x);
            $("#calendar_big_bzd_y").val(dataResult.promiseDjdBzd.date_y);
            //设置默认值
            $("#big_bzdrl_last_sel_promiseDate").val(dataResult.promiseDjdBzd.promiseDate);
            $("#big_bzdrl_last_sel_promiseTimeRange").val(dataResult.promiseDjdBzd.promiseTimeRange);
            $("#big_bzdrl_last_sel_promiseSendPay").val(dataResult.promiseDjdBzd.promiseSendPay);
            $("#big_bzdrl_last_sel_offset").val(dataResult.promiseDjdBzd.offset);
            $("#big_bzdrl_last_sel_batchId").val(dataResult.promiseDjdBzd.batchId);
        } else {
            $("#bigItemCodDates").val(JSON.stringify(dataResult.promiseDjdBzd.bigItemCodDates));
        }
        $("#delivery-info-li-djd").hide();//先置为隐藏
    }
    $("#bigshipment_jzd_support").val("0");
    if (dataResult.promiseDjdJzd.support) {
        $("#bigshipment_jzd_support").val("1");
        $("#djdJzd_show_id").removeClass("hide");
        //设置日历参数
        $("#calendar_big_hdata").val(JSON.stringify(dataResult.promiseDjdJzd.timeRangeTitle));
        $("#calendar_big_ddata").val(JSON.stringify(dataResult.promiseDjdJzd.days));
        //设置日历坐标
        $("#calendar_big_x").val(dataResult.promiseDjdJzd.date_x);
        $("#calendar_big_y").val(dataResult.promiseDjdJzd.date_y);
        //设置上次选中的日期，时间段和sendpay
        $("#big_last_sel_promiseDate").val(dataResult.promiseDjdJzd.promiseDate);
        $("#big_last_sel_promiseTimeRange").val(dataResult.promiseDjdJzd.promiseTimeRange);
        $("#big_last_sel_promiseSendPay").val(dataResult.promiseDjdJzd.promiseSendPay);
        $("#big_last_sel_batchId").val(dataResult.promiseDjdJzd.batchId);
        $("#big_last_sel_offset").val(dataResult.promiseDjdJzd.offset);

        $("#delivery-info-li-djd").show();
    }/*else{
		$("#delivery-info-li-djd").hide();
	}*/
    //大件极速达显示
    $("#bigshipment_jsd_support").val("0");
    if (dataResult.promiseDjdJsd.supportSpeedArrive) {
        $("#bigshipment_jsd_support").val("1");
        $("#djdJsd_show_id").removeClass("hide");
        //大件仓信息存储
        setLocalStorageObject(dataResult);

        $("#delivery-info-li-djd").show();
    }

    // 京东快递tips
    if (dataResult.promiseDjdJzd.support || dataResult.promiseDjdBzd.support) {
        $("#bigitem_shipment_item .qmark-icon").attr('data-tips', '此订单支持预约配送，您可以选择指定的时间段');
    } else {
        $("#bigitem_shipment_item .qmark-icon").attr('data-tips', '由京东公司负责配送，速度很快，还接受上门刷卡付款服务');
    }
    var isOtherShipmentType = $("#isOtherShipmentType").val();
    if (dataResult.promiseDjdBzd.selected) {
        var shipAndInstall = $("#bigshipment_bzd_shipAndInstall").val();
        $("#bigshipment_select_support").val("2");

        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val("4");
        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val(dataResult.promiseDjdBzd.promiseDate);
        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val(dataResult.promiseDjdBzd.promiseTimeRange);
        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val(dataResult.promiseDjdBzd.promiseSendPay);
        $("#saveParam_" + isOtherShipmentType + "BigItemBatchId").val(dataResult.promiseDjdBzd.batchId);
        if (isOtherShipmentType == "jd") {
            $("#saveParam_jdBigItemShipTimeOffset").val(dataResult.promiseDjdBzd.offset);
            $("#shipment_date_div").html(dataResult.promiseDjdBzd.showBigShipText);
        } else {
            $("#saveParam_otherBigItemShipOffset").val(dataResult.promiseDjdBzd.offset);
            $("#othershipment_date_div").html(dataResult.promiseDjdBzd.showBigShipText);
        }

        if (typeof dataResult.installDates !== 'undefined' && dataResult.installDates != null) {

            if (shipAndInstall == 1) {

                var installDate = null;
                var installDates = dataResult.installDates;
                if (typeof installDates !== 'undefined' && installDates != null && $("#isOtherShipmentType").val() == "jd") {
                    for (var i = 0; i < installDates.length; i++) {
                        if (installDates[i].selected) {
                            installDate = installDates[i].date;
                            break;
                        }
                    }
                }

                $("#shipAndInstall").show();
                if (dataResult.promiseDjdBzd.showBigShipText.indexOf(installDate) > 0) {
                    $("#shipAndInstall_title").html('<font color="blue">支持送装一体</font>：由安装商带货上门同步为您安装！');
                } else {
                    $("#shipAndInstall_title").html('配送和安装选择同一天，可支持送装一体服务');
                }

            } else {
                $("#shipAndInstall").hide();
            }


            var jdOrOther = $("#isOtherShipmentType").val();
            $("#bigItemJzdInstallTimeOffest").val(dataResult.installJzdOffset);
            $("#bigItemInstallTimeOffest").val(dataResult.installOffset);
            $("#saveParam_jdBigItemInstallTimeOffest").val(dataResult.installOffset);
            $("#saveParam_otherBigItemInstallTimeOffset").val(dataResult.installOffset);
            if (jdOrOther == "jd") {
                flushInstallDate(dataResult.installDates);
            } else {
                flushOtherInstallDate(dataResult.installDates);
            }
        }

    }
    if (dataResult.promiseDjdJzd.selected) {
        $("#bigshipment_select_support").val("1");

        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val("5");
        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val(dataResult.promiseDjdJzd.promiseDate);
        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val(dataResult.promiseDjdJzd.promiseTimeRange);
        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val(dataResult.promiseDjdJzd.promiseSendPay);
        $("#saveParam_" + isOtherShipmentType + "BigItemBatchId").val(dataResult.promiseDjdJzd.batchId);
        if (isOtherShipmentType == "jd") {
            $("#saveParam_jdBigItemShipTimeOffset").val(dataResult.promiseDjdJzd.offset);
            $("#shipment_date_div").html(dataResult.promiseDjdJzd.showBigShipText);
        } else {
            $("#saveParam_otherBigItemShipOffset").val(dataResult.promiseDjdJzd.offset);
            $("#othershipment_date_div").html(dataResult.promiseDjdJzd.showBigShipText);
        }

        if (typeof dataResult.installJzdDates !== 'undefined' && dataResult.installJzdDates != null) {
            $("#shipAndInstall_title").html('京准达暂不支持送装一体服务');
            $("#shipAndInstall").show();
            var jdOrOther = $("#isOtherShipmentType").val();
            $("#bigItemJzdInstallTimeOffest").val(dataResult.installJzdOffset);
            $("#bigItemInstallTimeOffest").val(dataResult.installOffset);
            $("#saveParam_jdBigItemInstallTimeOffest").val(dataResult.installJzdOffset);
            $("#saveParam_otherBigItemInstallTimeOffset").val(dataResult.installJzdOffset);
            if (jdOrOther == "jd") {
                flushInstallDate(dataResult.installJzdDates);
            } else {
                flushOtherInstallDate(dataResult.installJzdDates);
            }
        }
    }

    if (dataResult.promiseDjdJsd.selected) {
        $("#bigshipment_select_support").val("3");

        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val("6");
        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val(dataResult.promiseDjdJsd.codDate);
        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val(dataResult.promiseDjdJsd.businessTime);
        var djd_jsd_sendPay = dataResult.promiseDjdJsd.sendPay;
        if (djd_jsd_sendPay != null && djd_jsd_sendPay != undefined && djd_jsd_sendPay != "") {
            djd_jsd_sendPay = JSON.stringify(djd_jsd_sendPay);
            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val(dataResult.promiseDjdJsd.sendPay);
        }
        var speedHour = do_djd_jsd_speedHour();
        if (isOtherShipmentType == "jd") {
            $("#shipment_date_div").html('<span class="ftx-03">配送时间：</span><font id="speedFreightNote">极速达（' + speedHour + '小时之内送达）</font>');
        } else {
            $("#othershipment_date_div").html('<span class="ftx-03">配送时间：</span><font id="speedFreightNote">极速达（' + speedHour + '小时之内送达）</font>');
        }

        if (typeof dataResult.installJsdDates !== 'undefined' && dataResult.installJsdDates != null) {
            $("#shipAndInstall_title").html('京准达暂不支持送装一体服务');
            var jdOrOther = $("#isOtherShipmentType").val();
            $("#saveParam_jdBigItemInstallTimeOffest").val(dataResult.installJsdOffset);
            $("#saveParam_otherBigItemInstallTimeOffset").val(dataResult.installJsdOffset);
            if (jdOrOther == "jd") {
                flushInstallDate(dataResult.installJsdDates);
            } else {
                flushOtherInstallDate(dataResult.installJsdDates);
            }
        }
    }
}

/**
 * 处理sop大件日历信息显示
 * @return
 */
function doDealSopBigShipCalenderInfo(dataResult) {
    var shipment = jQuery.parseJSON($("#saveParam_sopShipment").val());
    var promiseSop = dataResult.promiseSopViewList;

    $("#promiseSopViewList").val(JSON.stringify(promiseSop));

    for (var i = 0; i < promiseSop.length; i++) {
        var promiseItem = promiseSop[i];
        var venderId = promiseItem.venderId;
        shipment.venderId = venderId;
        var bigShipment;
        $("#delivery-info-li-dj-sop_" + venderId).hide();
        //标准达
        if (promiseItem.jdDjdPromiseType != 2) {
            bigShipment = promiseItem.sopBigShipmentDateView;
        }
        //京准达
        if (promiseItem.jdDjdPromiseType == 2) {
            bigShipment = promiseItem.bigShipmentJzdDateView;
        }
        if (bigShipment != null) {
            var bigPromiseTxt = bigShipment.showBigShipText;

            if (bigPromiseTxt != null) {
                $("#sop_big_shipment_date_" + venderId).html(bigPromiseTxt);
            } else {
                $("#sop_big_shipment_date_" + venderId).html('<span class="mode-label ftx-03">配送时间：</span> <div class="mode-infor">工作日、双休日与节假日均可送货</div>');
            }

            if (promiseItem.sopOtherShipment) {

                $("#sop_big_other_shipment_item_" + venderId).addClass("curr");
                $("#sop_big_jd_shipment_item_" + venderId).removeClass("curr");

            } else if (promiseItem.sopJdShipment) {

                $("#sop_big_jd_shipment_item_" + venderId).addClass("curr");
                $("#sop_big_other_shipment_item_" + venderId).removeClass("curr");

            }
            //标准达
            if (promiseItem.jdDjdPromiseType != 2) {
                if ((bigShipment.bigItemCodDates != null && bigShipment.bigItemCodDates.length > 0) || bigShipment.days != null && bigShipment.days.length > 0) {
                    $("#sop_big_shipment_botton_" + venderId).show();
                    $("#sop_jzdbig_shipment_botton_" + venderId).hide();
                } else {
                    $("#sop_big_shipment_botton_" + venderId).hide();
                }
            }
            //京准达
            if (promiseItem.jdDjdPromiseType == 2) {
                $("#sop_jzdbig_shipment_botton_" + venderId).show();
                $("#sop_big_shipment_botton_" + venderId).hide();
            }
            if (promiseItem.supportBigShipmentJzd) {
                $("#delivery-info-li-dj-sop_" + venderId).show();
                $("#sop_dj_show_id_" + venderId).removeClass("hide");
                $("#sop_dj311_show_id_" + venderId).removeClass("hide");
            } else {
                $("#delivery-info-li-dj-sop_" + venderId).hide();
                $("#sop_dj_show_id_" + venderId).addClass("hide");
                $("#sop_dj311_show_id_" + venderId).addClass("hide");
            }
            shipment.bigPromiseDate = bigShipment.promiseDate;
            shipment.bigPromiseSendPay = bigShipment.promiseSendPay;
            shipment.bigPromiseTimeRange = bigShipment.promiseTimeRange;
            shipment.bigBatchId = bigShipment.batchId;
            shipment.bigOffset = bigShipment.offset;
        }
    }
    $("#saveParam_sopShipment").val(JSON.stringify(shipment));
}

//sop大件商品点击选择配送方式，显示sop大件配送日历
function doEditSopBigShipment(venderId, jdDjdPromiseType, newCalendarType) {
    seajs.use(['user/purchase/2.0.0/js/deliveryCalendarFreight.js', 'user/purchase/2.0.0/js/deliveryCalendar.js'], function (DeliveryCalendarFreight, DeliveryCalendar) {
        //seajs.use('user/purchase/2.0.0/js/deliveryCalendar.js', function(DeliveryCalendar) {
        var venderList = jQuery.parseJSON($("#promiseSopViewList").val());
        var venderItem = null;
        var venderItemZxj = null;
        var jzdVenderItem = null;
        for (var i = 0; i < venderList.length; i++) {

            if (venderId == venderList[i].venderId) {

                venderItem = venderList[i].sopBigShipmentDateView;
                venderItemZxj = venderList[i];
                jzdVenderItem = venderList[i].bigShipmentJzdDateView;
                venderItem.venderId = venderList[i].venderId;
                if (venderList[i].sopJdShipment) {
                    venderItem.sopShipment = "68";
                } else {
                    venderItem.sopShipment = "67";
                }
                break;
            }

        }
        var hData = venderItem.timeRangeTitle;
        var dData = venderItem.days;
        var _width = 660;
        if (dData.length > 8) {
            _width = _width + (dData.length - 8) * 53;
        }
        var jzdhData = null;
        var jzddData = null;
        if (venderItemZxj.supportBigShipmentJzd) {
            jzdhData = jzdVenderItem.timeRangeTitle;
            jzddData = jzdVenderItem.days;
        }

        var calendarHtml = $("#sop_bigShipment_hidediv").html();
        $('body').dialog({
            title: '配送时间',
            width: _width,
            type: 'html',
            source: calendarHtml,
            onReady: function () {
                if (venderItemZxj.supportBigShipmentJzd) {
                    if (jzdVenderItem.type == "1") {
                        var mn = new Array();
                        mn[0] = jzdVenderItem.date_x;
                        mn[1] = jzdVenderItem.date_y;
                        var calendar1 = new DeliveryCalendarFreight(jzdhData, jzddData, $('#sop-big-jzd-date-delivery'), mn);
                    } else {
                        var bigItemCodDates = jzdVenderItem.bigItemCodDates;

                        var bigHtml = '<div class="date-box"><div class="date-list"><ul>';

                        for (var i = 0; i < bigItemCodDates.length; i++) {
                            bigHtml += '<li class="li_shipment" shipDate_offset="' + bigItemCodDates[i].offset + '"  shipDate_date="' + bigItemCodDates[i].date + '" shipDate_weekDay="' + bigItemCodDates[i].week + '" onclick="doSwithBigShip(' + venderId + ',this)">';
                            bigHtml += bigItemCodDates[i].date + '<span class="data">' + bigItemCodDates[i].week + '</span></li>';
                        }
                        bigHtml += "</ul></div>";

                        bigHtml += '<div class="ftx-03 mt10"><i class="date-delivery-icon"></i>'
                            + $('#ddycShipTip').val()
                            + '<div class="op-btns mt10 ac"> <a id="timeSaveSopDjjzd" href="javascript:void(0);" class="btn-1"> 确定 </a>'
                            + '<a href="javascript:jQuery.closeDialog();"  class="btn-9 ml10"> 取消 </a> </div>';
                        $('#tab_sop_dj_jzd_div').html(bigHtml);

                        var curSelBigItemShipOffset = jzdVenderItem.offset;
                        var isOk = false;
                        $(".li_shipment").each(function (index, item) {
                            if (curSelBigItemShipOffset != null && $(this).attr("shipDate_offset") == curSelBigItemShipOffset) {
                                $(this).removeClass().addClass("li_shipment selected");
                                isOk = true;
                                return;
                            }
                        });

                        //如果没有值，则选中第一个
                        if (!isOk) {
                            $(".li_shipment").eq(0).removeClass().addClass("li_shipment selected");
                        }
                    }
                } else {
                    $("#tab_sop_dj_jzd_div").addClass("hide");
                    $("#djsopjzd").addClass("hide");
                }
                if (jdDjdPromiseType == 2) {
                    $("#djsopjzd").addClass("tab-item-selected");
                    $("#djsopbzd").removeClass("tab-item-selected");
                    $("#tab_sop_bzd_div").addClass("hide");
                    $("#tab_sop_dj_jzd_div").removeClass("hide");
                } else {
                    $("#djsopjzd").removeClass("tab-item-selected");
                    $("#djsopbzd").addClass("tab-item-selected");
                    $("#tab_sop_dj_jzd_div").addClass("hide");
                    $("#tab_sop_bzd_div").removeClass("hide");
                }
                if (venderItem.type == "1") {
                    var xy = new Array();
                    xy[0] = venderItem.date_x;
                    xy[1] = venderItem.date_y;
                    var calendar = new DeliveryCalendar(hData, dData, $('#sop-big-date-delivery'), xy);
                } else {
                    var bigItemCodDates = venderItem.bigItemCodDates;

                    var bigHtml = '<div class="date-box"><div class="date-list"><ul>';

                    for (var i = 0; i < bigItemCodDates.length; i++) {
                        bigHtml += '<li class="li_shipment" shipDate_offset="' + bigItemCodDates[i].offset + '"  shipDate_date="' + bigItemCodDates[i].date + '" shipDate_weekDay="' + bigItemCodDates[i].week + '" onclick="doSwithBigShip(' + venderId + ',this)">';
                        bigHtml += bigItemCodDates[i].date + '<span class="data">' + bigItemCodDates[i].week + '</span></li>';
                    }
                    bigHtml += "</ul></div>";

                    bigHtml += '<div class="ftx-03 mt10"><i class="date-delivery-icon"></i>'
                        + $('#ddycShipTip').val()
                        + '<div class="tips-618 mt20 hide tips-618-for-calendar">'
                        + '    <div class="tips-con">'
                        + '        <p class="tips-m">双11大促恰逢周末，请确认好收货地址和时间以保证货物及时送达。</p>'
                        + '    </div>'
                        + '</div>'
                        + '<div class="op-btns mt10 ac"> <a id="timeSaveSopBzd" href="javascript:void(0);" class="btn-1"> 确定 </a>'
                        + '<a href="javascript:jQuery.closeDialog();"  class="btn-9 ml10"> 取消 </a> </div>';
                    $('#tab_sop_bzd_div').html(bigHtml);

                    var curSelBigItemShipOffset = venderItem.offset;
                    var isOk = false;
                    $(".li_shipment").each(function (index, item) {
                        if (curSelBigItemShipOffset != null && $(this).attr("shipDate_offset") == curSelBigItemShipOffset) {
                            $(this).removeClass().addClass("li_shipment selected");
                            isOk = true;
                            return;
                        }
                    });

                    //如果没有值，则选中第一个
                    if (!isOk) {
                        $(".li_shipment").eq(0).removeClass().addClass("li_shipment selected");
                    }
                }
                $('#timeSaveSopDjjzd').bind('click', function () {
                    $("#reset_promise_311").val("1"); //是否需要重置配送日期
                    var shipment = new Object();
                    shipment.venderId = venderItem.venderId;
                    shipment.sopShipment = venderItem.sopShipment;
                    shipment.bigOffset = venderItem.offset;
                    shipment.jdDjdPromiseType = 2;
                    if (venderItemZxj != null) {
                        shipment.promiseDate = venderItemZxj.promiseDate;
                        shipment.batchId = venderItemZxj.batchId;
                        shipment.promiseSendPay = venderItemZxj.promiseSendPay;
                        shipment.promiseTimeRange = venderItemZxj.promiseTimeRange;
                    }
                    if (jzdVenderItem.type == "1") {
                        if (JSON.stringify(calendar1.result) == "{}" && jzdVenderItem.date_x == null) {
                            alert("您还没有指定配送时间");
                            return;
                        } else if (JSON.stringify(calendar1.result) != "{}") {
                            //给隐藏域赋值
                            var data = (calendar1.result['date-range']).split('-');

                            var saveParam_batchId = null;
                            if (data.length > 1) {
                                saveParam_batchId = data[1];
                            }

                            shipment.bigPromiseDate = calendar1.result.day;  //配送日期
                            shipment.bigPromiseTimeRange = calendar1.result.range; //配送时间段
                            shipment.bigBatchId = saveParam_batchId;
                            shipment.bigPromiseSendPay = data[0];
                            $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                            $("#promiseSopViewList").val(JSON.stringify(venderList));

                        } else {

                            shipment.bigPromiseDate = calendar1.result.day;  //配送日期
                            shipment.bigPromiseTimeRange = calendar1.result.range; //配送时间段
                            shipment.bigBatchId = jzdVenderItem.batchId;
                            shipment.bigPromiseDate = jzdVenderItem.promiseDate;
                            shipment.bigPromiseTimeRange = jzdVenderItem.promiseTimeRange;
                            shipment.bigPromiseSendPay = jzdVenderItem.promiseSendPay;

                            $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                        }
                        doSavePayAndShipmentInfo();
                        jQuery.closeDialog();

                    } else {
                        shipment.bigOffset = $('.li_shipment.selected').attr("shipDate_offset");
                        $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                        doSavePayAndShipmentInfo();
                        jQuery.closeDialog();
                    }

                });

                $('#timeSaveSopBzd').bind('click', function () {
                    $("#reset_promise_311").val("1"); //是否需要重置配送日期
                    var shipment = new Object();
                    shipment.venderId = venderItem.venderId;
                    shipment.sopShipment = venderItem.sopShipment;
                    shipment.bigOffset = venderItem.offset;
                    shipment.jdDjdPromiseType = 1;
                    if (venderItemZxj != null) {
                        shipment.promiseDate = venderItemZxj.promiseDate;
                        shipment.batchId = venderItemZxj.batchId;
                        shipment.promiseSendPay = venderItemZxj.promiseSendPay;
                        shipment.promiseTimeRange = venderItemZxj.promiseTimeRange;
                    }
                    if (venderItem.type == "1") {
                        if (JSON.stringify(calendar.result) == "{}" && venderItem.date_x == null) {
                            alert("您还没有指定配送时间");
                            return;
                        } else if (JSON.stringify(calendar.result) != "{}") {
                            //给隐藏域赋值
                            var data = (calendar.result['date-range']).split('-');

                            var saveParam_batchId = null;
                            if (data.length > 1) {
                                saveParam_batchId = data[1];
                            }

                            shipment.bigPromiseDate = calendar.result.day;  //配送日期
                            shipment.bigPromiseTimeRange = calendar.result.range; //配送时间段
                            shipment.bigBatchId = saveParam_batchId;
                            shipment.bigPromiseSendPay = data[0];
                            $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                            $("#promiseSopViewList").val(JSON.stringify(venderList));

                        } else {

                            shipment.bigPromiseDate = calendar.result.day;  //配送日期
                            shipment.bigPromiseTimeRange = calendar.result.range; //配送时间段
                            shipment.bigBatchId = venderItem.batchId;
                            shipment.bigPromiseDate = venderItem.promiseDate;
                            shipment.bigPromiseTimeRange = venderItem.promiseTimeRange;
                            shipment.bigPromiseSendPay = venderItem.promiseSendPay;

                            $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                        }
                        doSavePayAndShipmentInfo();
                        jQuery.closeDialog();

                    } else {
                        shipment.bigOffset = $('.li_shipment.selected').attr("shipDate_offset");
                        $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                        doSavePayAndShipmentInfo();
                        jQuery.closeDialog();
                    }

                });

            } //onready end
        });
    })
}

function doSopSwithBigTab(type) {
    if (type == "jzd") {
        $("#tab_sop_bzd_div").addClass("hide");
        $("#tab_sop_dj_jzd_div").removeClass("hide");
        $("#djsopjzd").addClass("tab-item-selected");
        $("#djsopbzd").removeClass("tab-item-selected");
    }
    if (type == "bzd") {
        $("#tab_sop_bzd_div").removeClass("hide");
        $("#tab_sop_dj_jzd_div").addClass("hide");
        $("#djsopjzd").removeClass("tab-item-selected");
        $("#djsopbzd").addClass("tab-item-selected");
    }
}

function saveCalendarV2(id, type, tagType, promiseDate, promiseTimeRange, promiseSendPay, batchId) {
    if (id.indexOf("_zy") > -1 && id.indexOf("big") < 0) {
        //自营中小件
        $("#saveParam_promiseDate").val(promiseDate);
        $("#saveParam_promiseTimeRange").val(promiseTimeRange);
        $("#saveParam_promiseSendPay").val(promiseSendPay);
        $("#saveParam_batchId").val(batchId);
        if (type == 0) {
            if ($("#311flag").val() == "1") {
                $("#newForcedChoice").val("1");
            } else {
                $("#newForcedChoice").val("0");
            }
            $("#saveParam_promiseType").val(3); //预约配送类型，
            $("#saveParam_jdShipTime").val(6); //1，表示只工作日，2，表示只周末，3表示工作日、节假日均可，4表示311,5表示极速达,6表示京准达
            $("#saveParam_immediateDelivery").val("2");
            $("#tdc_cutOrder").val("1");
            $("#reset_promise_311").val("1");
        } else if (type == 1) {
            if ($("#forcedChoice").val() == "true") {
                $("#newForcedChoice").val("1");
                $("#311flag").val("1");
            } else {
                $("#newForcedChoice").val("0");
                $("#311flag").val("0");
            }
            $("#saveParam_promiseType").val(1); //预约配送类型，1表示311，2表示411
            $("#saveParam_jdShipTime").val(4); //1，表示只工作日，2，表示只周末，3表示工作日、节假日均可，4表示311,5表示极速达
            $("#reset_promise_311").val("1");

        } else if (type == 2) {
            if ($("#311flag").val() == "1") {
                $("#newForcedChoice").val("1");
            } else {
                $("#newForcedChoice").val("0");
            }
            $("#saveParam_promiseDate").val("");
            $("#saveParam_promiseTimeRange").val("");
            $("#saveParam_promiseSendPay").val($("#shipment411_sendpay").val());
            //给隐藏域赋值

            $("#saveParam_promiseType").val(2); //预约配送类型，1表示311，2表示411
            $("#saveParam_jdShipTime").val(5);
            //更新配送时间说明
            if ($("#411content").val() != "0" && $("#411content4save").val() != "0") {
                setJdShipmentCalendarDate('<span class="ftx-03">配送时间：</span><font id="speedFreightNote">' + $("#411content4save").val() + '</font>');
            } else {
                setJdShipmentCalendarDate('<span class="ftx-03">配送时间：</span><font id="speedFreightNote">极速达（2小时之内送达）</font>');
            }
            $("#reset_promise_311").val("1"); //是否需要重置311,不重置311
            //日历支持极速达，但是没有极速达配送时间模块时，将其展示出来
            if ($("#forcedChoice-times").css("display") != 'none' && $("#shipment_times").css("display") == 'none') {
                $("#shipment_times").show();
                $("#forcedChoice-times").hide();
            }
            $("#forcedChoice-sales").hide();
        }
        if ($("#car_shipment_item").hasClass("curr")) {
            doSavePayAndShipmentInfo("car_shipment");
        } else if ($("#gsd_shipment_item").hasClass("curr")) {
            $("#gsd_newForcedChoice").val("1");
            if (promiseTimeRange.indexOf("下单后") > -1) {
                $("#saveParam_immediateDelivery").val("1");
            } else {
                $("#saveParam_immediateDelivery").val("2");
            }

            doSavePayAndShipmentInfo("gsd_shipment");
        } else {
            doSavePayAndShipmentInfo("jd_shipment");
        }
    } else if (id.indexOf("_zy") > -1 && id.indexOf("big") > -1) {
        //大件暂时去掉
    } else {
        //sop中小件处理
        var d = id.split("_");
        var venderId = d[d.length - 1];
        var venderList = jQuery.parseJSON($("#promiseSopViewList").val());
        var venderItem = null;
        var venderItemZxj = null;
        var jzdVenderItem = null;
        for (var i = 0; i < venderList.length; i++) {
            if (venderId == venderList[i].venderId) {
                venderItem = venderList[i];
                venderItembig = venderList[i].sopBigShipmentDateView;
                jzdVenderItem = venderList[i].bigShipmentJzdDateView;
                break;
            }
        }
        var shipment = new Object();
        if (id.indexOf("Big") < 0) {
            venderItem.promiseDate = promiseDate;  //配送日期
            venderItem.promiseTimeRange = promiseTimeRange; //配送时间段
            venderItem.batchId = batchId;
            venderItem.promiseSendPay = promiseSendPay;
            shipment.batchId = batchId;
            shipment.promiseSendPay = promiseSendPay;
            shipment.promiseDate = promiseDate;  //配送日期
            shipment.promiseTimeRange = promiseTimeRange; //配送时间段
            if (type == 0) {
                shipment.venderId = venderItem.venderId;
                if (venderItem.sopJdShipment) {
                    shipment.sopShipment = "68";
                } else if (venderItem.sopGsdShipment) {
                    shipment.sopShipment = "71";
                } else {
                    shipment.sopShipment = "67";
                }

                var shopCalendarTag;
                if (tagType == "0") {
                    shopCalendarTag = "2020";
                    shipment.shopCalendarTag = shopCalendarTag;
                } else if (tagType == "1") {
                    shopCalendarTag = "2010";
                    shipment.shopCalendarTag = shopCalendarTag;
                } else if (tagType == "2") {
                    shopCalendarTag = "2005";
                    shipment.shopCalendarTag = shopCalendarTag;
                }
                if ($("#sop_gsd_item_" + venderItem.venderId).hasClass("curr")) {
                    if (promiseTimeRange.indexOf("下单后") > -1) {
                        venderItem.selectedItem = "1";
                        shipment.selectedItem = "1";
                    } else {
                        venderItem.selectedItem = "2";
                        shipment.selectedItem = "2";
                    }
                    shipment.sopShipment = "71";
                    $("#forcedChoiceItem_" + venderItem.venderId).val("1");
                } else {
                    shipment.jdPromiseType = 2;
                    venderItem.jdPromiseType = 2;
                }
                $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                $("#promiseSopViewList").val(JSON.stringify(venderList));
                $("#reset_promise_311").val("1");
                doSavePayAndShipmentInfo("sop_shipment");
            } else if (type == 1) {
                $("#forcedChoiceItem_" + venderItem.venderId).val("1");
                if (promiseTimeRange.indexOf("下单后") > -1) {
                    venderItem.selectedItem = "1";
                    shipment.selectedItem = "1";
                } else {
                    venderItem.selectedItem = "2";
                    shipment.selectedItem = "2";
                }
                if (venderItem.sopJdShipment) {
                    shipment.sopShipment = "68";
                } else if (venderItem.sopGsdShipment) {
                    shipment.sopShipment = "71";
                } else {
                    shipment.sopShipment = "67";
                }
                $("#reset_promise_311").val("1");
                shipment.venderId = venderItem.venderId;
                venderItem.jdPromiseType = 1;
                shipment.jdPromiseType = 1;
                $("#saveParam_sopShipment").val(JSON.stringify(shipment));
                $("#promiseSopViewList").val(JSON.stringify(venderList));
                doSavePayAndShipmentInfo("sop_shipment");
            }
        }

    }
    jQuery.closeDialog();
}

function submitShipment(type) {
    var ajax_url = OrderAppConfig.DynamicDomain + "/payAndShip/savePayAndShip.action"; //表单目标
    var payId = $("#payment-list .payment-item.item-selected").attr("payid");
    var otype = $("#payment-list .payment-item.item-selected").attr("onlinepaytype");
    $("#saveParam_paymentId").val(payId);
    $("#saveParam_otype").val(otype);

    var venderList = jQuery.parseJSON($("#promiseSopViewList").val());
    var vendIds = "";
    if (venderList != null && venderList.length > 0) {
        for (var i = 0; i < venderList.length; i++) {
            var vendId = venderList[i].venderId;
            if (vendId != 0) {
                vendIds = vendIds + vendId + ",";
            }
        }
    }

    vendIds = vendIds.substring(0, vendIds.length - 1);

    if (vendIds.length > 0 && $(".selfPickInCommonItem").hasClass("item-selected")) {
        var shipment = new Object();
        shipment.venderId = vendIds;
        shipment.sopShipment = "69";
        $("#saveParam_sopShipment").val(JSON.stringify(shipment));
    }
    if ($("#combine_servicebox").prop("checked")) {
        $("#saveParam_combineServices").val(1);
    } else {
        $("#saveParam_combineServices").val(0);
    }

    var cutOrder = $("#tdc_cutOrder").val();//tdc京准达波次
    cutOrder = doLocalStorageValue(cutOrder, "tdc_cutOrder");//主要针对大家电多次对日历保存,而导致隐藏域tdc_cutOrder中的值重置消失
    $("#tdc_cutOrder").val(cutOrder);

    //大家仓极速达需要的参数
    var djd_param_obj = getLocalStorageObject("djd_promiseParam");
    if (djd_param_obj != null) {
        $("#djd_speedHour").val(djd_param_obj.speedHour);
        $("#djd_sendPay").val(djd_param_obj.sendPay);
        $("#djd_codDate").val(djd_param_obj.codDate);
        $("#djd_speedMark").val(djd_param_obj.speedMark);
    }
    var honorVenderIds = $("#saveParam_honorVenderIds").val();
    if (honorVenderIds != "" && honorVenderIds != null) {
        var honorVenderIdArray = honorVenderIds.split(",");
        var honorVenderIdStatus = "";
        for (var i = 0; i < honorVenderIdArray.length; i++) {
            var status;
            if ($("#Honor_shipment_item_" + honorVenderIdArray[i]).hasClass("curr")) {
                status = "1";
            } else {
                status = "0";
            }
            honorVenderIdStatus = honorVenderIdStatus + status + ",";
        }
        honorVenderIdStatus = honorVenderIdStatus.substring(0, honorVenderIdStatus.length - 1);
        $("#saveParam_honorVenderIdStatus").val(honorVenderIdStatus);
    }
    if ($(".selfPickInCommonItem").hasClass("item-selected")) {
        $("#saveParam_combineServices").val(0);
    }
    var ajax_data = $("#skuAndShipment_submit_form").serialize(); //表单数据
    ajax_data = addFlowTypeParam(ajax_data);
    if (type == 3) {
        ajax_data = ajax_data + "&saveParam.packagingServicesFlag=1"
    }
    jQuery.ajax({
        type: "POST", //表单提交类型
        dataType: "json",
        url: ajax_url, //表单提交目标
        data: ajax_data, //表单数据
        cache: false,
        success: function (dataResult, textStatus) {
            // 没有登录跳登录
            if (isUserNotLogin(dataResult)) {
                goToLogin();
                return;
            }
            if (dataResult.success) {
                if (type == 3) {
                    doAsynGetSkuPayAndShipInfo();
                } else {
                    reloadCouponNew(false, true);
                    if (type != 1) {
                        // 取消使用京豆（避免价格变化导致可使用京豆数不准）
                        useCancelEditJdBean(0, null, true);
                    }
                    //京准达多时效tagType放入隐藏
                    if (dataResult.promiseTagType != "undefined" && dataResult.promiseTagType != "" && dataResult.promiseTagType != null && dataResult.promiseTagType != "null") {
                        localStorage.setItem("zxj_promiseTagType", dataResult.promiseTagType);
                    } else {
                        try {
                            localStorage.removeItem("zxj_promiseTagType");
                        } catch (e) {
                        }
                    }
                    isDoRefresh(dataResult.cartJson, type);
                    //在刷新优惠券的时候刷新一下礼品卡信息
                    reloadGiftCard();
                }

            } else {
                //alert("系统繁忙，请稍后再试！");
                goOrder();
            }
        },
        error: function (XMLHttpResponse) {
            //alert("系统繁忙，请稍后再试！");
            goOrder();
        }
    });
}

//表单提交
function doSavePayAndShipmentInfo(saveType, venderid) {
//	if (saveType == "sop_pick") {
//		$("#sopPickStorePhoneinfo").removeClass("hide");
//	}else{
//		$("#sopPickStorePhoneinfo").addClass("hide");
//	}
    $("#saveParam_carDeliver").val(0);
    //保存京东快递配送时间
    if (saveType == "jd_shipment") {
        //设置京东配送方式
        $("#saveParam_jdShipmentType").val(65);
        $("#saveParam_pickShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
        $("#saveParam_gsdShipmentType").val("");
    }
    //保存同城配送配送时间
    if (saveType == "gsd_shipment") {
        //设置京东配送方式
        $("#saveParam_gsdShipmentType").val(71);
        $("#saveParam_jdShipmentType").val(0);
        $("#saveParam_pickShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
    }
    if (saveType == "car_shipment") {
        //设置京东配送方式
        $("#saveParam_carDeliver").val(1);
        $("#saveParam_pickShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
        $("#saveParam_jdShipmentType").val(65);
        $("#saveParam_gsdShipmentType").val("");
    }
    if (saveType == "honor_shipment") {
        //设置京东配送方式
        $("#saveParam_jdShipmentType").val(65);
        $("#saveParam_pickShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
        $("#saveParam_gsdShipmentType").val("");
    }
    //保存支付方式
    if (saveType == "jd_payway_save") {
        //设置京东配送方式
        $("#saveParam_jdShipmentType").val(65);
        $("#saveParam_pickShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
    }
    //保存自提点
    else if (saveType == "jd_picksite") {
        //设置自提点
        $("#saveParam_pickShipmentType").val(64);
        $("#saveParam_jdShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
        //设置是自提点还是自提柜
    } else if (saveType == "save_picksite") {
        var pickId = $("#selfpick_siteDiv .site-item.site-item-selected").attr("pickid");
        var regionId = $("#pick_sel_regionid").val();

        var pick_name = $("#selfpick_siteDiv .site-item.site-item-selected").attr("pickName");
        if (pick_name == "null" || pick_name == null || pick_name == "undefined" || pick_name == undefined) {
            pick_name = "";
        }
        var showPickSite = "<span class='ftx-03'>自提地点：</span>" + pick_name;
        //如果没有选中自提点，不与保存
        if (isEmpty(pickId)) {
            return;
        }
        $("#beforePickRegionId").val(regionId);
        $("#beforePickSelRegionid").val(regionId);
        $("#beforePickSiteId").val(pickId);
        $("#beforePickName").val(pick_name);

        $("#pick_sel_regionid").val(regionId);
        $("#pick_sel_id").val(pickId);
        $("#is_invoke_pickdate").val("1");

        $("#selfpick_name").html(showPickSite);
        $("#saveParam_pickSiteId").val(pickId);
        $("#saveParam_pickRegionId").val(regionId);
        $("#saveParam_pickShipmentType").val(64);
        $("#saveParam_jdShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
    }
    //保存自提时间
    else if (saveType == "jd_picksite_time") {
        //设置自提点
        $("#saveParam_pickShipmentType").val(64);
        $("#saveParam_jdShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
        //设置是自提点还是自提柜
    }
    //保存大件商品京东配送时间
    else if (saveType == "jd_bigitem_shipdate") {
        //设置京东配送方式
        $("#saveParam_jdShipmentType").val(65);
        $("#saveParam_pickShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
        //设置刷新属性
        $("#is_refresh_installdate").val("1");
    }
    //保存大件商品京东安装时间
    else if (saveType == "jd_bigitem_installdate") {
        //设置京东配送方式
        $("#saveParam_jdShipmentType").val(65);
        $("#saveParam_pickShipmentType").val("");
        $("#saveParam_otherShipmentType").val("");
    }
    //保存大件商品第三方配送时间
    else if (saveType == "jd_otherbigitem_shipdate") {
        //设置京东第三方配送方式
        $("#saveParam_jdShipmentType").val("");
        $("#saveParam_otherShipmentType").val(66);
        $("#saveParam_pickShipmentType").val("");
        //设置刷新属性
        $("#is_refresh_installdate").val("1");
    }
    //保存大件商品第三方安装时间
    else if (saveType == "jd_otherbigitem_installdate") {
        //设置京东第三方配送方式
        $("#saveParam_jdShipmentType").val("");
        $("#saveParam_otherShipmentType").val(66);
        $("#saveParam_pickShipmentType").val("");
    }
    //保存京东第三方配送
    else if (saveType == "jd_other_shipment") {
        //设置京东第三方配送方式
        $("#saveParam_jdShipmentType").val("");
        $("#saveParam_otherShipmentType").val(66);
        $("#saveParam_pickShipmentType").val("");
    }
    //保存门店信息
    else if (saveType == "sop_pick") {
        //设置京东第三方配送方式

        $("#venderSelfDeliveryStoreViewname_" + venderid).html($("#saveParam_venderSelfDeliveryStoreVO_name").val())
        if ($("#saveParam_venderSelfDeliveryStoreVO_recentlyMark").val() == 1) {
            $("#venderSelfDeliveryStoreViewrecentlyMark_" + venderid).html("<span class='o2o-near mr5'>距离最近</span> 距收货地址" + $("#saveParam_venderSelfDeliveryStoreVO_distance").val());
        } else {
            $("#venderSelfDeliveryStoreViewrecentlyMark_" + venderid).html("距收货地址" + $("#saveParam_venderSelfDeliveryStoreVO_distance").val())
        }
        $("#venderSelfDeliveryStoreViewstoreAddress_" + venderid).html("地址：" + $("#saveParam_venderSelfDeliveryStoreVO_storeAddress").val())
        $("#venderSelfDeliveryStoreViewbusinessHours_" + venderid).html("营业时间：" + $("#saveParam_venderSelfDeliveryStoreVO_businessHours").val())
        $("#sopPickStoreinfo_" + venderid).removeClass("hide");
        $("#noSopPickStoreinfo_" + venderid).addClass("hide");
        $("#sopPickStorePhoneinfo_" + venderid).removeClass("hide");
        $("#sop_pick_md_" + venderid).addClass("hide");
        $("#flag_" + venderid).val("true");
        var storeId = $("#saveParam_venderSelfDeliveryStoreVO_storeId").val();
        $("#J_o2o_changeDian").unbind('click').removeAttr('onclick').attr("onclick", "getSelfDeliveryStores(2,'" + venderid + "','" + storeId + "')");
        parent.$.closeDialog();
    } else if (saveType == "jd_installdate") {
        $("#saveParam_jdShipmentType").val(65);
    }
    submitShipment();
}

//点击切换京东配送标签
function doSwithTab(flag, honorVenderId) {

    //京尊达
    if ("honor" == flag && $("#Honor_shipment_item_" + honorVenderId).hasClass("curr") == false) {
        $("#Honor_shipment_item_" + honorVenderId).addClass("curr");
        if (honorVenderId == 0) {
            $("#jd_shipment_item").removeClass("curr");
            $("#pick_shipment_item").removeClass("curr");
            $("#gsd_shipment_item").removeClass("curr");
            $("#car_shipment_item").removeClass("curr");
            //自提前置，把下面的自提隐藏掉
            if ($("#selfPickShutDownFlag").attr("value") == 1) {
                $("#jd_shipment_item").removeClass("hide");
                $("#pick_shipment_item").addClass("hide");
            }
            $("#shipment_times").show();
            $("#forcedChoice-times").hide();
            $("#car_tips").addClass("hide");
            $("#car_Agreement_tips").addClass("hide");
            $("#selfpick_shipment").addClass("hide");
            $("#jd_shipment").addClass("ui-switchable-panel-selected");
            $("#delivery-info-li-zxj").show();
            $("#jd_shipment").removeClass("hide");
            $("#gsd_shipment").addClass("hide");

        } else {
            var shipment = new Object();
            shipment.venderId = honorVenderId;
            shipment.sopShipment = "68";
            $("#saveParam_sopShipment").val(JSON.stringify(shipment));
            $("#sop_jd_shipment_item_" + honorVenderId).removeClass("curr");
            $("#sop_other_shipment_item_" + honorVenderId).removeClass("curr");
        }
        $("#saveParam_honorVenderId").val(honorVenderId);
        $("#honorVenderId").val(honorVenderId);
        var honorVenderIds = $("#saveParam_honorVenderIds").val();
        var honorVenderIdArray = honorVenderIds.split(",");
        var honorVenderIdStatus = "";
        for (var i = 0; i < honorVenderIdArray.length; i++) {
            var status;
            if ($("#Honor_shipment_item_" + honorVenderIdArray[i]).hasClass("curr")) {
                status = "1";
            } else {
                status = "0";
            }
            honorVenderIdStatus = honorVenderIdStatus + status + ",";
        }
        honorVenderIdStatus = honorVenderIdStatus.substring(0, honorVenderIdStatus.length - 1);
        $("#saveParam_honorVenderIdStatus").val(honorVenderIdStatus);
        doSaveJdShipment("honor_shipment");
    }
    if ("honor" != flag) {
        $("#saveParam_honorVenderId").val("");
        $("#Honor_tip_" + $("#honorVenderId").val()).addClass("hide");
    }
    //同城配送
    if ("gsd" == flag && $("#gsd_shipment_item").hasClass("curr") == false) {
        $("#jd_shipment_item").removeClass("curr");
        $("#pick_shipment_item").removeClass("curr");
        $("#car_shipment_item").removeClass("curr");
        $("#gsd_shipment_item").addClass("curr");
        $("#Honor_shipment_item_0").removeClass("curr");
        //自提前置，把下面的自提隐藏掉
        if ($("#selfPickShutDownFlag").attr("value") == 1) {
            $("#pick_shipment_item").addClass("hide");
        }
        $("#forcedChoice-times").hide();
        $("#gsd_shipment").removeClass("hide");
        $("#jd_shipment").addClass("hide");
        $("#reset_promise_311").val("1");
        $("#car_tips").addClass("hide");
        $("#car_Agreement_tips").addClass("hide");
        $("#saveParam_promiseTimeRange").val("");
        $("#saveParam_promiseDate").val("");
        $("#saveParam_batchId").val("");
        doSaveJdShipment("gsd_shipment");
    }


    //快递到车
    if ("car" == flag && $("#car_shipment_item").hasClass("curr") == false) {
        $("#car_shipment_item").addClass("curr");
        $("#jd_shipment_item").removeClass("curr");
        $("#pick_shipment_item").removeClass("curr");
        $("#gsd_shipment_item").removeClass("curr");
        $("#Honor_shipment_item_0").removeClass("curr");
        //自提前置，把下面的自提隐藏掉
        if ($("#selfPickShutDownFlag").attr("value") == 1) {
            $("#jd_shipment_item").removeClass("hide");
            $("#pick_shipment_item").addClass("hide");
        }
        if ($("#shipment_select_support").val() == "3") {
            $("#delivery-info-li-zxj").hide();
        } else {
            $("#car_tips_on").html("准时送达");
            $("#forcedChoice-times").show();
            $("#shipment_times").hide();
            $("#jd_shipment").removeClass("hide");
            $("#delivery-info-li-zxj").hide();
        }
        $("#gsd_shipment").addClass("hide");
        $("#selfpick_shipment").addClass("hide");
        $("#car_tips").removeClass("hide");
        $("#car_Agreement_tips").removeClass("hide");
        doSaveJdShipment("car_shipment");
    }

    //京东配送
    if ("pay" == flag && $("#jd_shipment_item").hasClass("curr") == false) {
        $("#jd_shipment_item").addClass("curr");
        $("#pick_shipment_item").removeClass("curr");
        $("#gsd_shipment_item").removeClass("curr");
        $("#car_shipment_item").removeClass("curr");
        $("#Honor_shipment_item_0").removeClass("curr");
        //自提前置，把下面的自提隐藏掉
        if ($("#selfPickShutDownFlag").attr("value") == 1) {
            $("#jd_shipment_item").removeClass("hide");
            $("#pick_shipment_item").addClass("hide");
        }
        $("#shipment_times").show();
        $("#selfpick_shipment").addClass("hide");
        $("#jd_shipment").addClass("ui-switchable-panel-selected");
        $("#forcedChoice-times").hide();
        $("#delivery-info-li-zxj").show();
        $("#jd_shipment").removeClass("hide");
        $("#gsd_shipment").addClass("hide");
        $("#car_tips").addClass("hide");
        $("#car_Agreement_tips").addClass("hide");
        $("#car_tips_on").html("限时免费，准时送达");
        doSaveJdShipment("jd_shipment");
    }


    //京东自提
    if ("picksite" == flag && $("#pick_shipment_item").hasClass("disabled") == false && $("#pick_shipment_item").hasClass("curr") == false) {
        $("#pick_shipment_item").addClass("curr");
        $("#gsd_shipment_item").removeClass("curr");
        $("#jd_shipment_item").removeClass("curr");
        $("#car_shipment_item").removeClass("curr");
        $("#Honor_shipment_item_0").removeClass("curr");
        //自提前置，把下面的自提隐藏掉
        if ($("#selfPickShutDownFlag").attr("value") == 1) {
            $("#pick_shipment_item").removeClass("hide");
            $("#jd_shipment_item").addClass("hide");
            $("#_jdpay").addClass("hide");
            $("#selfpick_name").addClass("hide");
            $("#selfpick_name").next("div").addClass("hide");
        }
        $("#jd_shipment").addClass("hide");
        $("#selfpick_shipment").addClass("ui-switchable-panel-selected");
        $("#selfpick_shipment").removeClass("hide");
        $("#gsd_shipment").addClass("hide");
        $("#car_tips").addClass("hide");
        $("#car_Agreement_tips").addClass("hide");
        //点击自提table标签保存默认自提点
        doSavePickSite();
    }
    //京东第三方配送
    if ("jd_other" == flag && $("#_jdpay").hasClass("curr") == false) {
        $("#_jdpay").addClass("curr");
        $("#pick_shipment_item").removeClass("curr");
        $("#gsd_shipment_item").removeClass("curr");
        $("#selfpick_shipment").addClass("hide");
        $("#car_shipment_item").removeClass("curr");
        $("#Honor_shipment_item_0").removeClass("curr");
        //自提前置，把下面的自提隐藏掉
        if ($("#selfPickShutDownFlag").attr("value") == 1) {
            $("#jd_shipment_item").removeClass("hide");
            $("#pick_shipment_item").addClass("hide");
        }
        $("#gsd_shipment").addClass("hide");
        $("#car_tips").addClass("hide");
        $("#car_Agreement_tips").addClass("hide");
        doSaveJdShipment("jd_other_shipment");
    }
    //京东第三方自提
    if ("picksite_other" == flag && $("#pick_shipment_item").hasClass("disabled") == false && $("#pick_shipment_item").hasClass("curr") == false) {
        $("#pick_shipment_item").addClass("curr");
        $("#gsd_shipment_item").removeClass("curr");
        $("#car_shipment_item").removeClass("curr");
        $("#Honor_shipment_item_0").removeClass("curr");
        //自提前置，把下面的自提隐藏掉
        if ($("#selfPickShutDownFlag").attr("value") == 1) {
            $("#pick_shipment_item").removeClass("hide");
            $("#jd_shipment_item").addClass("hide");
            $("#_jdpay").addClass("hide");
            $("#selfpick_name").addClass("hide");
            $("#selfpick_name").next("div").addClass("hide");
        }
        $("#_jdpay").removeClass("curr");
        $("#selfpick_shipment").addClass("ui-switchable-panel-selected");
        $("#selfpick_shipment").removeClass("hide");
        $("#gsd_shipment").addClass("hide");
        $("#car_tips").addClass("hide");
        $("#car_Agreement_tips").addClass("hide");
        //点击自提table标签保存默认自提点
        doSavePickSite();
    }
}

//点击切换京东配送标签
function swithTab(flag) {
    if ("pay" == flag) {
        $("#jd_shipment_item").addClass("curr");
        $("#pick_shipment_item").removeClass("curr");
        $("#selfpick_shipment").css("style", "display: none;");
        $("#jd_shipment").css("style", "display: block;");
        $("#selfpick_shipment").addClass("hide");
        $("#jd_shipment").addClass("ui-switchable-panel-selected");
        $("#jd_shipment").removeClass("hide");
    } else {
        $("#pick_shipment_item").addClass("curr");
        $("#jd_shipment_item").removeClass("curr");
        $("#jd_shipment").addClass("hide");
        $("#selfpick_shipment").addClass("ui-switchable-panel-selected");
        $("#selfpick_shipment").css("style", "display: block;");
        $("#jd_shipment").css("style", "display: none;");
        $("#selfpick_shipment").removeClass("hide");
    }
}

/*
 * 点击切换sop三方配送和京东配送标签
 * 1、点击时候更新sop日历隐藏域中选中的配送方式，并获取sop日历隐藏域中的默认选中配送时间设置到saveParam_sopShipment中
 *
 * 2、在日历弹窗中选择了日期后，更新saveParam_sopShipment 日期时间等信息
 */
function doSwithTabSop(venderId, flag, md, sopBig) {

    //设置保存参数
    var shipment = new Object();
    shipment.venderId = venderId;
    //给预约日历 设置配送方式
    var venderList = jQuery.parseJSON($("#promiseSopViewList").val());
    $("#Honor_shipment_item_" + venderId).removeClass("curr");
    for (var i = 0; i < venderList.length; i++) {
        var venderItem = null;
        if (venderId == venderList[i].venderId) {
            venderItem = venderList[i];
            if ("sopJd" == flag) {
                venderItem.sopJdShipment = true;
                venderItem.sopOtherShipment = false;
                shipment.sopShipment = "68";
                $("#sop_jd_shipment_item_" + venderId).addClass("curr");
                $("#sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_other_shipment_item_" + venderId).removeClass("curr");
                $("#sop_Consolidator_item_" + venderId).removeClass("curr");
                $("#sop_pick_item_" + venderId).removeClass("curr");
                $("#sop_pick_" + venderId).addClass("hide");
                $("#sop_shipment_" + venderId).removeClass("hide");
                $("#sopPickStoreinfo_" + venderId).addClass("hide");
                $("#noSopPickStoreinfo_" + venderId).addClass("hide");
                $("#sopPickStorePhoneinfo_" + venderId).addClass("hide");
                $("#saveParam_sopShipmentType").val("");
                $("#flag_" + venderId).val("false");
                $("#consolidator_" + venderId).addClass("hide");
                $("#jyqh_copy_" + venderId).addClass("hide");
                $("#sop_big_jd_shipment_item_" + venderId).addClass("curr");
                $("#sop_big_other_shipment_item_" + venderId).removeClass("curr");
                $("#bg_sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_big_shipment_date_li_" + venderId).show();
                $("#bg_gsd-old-ships_" + venderId).hide();
            } else if ("sopPick" == flag) {
                shipment.sopShipment = "70";
                $("#sop_pick_item_" + venderId).addClass("curr");
                $("#sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_Consolidator_item_" + venderId).removeClass("curr");
                $("#sop_pick_" + venderId).removeClass("hide");
                $("#sop_shipment_" + venderId).addClass("hide");
                $("#sop_jd_shipment_item_" + venderId).removeClass("curr");
                $("#sop_other_shipment_item_" + venderId).removeClass("curr");
                //$("#sopPickStorePhoneinfo").removeClass("hide");
                //
                if ($("#flag_" + venderId).val() == "true") {
                    $("#sopPickStoreinfo_" + venderId).removeClass("hide");
                    $("#noSopPickStoreinfo_" + venderId).addClass("hide");
                    $("#sop_pick_md_" + venderId).addClass("hide");
                } else {
                    $("#sopPickStoreinfo_" + venderId).addClass("hide");
                    $("#noSopPickStoreinfo_" + venderId).removeClass("hide");
                    $("#sop_pick_md_" + venderId).removeClass("hide");
                }
                $("#sopPickStorePhoneinfo_" + venderId).removeClass("hide");
                $("#consolidator_" + venderId).addClass("hide");
                $("#jyqh_copy_" + venderId).addClass("hide");
                $("#sop_big_jd_shipment_item_" + venderId).removeClass("curr");
                $("#sop_big_other_shipment_item_" + venderId).removeClass("curr");
                $("#bg_sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_gsd_item_" + venderId).removeClass("curr");
                $("#bg_gsd-old-ships_" + venderId).hide();
            } else if ("consolidator" == flag) {
                shipment.sopShipment = "72";
                $("#consolidator_id").val($("#consolidator_id_" + venderId).val());
                $("#consolidator_name").val($("#consolidator_name_" + venderId).val());
                $("#consolidator_selected").val($("#consolidator_selected_" + venderId).val());
                $("#consolidator_logo").val($("#consolidator_logo_" + venderId).val());
                $("#consolidator_proviceId").val($("#consolidator_proviceId_" + venderId).val());
                $("#consolidator_cityId").val($("#consolidator_cityId_" + venderId).val());
                $("#consolidator_countyId").val($("#consolidator_countyId_" + venderId).val());
                $("#consolidator_townId").val($("#consolidator_townId_" + venderId).val());
                $("#consolidator_detailAddr").val($("#consolidator_detailAddr_" + venderId).val());
                $("#consolidator_chargeStandard").val($("#consolidator_chargeStandard_" + venderId).val());
                $("#consolidator_pcLogoUrl").val($("#consolidator_pcLogoUrl_" + venderId).val());
                $("#consolidator_appLogoUrl").val($("#consolidator_appLogoUrl_" + venderId).val());

                $("#sop_Consolidator_item_" + venderId).addClass("curr");
                $("#sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_jd_shipment_item_" + venderId).removeClass("curr");
                $("#sop_other_shipment_item_" + venderId).removeClass("curr");
                $("#sop_pick_item_" + venderId).removeClass("curr");
                $("#sop_pick_" + venderId).addClass("hide");
                $("#sop_shipment_" + venderId).addClass("hide");
                $("#sopPickStoreinfo_" + venderId).addClass("hide");
                $("#noSopPickStoreinfo_" + venderId).addClass("hide");
                $("#sopPickStorePhoneinfo_" + venderId).addClass("hide");
                $("#consolidator_" + venderId).removeClass("hide");
                $("#jyqh_copy_" + venderId).removeClass("hide");
            } else if ("sopgsd" == flag) {
                shipment.sopShipment = "71";
                $("#sop_gsd_item_" + venderId).addClass("curr");
                $("#sop_Consolidator_item_" + venderId).removeClass("curr");
                $("#sop_jd_shipment_item_" + venderId).removeClass("curr");
                $("#sop_other_shipment_item_" + venderId).removeClass("curr");
                $("#sop_pick_item_" + venderId).removeClass("curr");
                $("#sop_pick_" + venderId).addClass("hide");
                $("#sop_shipment_" + venderId).addClass("hide");
                $("#sopPickStoreinfo_" + venderId).addClass("hide");
                $("#noSopPickStoreinfo_" + venderId).addClass("hide");
                $("#sopPickStorePhoneinfo_" + venderId).addClass("hide");
                $("#consolidator_" + venderId).addClass("hide");
                $("#jyqh_copy_" + venderId).addClass("hide");
                $("#gsd_shipment_" + venderId).removeClass("hide");
                $("#sop_big_jd_shipment_item_" + venderId).removeClass("curr");
                $("#sop_big_other_shipment_item_" + venderId).removeClass("curr");
                $("#bg_sop_gsd_item_" + venderId).addClass("curr");
                $("#sop_gsd_item_" + venderId).addClass("curr");
                $("#sop_big_shipment_date_li_" + venderId).hide();
                $("#bg_gsd-old-ships_" + venderId).show();
            } else if ("sopbiggsd" == flag) {
                shipment.sopShipment = "71";
                $("#bg_sop_gsd_item_" + venderId).addClass("curr");
                $("#sop_gsd_item_" + venderId).addClass("curr");
                $("#sop_big_other_shipment_item_" + venderId).removeClass("curr");
                $("#sop_big_jd_shipment_item_" + venderId).removeClass("curr");
            } else {
                venderItem.sopJdShipment = false;
                venderItem.sopOtherShipment = true;
                shipment.sopShipment = "67";
                $("#sop_other_shipment_item_" + venderId).addClass("curr");
                $("#sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_jd_shipment_item_" + venderId).removeClass("curr");
                $("#sop_Consolidator_item_" + venderId).removeClass("curr");
                $("#sop_pick_item_" + venderId).removeClass("curr");
                $("#sop_pick_item_" + venderId).removeClass("curr");
                $("#sop_pick_" + venderId).addClass("hide");
                $("#sop_shipment_" + venderId).removeClass("hide");
                $("#sopPickStoreinfo_" + venderId).addClass("hide");
                $("#noSopPickStoreinfo_" + venderId).addClass("hide");
                $("#sopPickStorePhoneinfo_" + venderId).addClass("hide");
                $("#saveParam_sopShipmentType").val("");
                $("#flag_" + venderId).val("false");
                $("#consolidator_" + venderId).addClass("hide");
                $("#jyqh_copy_" + venderId).addClass("hide");
                $("#bg_sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_big_other_shipment_item_" + venderId).addClass("curr");
                $("#sop_big_jd_shipment_item_" + venderId).removeClass("curr");
            }
            if ("sopBig" == sopBig && "sopbiggsd" == flag) {
                $("#sop_big_shipment_date_li_" + venderId).hide();
                $("#bg_gsd-old-ships_" + venderId).show();
                $("#bg_sop_gsd_item_" + venderId).addClass("curr");
                shipment.selectedItem = "1";
            }
            if ("sopBig" == sopBig && "sopbiggsd" != flag) {
                $("#bg_sop_gsd_item_" + venderId).removeClass("curr");
                $("#sop_big_shipment_date_li_" + venderId).show();
                $("#bg_gsd-old-ships_" + venderId).hide();
                if ("sopJd" == flag) {
                    $("#sop_big_jd_shipment_item_" + venderId).addClass("curr");
                } else {
                    $("#sop_big_other_shipment_item_" + venderId).addClass("curr");
                }
            }


            break;
        }
    }
    $("#promiseSopViewList").val(JSON.stringify(venderList));
    $("#saveParam_sopShipment").val(JSON.stringify(shipment));
    if (!"consolidator" == flag) {
        $("#consolidator_id").val("");
        $("#consolidator_name").val("");
        $("#consolidator_selected").val("");
        $("#consolidator_logo").val("");
        $("#consolidator_proviceId").val("");
        $("#consolidator_cityId").val("");
        $("#consolidator_countyId").val("");
        $("#consolidator_townId").val("");
        $("#consolidator_detailAddr").val("");
        $("#consolidator_chargeStandard").val("");
        $("#consolidator_pcLogoUrl").val("");
        $("#consolidator_appLogoUrl").val("");
    }
    if ("sopPick" != flag) {
        $("#saveParam_venderSelfDeliveryStoreVO_venderId").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_storeId").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_warehouseId").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_name").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_businessHours").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_longitude").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_latitude").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_storeMark").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_recentlyMark").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_stockStatus").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_storeAddress").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_distance").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_vendSource").val("");
        $("#saveParam_venderSelfDeliveryStoreVO_venderStoreStockTab").val("");
        $("#saveParam_sopShipmentType").val("");
        submitShipment();
    }

    jQuery.closeDialog();
}

function getConsolidatorSkuViews(venderId, id) {
    var hwjyDialog = $('body').dialog({
        title: '选择集运服务商',
        width: 765,
        type: 'html',
        fixed: true,
        closeButton: true,
        source: $('#J_hwbuy_box_' + venderId).html(),
        onReady: function () {

            $(".hwjy-continer #checkjys_" + id).attr("checked", true);
            $('.hwjy-continer #jy_agreement_check').attr("checked", true);
            $('.hwjy-continer .hwbuy-tips.ydxy').addClass("hide");
            if ($("#checkjys_" + id).attr("disableView")) {
                $('.hwjy-continer a.btn-1').html("移除并选择该集运商");
            } else {
                $('.hwjy-continer a.btn-1').html("确定");
            }
            $('.hwjy-continer a.btn-1').click(function () {
                //
                if (!$('.hwjy-continer #jy_agreement_check').is(":checked")) {
                    $('.hwjy-continer .hwbuy-tips.ydxy').removeClass("hide");
                    return;
                } else {
                    var consolidatorid = $("#jysid_" + venderId).val();
                    if (typeof consolidatorid == 'undefined' || consolidatorid == null || consolidatorid == "") {
                        $('.hwjy-continer .hwbuy-tips.xzjy').removeClass("hide");
                        return;
                    }
                    var consolidatorsInfo = jQuery.parseJSON($("#consolidatorsInfo_" + venderId).html());
                    for (var i = 0; i < consolidatorsInfo.length; i++) {
                        if (consolidatorid == consolidatorsInfo[i].id) {
                            $("#consolidator_id_" + venderId).val(consolidatorsInfo[i].id);
                            $("#consolidator_name_" + venderId).val(consolidatorsInfo[i].name);
                            $("#consolidator_selected_" + venderId).val(consolidatorsInfo[i].selected);
                            $("#consolidator_logo_" + venderId).val(consolidatorsInfo[i].logo);
                            $("#consolidator_proviceId_" + venderId).val(consolidatorsInfo[i].proviceId);
                            $("#consolidator_cityId_" + venderId).val(consolidatorsInfo[i].cityId);
                            $("#consolidator_countyId_" + venderId).val(consolidatorsInfo[i].countyId);
                            $("#consolidator_townId_" + venderId).val(consolidatorsInfo[i].townId);
                            $("#consolidator_detailAddr_" + venderId).val(consolidatorsInfo[i].detailAddr);
                            $("#consolidator_chargeStandard_" + venderId).val(consolidatorsInfo[i].chargeStandard);
                            $("#consolidator_pcLogoUrl_" + venderId).val(consolidatorsInfo[i].pcLogoUrl);
                            $("#consolidator_appLogoUrl_" + venderId).val(consolidatorsInfo[i].appLogoUrl);
                            doSwithTabSop(venderId, 'consolidator');
                            var html = "<span class='ftx-03'><a href='#none'>集运商服务：" + consolidatorsInfo[i].name + "</a></span>";
                            html = html + "<a href='#none' id='doedit_consolidator_" + venderId + "' class='ftx-05 fr' onclick='getConsolidatorSkuViews(" + venderId + "," + consolidatorsInfo[i].id + ")' >修改</a>";
                            html = html + "<input type='hidden' id='jysid_" + venderId + "' value='" + consolidatorsInfo[i].id + "'>";
                            html = html + "<input type='hidden' id='select_jy_" + venderId + " value='1'>";
                            $("#jysinfo_" + venderId).html(html);
                            var ht = "<li class='delivery-info-li-none-border'><div class='foreAll'>";
                            ht = ht + "<span class='mode-label ftx-03'>跨境运费：</span><div class='mode-infor'>";
                            ht = ht + consolidatorsInfo[i].chargeStandard;
                            ht = ht + "</div></div></li>";
                            $("#consolidatorChargeStandard_" + venderId).html(ht);
                            hwjyDialog.close();
                            var skuids = $("#disable_sku_ids_" + consolidatorid).val();
                            if (typeof skuids !== 'undefined' && skuids.length > 0) {
                                uncheckItem(skuids, consolidatorid, venderId);
                            }

                        }
                    }
                }
            });
            $('.hwjy-continer .ui-dialog-close').bind('click', function () {
                hwjyDialog.close();
            });
        }
    });
}

function checkConsolidator(venderid, consolidatorid) {
    $("#jysid_" + venderid).val(consolidatorid);
    if ($("#checkjys_" + consolidatorid).attr("disableView")) {
        $('.hwjy-continer a.btn-1').html("移除并选择该集运商");
    } else {
        $('.hwjy-continer a.btn-1').html("确定");
    }
    $('.hwjy-continer .hwbuy-tips.xzjy').addClass("hide");
}

function checkAgreement(thisObj) {
    if (thisObj.checked) {
        $('.hwjy-continer .hwbuy-tips.ydxy').addClass("hide");
        $('.hwjy-continer #jy_agreement_check').attr("checked", true);
    } else {
        $('.hwjy-continer #jy_agreement_check').attr("checked", false);
    }
}

function selectCombineService(thisElement) {
    // 操作之后状态
    var postStatus = $(thisElement).prop("checked");
    // 操作之前状态
    var preStatus = !postStatus;
    if (postStatus) {
        $("#saveParam_combineServices").val(1);
        $("#saveParam_jdShipTime").val(4);
    } else {
        $("#saveParam_combineServices").val(0);
        $("#saveParam_jdShipTime").val(3);
    }
    //合并收货
    submitShipment();
}

function selectPackagingServices(thisElement, venderId) {
    // 操作之后状态
    var postStatus = $(thisElement).prop("checked");
    // 操作之前状态
    var preStatus = !postStatus;
    var FID = "";
    if ($(".selfPickInCommonItem").hasClass("item-selected")) {
        FID = "_ZT";
    }
    if (postStatus) {
        $("#saveParam_packagingServices").val(1);
        $("#packagingServicesCharge_" + venderId).html("￥" + Number($("#packageChargehide").val()).toFixed(2));
        if (typeof $("#packageChargehide").val() !== 'undefined' && Number($("#packageChargehide").val()).toFixed(2) > 0) {
            $("#packagingServices_" + venderId).removeClass("hide");
        } else {
            $("#packagingServices_" + venderId).addClass("hide");
        }
        if (typeof $("#packageChargehide").val() !== 'undefined' && $("#packageChargehide").val() != null && $("#packageChargehide").val() > 0) {
            $("#packagingServicesFeetipPrice").html("<font color='#FF6600'>¥" + Number($("#packageChargehide").val()).toFixed(2) + "</font>");
            $("#packagingServicesFeetip").removeClass("hide");
        } else {
            $("#packagingServicesFeetip").addClass("hide");
        }
    } else {
        $("#saveParam_packagingServices").val(0);
        $("#packagingServicesCharge_" + venderId).html("￥0.00");
        if (typeof $("#packageChargehide").val() !== 'undefined' && Number($("#packageChargehide").val()).toFixed(2) > 0) {
            $("#packagingServices_" + venderId).removeClass("hide");
        } else {
            $("#packagingServices_" + venderId).addClass("hide");
        }
        $("#packagingServicesFeetip").addClass("hide");
    }
    //循环包装
    submitShipment(3);
}

/**
 * 处理311、411日历信息显示
 * @return
 */
function doDealCalenderInfo(dataResult) {
    if (dataResult.success == false) {
        setJdShipmentCalendarDate('');
        return;
    }
    $("#sopCartJson").val(dataResult.cartJson);
    var promise311 = dataResult.promise311;
    var promise411 = dataResult.promise411;
    var promiseJzd = dataResult.promiseZxjJzd;
    var gsd = dataResult.gsd;
    var carDeliverJzd = dataResult.carDeliverJzd;
    var honor = dataResult.honorFreightInsureView;
    var supportHonorFreight = dataResult.supportHonorFreight;
    //var selectHonorFreight = dataResult.selectHonorFreight;
    //循环包装
    var FID = "";
    if ($(".selfPickInCommonItem").hasClass("item-selected")) {
        FID = "_ZT";
    }
    var packagingServices = dataResult.packagingServices;
    if (packagingServices != null && packagingServices.support) {
        $("#packaging_services_li" + FID).removeClass("hide");
        $("#packaging_services_li" + FID).css("display", "block");
        if (packagingServices.select) {
            $("#packaging_services_check" + FID).attr("checked", true);
            $("#saveParam_packagingServices").val(1);
        } else {
            $("#packaging_services_check" + FID).attr("checked", false);
            $("#saveParam_packagingServices").val(0);
        }
        var html = "";


        if (packagingServices.packageCharge != null && packagingServices.packageCharge > 0) {
            var xhff = $("#xhff").val().replace("@", packagingServices.packageCharge);
            var xhfftip = $("#xhfftip").val();
            html = xhff + "<a href='#none' class='ftx-05 ml5' id='jd-packageCharge-item'>查看详情</a>";
            html = html + "<div class='hide' id='xhbz_hs'>" + xhfftip + "</div>"
        } else {
            var xhmf = $("#xhmf").val();
            var xhmftip = $("#xhmftip").val();
            html = xhmf + "<a href='#none' class='ftx-05 ml5' id='jd-packageCharge-item'>查看详情</a>";
            html = html + "<div class='hide' id='xhbz_hs'>" + xhmftip + "</div>"
        }
        //html = html +"<a id='xhbz-goods-item' class='cor-goods' href='#none'><i></i></a>";
        $("#packaging_services_copy" + FID).html(html);
        var goodsHtml = "";
        var sugoodsHtml = "";
        var packMap = packagingServices.venderPackagingServicesView;
        for (var key in packMap) {
            //不支持sku
            var unList = packMap[key].unSupportPackingSKU;
            //支持sku
            var suList = packMap[key].supportPackingSKU;
            for (var i = 0; i < unList.length; i++) {
                goodsHtml = goodsHtml + "<div class='goods-item'>";
                goodsHtml = goodsHtml + "<div class='p-img'>";
                goodsHtml = goodsHtml + "<a href='#none'><img src='//img14.360buyimg.com/N4/" + unList[i].imgUrl + "' alt=''></a>";
                goodsHtml = goodsHtml + "</div><div class='p-name'><a href='#none'>" + unList[i].name + "</a></div></div>";
            }
            for (var i = 0; i < suList.length; i++) {
                sugoodsHtml = sugoodsHtml + "<div class='goods-item'>";
                sugoodsHtml = sugoodsHtml + "<div class='p-img'>";
                sugoodsHtml = sugoodsHtml + "<a href='#none'><img src='//img14.360buyimg.com/N4/" + suList[i].imgUrl + "' alt=''></a>";
                sugoodsHtml = sugoodsHtml + "</div><div class='p-name'><a href='#none'>" + suList[i].name + "</a></div></div>";
            }
            if (packMap[key].supportPacking && packagingServices.packageCharge != null && packagingServices.packageCharge > 0) {
                $("#packagingServices_" + packMap[key].venderId).removeClass("hide");
                $("#packagingServices_0").removeClass("hide");
                var postStatus = $("#packaging_services_check" + FID).prop("checked");
                if (postStatus) {
                    $("#packagingServicesCharge_" + packMap[key].venderId).html("￥" + Number(packagingServices.packageCharge).toFixed(2));
                    $("#packagingServicesCharge_0").html("￥" + Number(packagingServices.packageCharge).toFixed(2));
                    $("#packagingServicesFeetipPrice").html("<font color='#FF6600'>¥" + Number(packagingServices.packageCharge).toFixed(2) + "</font>");
                    $("#packagingServicesFeetip").removeClass("hide");
                } else {
                    $("#packagingServicesCharge_" + packMap[key].venderId).html("￥0.00");
                    $("#packagingServicesCharge_0").html("￥0.00");
                    $("#packagingServicesFeetip").addClass("hide");
                }
            }
        }
        $(".goods-items.unsupport" + FID).html(sugoodsHtml);
        if (goodsHtml != "") {
            $("#packaging_services_uns" + FID).removeClass("hide");
        }
        $("#packageChargehide").val(packagingServices.packageCharge);

    } else {
        $("#packaging_services_li" + FID).addClass("hide");
        $("#packaging_services_li" + FID).css("display", "none");
        $("#packagingServicesFeetip").addClass("hide");

        var le = $(".service-item.xhbz").length;
        if (le > 0) {
            for (var i = 0; i < $(".service-item.xhbz").length; i++) {
                var serviceId = $(".service-item.xhbz")[i].id;
                $("#" + serviceId).addClass("hide");
            }
        }
    }
    var fee = 0;
    var honorVenderIds = "";
    var honorflag = "0";
    if (supportHonorFreight) {
        var honorMap = dataResult.honorFreightInsureView.venderHonorFreightMap;
        for (var key in honorMap) {
            var honorFee = honorMap[key].honorFee;
            var checkedFlag = honorMap[key].checkedFlag;
            var canCheckFlag = honorMap[key].canCheckFlag;
            if (key != 0 && $("#sop_jd_shipment_item_" + key).length < 1) {
                checkedFlag = false;
                canCheckFlag = false;
            }
            if (canCheckFlag) {
                $("#Honor_shipment_item_" + key).removeClass("hide");
                honorVenderIds = honorVenderIds + key + ","
            } else {
                $("#Honor_shipment_item_" + key).addClass("hide");
            }
            if (honorFee != "" && honorFee > 0) {
                $("#Honor_tip_" + key).html("京尊达服务费：￥" + honorFee.toFixed(2));
                fee = fee + honorFee;
            }
            if (checkedFlag) {
                $("#Honor_shipment_item_" + key).addClass("curr");
            } else {
                $("#Honor_shipment_item_" + key).removeClass("curr");
            }
            if (checkedFlag && key == "0") {
                $("#jd_shipment_item").removeClass("curr");
            } else if (checkedFlag && key != "0") {
                $("#sop_jd_shipment_item_" + key).removeClass("curr");
            }
            if ($("#Honor_shipment_item_" + key).hasClass("curr")) {
                $("#Honor_tip_" + key).removeClass("hide");
            } else {
                $("#Honor_tip_" + key).addClass("hide");
            }
            $("#honorVenderId").val(key);
            if ($("#Honor_shipment_item_" + key).hasClass("curr")) {
                honorflag = "1";
            }
        }
        if (honorVenderIds != "" && honorVenderIds.length > 0) {
            honorVenderIds = honorVenderIds.substring(0, honorVenderIds.length - 1);
        }
        $("#saveParam_honorVenderIds").val(honorVenderIds);
    }
    if (honorflag == "1") {
        $("#honorFeetipPrice").html("<font color='#FF6600'> ￥" + fee.toFixed(2) + " </font>");
        $("#honorFeetip").removeClass("hide");
    } else {
        $("#honorFeetip").addClass("hide");
    }
    /*隐藏域，当前311和411支持的类型
	 0表示311,411都不支持;
	 1表示只支持311;
	 2表示只支持411;
	 3表示311,411都支持*//*隐藏域，当前311和411支持的类型
	 0表示311,411都不支持;
	 1表示只支持311;
	 2表示只支持411;
	 3表示311,411都支持*/
    $("#shipment_support_type").val("0");
    /*隐藏域，当前311和411选中的是哪一个
	 1表示选中311;
	 2表示选中411;
	 3表示京准达*/
    $("#shipment_select_support").val("");

    //京准达多时效tag放入隐藏域中
    if (promiseJzd.calendarTagText != "undefined" && promiseJzd.calendarTagText != "") {
        $("#hid_calendar_tag").val(promiseJzd.calendarTagText);
    }
    //默认选中的时效赋值
    if (promiseJzd.defaultTagType != "undefined" && promiseJzd.defaultTagType != "") {
        $("#zxj_promiseTagType").val(promiseJzd.defaultTagType);
    }

    if (gsd.hasCalendar) {
        var va = $("#shipment_support_type").val();
        $("#shipment_support_type").val(va + "3");
        $("#gsd_calendar_hdata_zxj_jzd").val(JSON.stringify(gsd.timeRangeTitle));
        $("#gsd_calendar_ddata_zxj_jzd").val(JSON.stringify(gsd.days));
        //设置日历坐标
        $("#gsd_calendar_x_zxj_jzd").val(gsd.date_x);
        $("#gsd_calendar_y_zxj_jzd").val(gsd.date_y);
        //设置上次选中的日期，时间段和sendpay
        $("#gsd_last_sel_promiseDate_zxj_jzd").val(gsd.promiseDate);
        $("#gsd_last_sel_promiseTimeRange_zxj_jzd").val(gsd.promiseTimeRange);
        $("#gsd_last_sel_promiseSendPay_zxj_jzd").val(gsd.promiseSendPay);
        $("#gsd_last_sel_batchId_zxj_jzd").val(gsd.batchId);
        $("#gsd_immediately").val(gsd.immediately);
    }
    if (typeof gsd !== 'undefined' && gsd != null && gsd.support) {
        $("#gsd_shipment_item").removeClass("hide");
        if (gsd.selected || $("#gsd_shipment_item").hasClass("curr")) {
            if (gsd.hasCalendar) {

                if (gsd.forcedChoice && $("#gsd_newForcedChoice").val() == "0") {
                    $("#gsd-new-times-wmr").show();
                    $("#gsd-new-times-ymr").hide();
                } else {
                    $("#gsd_shipment_calendar_date").html(gsd.shipText);
                    $("#gsd-new-times-ymr").show();
                    $("#gsd-new-times-wmr").hide();
                }
                if (gsd.forcedChoice && gsd.selectedItem != 1 && gsd.shipText != null && gsd.promiseTimeRange == "立即送达") {
                    $("#gsd-new-times-wmr").show();
                    $("#gsd-new-times-ymr").hide();
                }
                $("#gsd-old-ships").hide();
            } else {
                $("#gsd_date").html("<span class='ftx-03'>极速达：工作日、双休日与节假日均可送货</span>");
                $("#gsd_shipment").removeClass("hide");
                $("#jd_shipment").addClass("hide");
                $("#gsd-old-ships").show();
                $("#gsd-new-times-ymr").hide();
                $("#gsd-new-times-wmr").hide();
            }
            $("#gsd_shipment").removeClass("hide");
            $("#jd_shipment").addClass("hide");
        } else {
            $("#gsd_shipment").addClass("hide");
        }
    } else {
        if (($("#supportGsdInfo").val() == "1" || $("#supportGsdInfo").val() == "3") && !$("#pick_shipment_item").hasClass("curr")) {
            if ($("#gsd_shipment_item").hasClass("curr")) {
                $("#gsd_date").html("<span class='ftx-03'>极速达：工作日、双休日与节假日均可送货</span>");
                $("#gsd_shipment").removeClass("hide");
                $("#jd_shipment").addClass("hide");
                $("#gsd-old-ships").show();
                $("#gsd-new-times-ymr").hide();
                $("#gsd-new-times-wmr").hide();
            }
        } else {
            $("#gsd_shipment_item").addClass("hide");
        }
    }
    if (promise311.support) {
        var va = $("#shipment_support_type").val();
        $("#shipment_support_type").val(va + "1");
        $("#311_show_id").removeClass("hide");
        //隐藏域，用户存日历控件时间段
        $("#calendar_hdata").val(JSON.stringify(promise311.timeRangeTitle));
        $("#calendar_ddata").val(JSON.stringify(promise311.days));
        //设置日历坐标
        $("#calendar_x").val(promise311.date_x);
        $("#calendar_y").val(promise311.date_y);
        //设置上次选中的日期，时间段和sendpay
        $("#last_sel_promiseDate").val(promise311.promiseDate);
        $("#last_sel_promiseTimeRange").val(promise311.promiseTimeRange);
        $("#last_sel_promiseSendPay").val(promise311.promiseSendPay);
        if (typeof promise311.batchId !== 'undefined') {
            $("#last_sel_batchId").val(promise311.batchId);
        }
        //显示修改按钮
        $("#jdshipdate_eidt_id").removeClass("hide");
    }
    var combine = dataResult.combine;
    if (combine && promise311.supportCombine) {
        $("#combine_service").removeClass("hide");
        $("#combine_service").css("display", "block");
        $("#combine_servicebox").attr("checked", true);
    }
    if (promise311.supportCombine) {
        var va = $("#shipment_support_type").val();
        $("#shipment_support_type").val(va + "1");
        $("#311_show_id").removeClass("hide");
        //隐藏域，用户存日历控件时间段
        $("#calendar_hdata").val(JSON.stringify(promise311.timeRangeTitle));
        $("#calendar_ddata").val(JSON.stringify(promise311.days));
        //设置日历坐标
        $("#calendar_x").val(promise311.date_x);
        $("#calendar_y").val(promise311.date_y);
        //设置上次选中的日期，时间段和sendpay
        $("#last_sel_promiseDate").val(promise311.promiseDate);
        $("#last_sel_promiseTimeRange").val(promise311.promiseTimeRange);
        $("#last_sel_promiseSendPay").val(promise311.promiseSendPay);
        $("#saveParam_promiseSendPay").val(promise311.promiseSendPay);
        $("#saveParam_promiseDate").val(promise311.promiseDate); //311配送时间
        $("#saveParam_promiseTimeRange").val(promise311.promiseTimeRange); //预约配送时间段
        $("#saveParam_promiseSendPay").val(promise311.promiseSendPay);
        $("#saveParam_promiseType").val(1); //预约配送类型，1表示311，2表示411
        $("#saveParam_batchId").val(promise311.batchId);
        if (typeof promise311.batchId !== 'undefined') {
            $("#last_sel_batchId").val(promise311.batchId);
        }
        if (promise311.hasCombineCalendar && $("#combine_servicebox").prop("checked")) {
            //显示修改按钮
            $("#jdshipdate_eidt_id").removeClass("hide");
        } else {
            $("#jdshipdate_eidt_id").addClass("hide");
        }
        $("#combine_service").removeClass("hide");
        $("#combine_service").css("display", "block");
    }
    if (promise311.supportCombine) {
        $("#combine_service").removeClass("hide");
        $("#combine_service").css("display", "block");
    }
    if (promise311.supportCombine && !$("#combine_servicebox").prop("checked")) {
        $("#jdshipdate_eidt_id").addClass("hide");
    }
    if (promise411.support) {
        var va = $("#shipment_support_type").val();
        $("#shipment_support_type").val(va + "2");
        $("#shipment411_sendpay").val(promise411.sendPay);
        $("#shipment411_msg").val(dataResult.promise411.grayMsg);
        if (promise411.grayFlag) {
            //icon隐藏域，当前411是否还支持配送，1支持，2不支持
            $("#shipment_cur411_support").val("2");
        } else {
            $("#411_show_id").removeClass("hide");
            $("#jdshipdate_eidt_id").removeClass("hide");
            $("#shipment_cur411_support").val("1");
        }
        if (typeof promise411.dataFlag !== 'undefined' && promise411.dataFlag) {
            1
            $("#411content4save").val(promise411.promiseMsg);
            $("#speedFreightNote").html(promise411.promiseMsg);
            $("#411content").val(promise411.promiseMsg);
        } else {
            $("#411content4save").val("0");
            $("#411content").val("0");
        }
    }
    if ((typeof promiseJzd !== 'undefined') && promiseJzd.support) {
        var va = $("#shipment_support_type").val();
        $("#shipment_support_type").val(va + "3");
        $("#zxj_show_id").removeClass("hide");
        $("#calendar_hdata_zxj_jzd").val(JSON.stringify(promiseJzd.timeRangeTitle));
        $("#calendar_ddata_zxj_jzd").val(JSON.stringify(promiseJzd.days));
        //设置日历坐标
        $("#calendar_x_zxj_jzd").val(promiseJzd.date_x);
        $("#calendar_y_zxj_jzd").val(promiseJzd.date_y);
        //设置上次选中的日期，时间段和sendpay
        $("#last_sel_promiseDate_zxj_jzd").val(promiseJzd.promiseDate);
        $("#last_sel_promiseTimeRange_zxj_jzd").val(promiseJzd.promiseTimeRange);
        $("#last_sel_promiseSendPay_zxj_jzd").val(promiseJzd.promiseSendPay);
        $("#last_sel_batchId_zxj_jzd").val(promiseJzd.batchId);
        //显示修改按钮
        $("#jdshipdate_eidt_id").removeClass("hide");
    }
    if (promise311.selected || $("#combine_servicebox").prop("checked")) {
        $("#shipment_select_support").val("1");
        //为311隐藏域赋值
        $("#saveParam_promiseDate").val(promise311.promiseDate); //311配送时间
        $("#saveParam_promiseTimeRange").val(promise311.promiseTimeRange); //预约配送时间段
        $("#saveParam_promiseSendPay").val(promise311.promiseSendPay);
        if (typeof promise311.batchId !== 'undefined') {
            $("#saveParam_batchId").val(promise311.batchId);
        }
        $("#saveParam_promiseType").val(1); //预约配送类型，1表示311，2表示411
        $("#saveParam_jdShipTime").val(4);
        setJdShipmentCalendarDate(dataResult.promise311.show311Text);

        if (promise311.supportInstall) {
            $("#saveParam_installTimeOffest").val(promise311.selectedInstallOffset);
            $("#item_installDate").show();
            //$("#jd_install_date_div .mode-infor").html(promise311.installDateText+"<br><span class='ftx-03'>只针对京东上门安装商品</span>");
            flushJdInstallDate(promise311.installDateViewList);
        }
    }
    if (promise411.selected) {
        $("#shipment_select_support").val("2");
        if (promise411.grayFlag) {
            $("#saveParam_promiseType").val(""); //既不是311也不是411
            $("#saveParam_jdShipTime").val(3); //节假日、工作日均可
            //设置配送时间为节假日和工作日均可
            setJdShipmentCalendarDate('');
        } else {
            $("#saveParam_promiseType").val(2); //预约配送类型，1表示311，2表示411
            $("#saveParam_jdShipTime").val(5); //节假日、工作日均可
            //修改按钮显示
            $("#saveParam_promiseSendPay").val(promise411.sendPay);
        }
    } else {
        if (!promise311.selected && !promise311.hasCombineCalendar) {
            $("#saveParam_promiseType").val(""); //既不是311也不是411
            $("#saveParam_jdShipTime").val(3); //节假日、工作日均可
        }
    }
    if (promise311.support && typeof promiseJzd !== 'undefined' && promiseJzd.forcedChoice) {
        $("#forcedChoice").val(promiseJzd.forcedChoice);
        if (promiseJzd.forcedChoice) {
            $("#delivery-info-li-zxj").hide();
        }
    }
    if ((typeof promiseJzd !== 'undefined') && promiseJzd.selected) {
        $("#forcedChoice").val(promiseJzd.forcedChoice);
        if (promiseJzd.forcedChoice && $("#newForcedChoice").val() == "0") {
            $("#forcedChoice-times").show();
            $("#shipment_times").hide();
            $("#delivery-info-li-zxj").hide();

            $("#shipment_select_support").val("3");
            $("#saveParam_promiseDate").val("");
            $("#saveParam_promiseTimeRange").val("");
            $("#saveParam_promiseSendPay").val("");
            $("#saveParam_batchId").val("");
            $("#saveParam_promiseType").val(3);
            $("#saveParam_jdShipTime").val(6);
        } else {
            if (!promise311.support && promiseJzd.support && promiseJzd.selected) {
                $("#forcedChoice-sales").show();
                $("#delivery-info-li-zxj").hide();
            }
            $("#forcedChoice-times").hide();
            if (!$("#car_shipment_item").hasClass("curr")) {
                $("#shipment_times").show();
            } else {
                $("#car_tips_on").html("准时送达");
                $("#forcedChoice-times").show();
                $("#shipment_times").hide();
                $("#delivery-info-li-zxj").hide();
                $("#selfpick_shipment").addClass("hide");
                $("#car_tips").removeClass("hide");
                $("#car_Agreement_tips").removeClass("hide");
            }


            $("#shipment_select_support").val("3");
            $("#saveParam_promiseDate").val(promiseJzd.promiseDate);
            $("#saveParam_promiseTimeRange").val(promiseJzd.promiseTimeRange);
            $("#saveParam_promiseSendPay").val(promiseJzd.promiseSendPay);
            $("#saveParam_batchId").val(promiseJzd.batchId);
            $("#saveParam_promiseType").val(3);
            $("#saveParam_jdShipTime").val(6);
            setJdShipmentCalendarDate(promiseJzd.show311Text);

            if (promiseJzd.supportInstall) {
                $("#saveParam_installTimeOffest").val(promiseJzd.selectedInstallOffset);
                $("#item_installDate").show();
                //$("#jd_install_date_div .mode-infor").html(promiseJzd.installDateText+"<br><span class='ftx-03'>只针对京东上门安装商品</span>");
                flushJdInstallDate(promiseJzd.installDateViewList);
            }

        }
    }

    if (typeof carDeliverJzd !== 'undefined' && carDeliverJzd.support) {
        $("#car_shipment_item").removeClass("hide");
        $("#calendar_hdata_car_jzd").val(JSON.stringify(carDeliverJzd.timeRangeTitle));
        $("#calendar_ddata_car_jzd").val(JSON.stringify(carDeliverJzd.days));

        //设置日历坐标
        $("#calendar_x_car_jzd").val(carDeliverJzd.date_x);
        $("#calendar_y_car_jzd").val(carDeliverJzd.date_y);
        //设置上次选中的日期，时间段和sendpay
        //$("#last_sel_promiseDate_zxj_jzd").val(promiseJzd.promiseDate);
        //$("#last_sel_promiseTimeRange_zxj_jzd").val(promiseJzd.promiseTimeRange);
        //$("#last_sel_promiseSendPay_zxj_jzd").val(promiseJzd.promiseSendPay);
        //$("#last_sel_batchId_zxj_jzd").val(promiseJzd.batchId);
        //显示修改按钮
        //$("#jdshipdate_eidt_id").removeClass("hide");
        if (!$("#Honor_shipment_item_0").hasClass("hide") && !$("#car_shipment_item").hasClass("mt10")) {
            $("#car_shipment_item").addClass("mt10");
        }
    } else {
        $("#car_shipment_item").addClass("hide");
        $("#car_Agreement_tips").addClass("hide");
    }
    //蔚蓝汽车
    if (typeof carDeliverJzd !== 'undefined' && carDeliverJzd.selected) {
        $("#forcedChoice-times").hide();
        $("#shipment_times").show();
        $("#delivery-info-li-zxj").hide();
        $("#shipment_select_support").val("3");
        $("#saveParam_promiseDate").val(carDeliverJzd.promiseDate);
        $("#saveParam_promiseTimeRange").val(carDeliverJzd.promiseTimeRange);
        $("#saveParam_promiseSendPay").val(carDeliverJzd.promiseSendPay);
        $("#saveParam_batchId").val(carDeliverJzd.batchId);
        $("#saveParam_promiseType").val(3);
        $("#saveParam_jdShipTime").val(6);
        $("#jd_shipment_calendar_date").html(carDeliverJzd.show311Text);
        $("#car_shipment_item").addClass("curr");
        $("#jd_shipment_item").removeClass("curr");
        $("#gsd_shipment_item").removeClass("curr");
        $("#car_tips").removeClass("hide");
    }
    if (!$("#car_shipment_item").hasClass("curr") && !$("#car_Agreement_tips").hasClass("hide")) {
        $("#car_Agreement_tips").addClass("hide");
    }

    if (promise311.support || (promise411.support && !promise411.grayFlag) || ((typeof promiseJzd !== 'undefined') && promiseJzd.support)) {
        $("#jdShip-span-tip .qmark-icon").attr('data-tips', '此订单支持预约配送，您可以选择指定的时间段');
    } else if ($("#containFactoryShip").val() == 0) {
        $("#jdShip-span-tip .qmark-icon").attr('data-tips', '由京东公司负责配送，速度很快，还接受上门刷卡付款服务');
    }
    if ((promise411.support && !promise411.grayFlag) || ((typeof promiseJzd !== 'undefined') && promiseJzd.support)) {
    } else {
        $("#delivery-info-li-zxj").hide();
    }
    if ($("#shipment_select_support").val() == "") {
        $("#delivery-info-li-zxj").hide();
        setJdShipmentCalendarDate('');
        if ($(".presale-payment-item").hasClass("item-selected")) {
            $("#forcedChoice-times").hide();
            $("#shipment_times").show();
            $("#jdshipdate_eidt_id").addClass("hide");
            $("#forcedChoice-sales").hide();
        }
    }
    if ($("#containFactoryShip").val() > 0 && dataResult.promise311 && dataResult.promise311.promiseMsg) {
        setJdShipmentCalendarDate('<span class="ftx-03">配送时间：</span>' + dataResult.promise311.promiseMsg);
    }
    if (typeof promiseJzd !== 'undefined' && promiseJzd.forcedChoice) {
        $("#delivery-info-li-zxj").hide();
    }
}

//点击选择京东配送，显示311日历或者411极速达
var calendar2;

function doEdit311Time(shipTypeId, flag, newCalendarType) {

    var id = "jd_shipment_calendar_v2_zy";
    if ($("#car_shipment_item").hasClass("curr")) {
        id = "car_shipment_calendar_v2_zy";
    }
    if ($("#gsd_shipment_item").hasClass("curr")) {
        id = "gsd_shipment_calendar_v2_zy";
    }
    var selectType;
    if (shipTypeId) {
        if (shipTypeId == 3) {
            selectType = "0";
        } else if (shipTypeId == 1) {
            selectType = "1";
        } else if (shipTypeId == 2) {
            selectType = "2";
        }
    }
    if (id != null && ($("#calendarVersion").val() == "1" || $("#calendarVersion").val() == "2") && typeof $("#" + id).html() !== 'undefined' && $("#" + id).html() != "" && $("#" + id).html() != null && $("#" + id).html() != "[]") {
        if ((shipTypeId == 3 || $("#shipment_select_support").val() == "3" || $("#shipment_select_support").val() == "2") && typeof (flag) != "undefined" && flag == 1) {
            $("#311flag").val("1");
        } else {
            $("#311flag").val("0");
        }
        if ($("#forcedChoice").val() == "true") {
            $("#311flag").val("1");
        } else {
            $("#311flag").val("0");
        }
        showDeliveryDialog(id, selectType);
        return;
    }

    seajs.use(['user/purchase/2.0.0/js/deliveryCalendarFreight.js', 'user/purchase/2.0.0/js/deliveryCalendar.js'], function (DeliveryCalendarFreight, DeliveryCalendar) {
        var shipmentSupportType = $("#shipment_support_type").val();
        var _width = 650;
        //选择京准达或者极速达的时候设置标
        if ((shipTypeId == 3 || $("#shipment_select_support").val() == "3" || $("#shipment_select_support").val() == "2") && typeof (flag) != "undefined" && flag == 1) {
            $("#311flag").val("1");
        } else {
            $("#311flag").val("0");
        }
        if ($("#forcedChoice").val() == "true") {
            $("#311flag").val("1");
        } else {
            $("#311flag").val("0");
        }
        var calendarHtml = $("#shipment_hidediv").html();
        $('body').dialog({
            title: '配送时间',
            width: _width,
            type: 'html',
            source: calendarHtml,
            onReady: function () {

                if (shipTypeId == null || shipTypeId == "" || shipTypeId == "undefined" || shipTypeId == undefined || shipTypeId == "null") {
                    var shipmentSelSupport = $("#shipment_select_support").val();
                } else {
                    var shipmentSelSupport = shipTypeId;
                }
                var calendar;


                //只有311才创建组件
                if (shipmentSupportType.indexOf("1") != -1) {
                    var hData = jQuery.parseJSON($("#calendar_hdata").val());
                    var dData = jQuery.parseJSON($("#calendar_ddata").val());
                    var xy = new Array();
                    if ($("#calendar_x").val() != "undefined" && $("#calendar_x").val() != "") {
                        xy[0] = $("#calendar_x").val();
                        xy[1] = $("#calendar_y").val();
                        calendar = new DeliveryCalendar(hData, dData, $('#date-delivery1'), xy); //初始化
                    }
                } else {
                    $("#li_311_id").hide();
                    $("#tab_311_div").hide();
                    $('#timeSave311').hide();
                }
                if (shipmentSupportType.indexOf("2") == -1 || $("#shipment_cur411_support").val() == "2") {
                    $("#li_411_id").hide();
                    $("#timeSave411").hide();
                    //修改提示信息
                    $("#message_show_411").html('温馨提示：当前时段不支持极速达业务，请选择其他配送方式！');
                    $("#li_411_id .qmark-icon").attr('data-tips', $("#shipment411_msg").val());
                }
                if (shipmentSupportType.indexOf("3") != -1) {
                    if ($("#forcedChoice").val()) {
                        log('gz_ord', 'gz_proc', 18, 'forcedChoice');//点击预约日历埋点
                    }
                    if ($("#gsd_shipment_item").hasClass("curr")) {
                        var hData2 = jQuery.parseJSON($("#gsd_calendar_hdata_zxj_jzd").val());
                        var dData2 = jQuery.parseJSON($("#gsd_calendar_ddata_zxj_jzd").val());
                        var xy2 = new Array();
                        if (typeof ($("#gsd_calendar_x_zxj_jzd").val()) != "undefined" && $("#gsd_calendar_x_zxj_jzd").val() != "") {
                            xy2[0] = $("#gsd_calendar_x_zxj_jzd").val();
                            xy2[1] = $("#gsd_calendar_y_zxj_jzd").val();
                            calendar2 = new DeliveryCalendarFreight(hData2, dData2, $('#date-delivery0'), xy2); //初始化
                        } else {
                            calendar2 = new DeliveryCalendarFreight(hData2, dData2, $('#date-delivery0'), xy2); //初始化
                        }
                    } else {
                        var hData2 = jQuery.parseJSON($("#calendar_hdata_zxj_jzd").val());
                        var dData2 = jQuery.parseJSON($("#calendar_ddata_zxj_jzd").val());
                        var xy2 = new Array();
                        if (typeof ($("#calendar_x_zxj_jzd").val()) != "undefined" && $("#calendar_x_zxj_jzd").val() != "") {
                            xy2[0] = $("#calendar_x_zxj_jzd").val();
                            xy2[1] = $("#calendar_y_zxj_jzd").val();
                            calendar2 = new DeliveryCalendarFreight(hData2, dData2, $('#date-delivery0'), xy2); //初始化
                            var hidCalTag = $("#hid_calendar_tag").val();
                            if (hidCalTag != "") {
                                $("#jzd_calendar_tag").html(hidCalTag).addClass("delivery-gap-con");
                            }
                        }
                    }
                } else {
                    $("#tab_zxj_div").hide();
                    $("#li_zxj_id").hide();
                    $('#timeSaveZxj').hide();
                }
                if (shipmentSelSupport == "1" || $("#combine_servicebox").prop("checked")) {
                    $("#li_311_id").show();
                    $("#li_311_id").addClass("tab-item-selected");
                    $("#li_411_id").removeClass("tab-item-selected");
                    $("#li_zxj_id").removeClass("tab-item-selected");
                    $("#tab_311_div").show();
                    $("#tab_411_div").hide();
                    $("#tab_zxj_div").hide();
                }
                if (shipmentSelSupport == "2") {
                    if ($("#shipment_cur411_support").val() == "1") {
                        $("#li_411_id").show();
                        $("#li_411_id").addClass("tab-item-selected");
                        $("#li_zxj_id").removeClass("tab-item-selected");
                        $("#li_311_id").removeClass("tab-item-selected");
                        $("#tab_311_div").hide();
                        $("#tab_411_div").show();
                        $("#tab_zxj_div").hide();
                    } else if ($("#shipment_cur411_support").val() == "2") {
                        $("#li_411_id").addClass("tab-item-selected disabled");
                        $("#timeSave411").hide();
                        //修改提示信息
                        $("#message_show_411").html('温馨提示：当前时段不支持极速达业务，请选择其他配送方式！');
                        $("#li_411_id .qmark-icon").attr('data-tips', $("#shipment411_msg").val());
                    }
                }
                if ($("#411content").val() != "0") {
                    $("#411_content_div").html($("#411content").val());
                }
                if (shipmentSelSupport == "3") {
                    $("#li_zxj_id").show();
                    $("#li_zxj_id").addClass("tab-item-selected");
                    $("#li_311_id").removeClass("tab-item-selected");
                    $("#li_411_id").removeClass("tab-item-selected");
                    $("#tab_311_div").hide();
                    $("#tab_411_div").hide();
                    $("#tab_zxj_div").show();
                }

                if ($("#car_shipment_item").hasClass("curr")) {
                    $("#li_311_id").hide();
                    $("#tab_311_div").hide();
                    $('#timeSave311').hide();
                    $("#li_411_id").hide();
                    $("#timeSave411").hide();
                    var hData2 = jQuery.parseJSON($("#calendar_hdata_car_jzd").val());
                    var dData2 = jQuery.parseJSON($("#calendar_ddata_car_jzd").val());
                    var xy2 = new Array();
                    if (typeof ($("#calendar_x_car_jzd").val()) != "undefined" && $("#calendar_x_car_jzd").val() != "") {
                        xy2[0] = $("#calendar_x_car_jzd").val();
                        xy2[1] = $("#calendar_y_car_jzd").val();
                        calendar2 = new DeliveryCalendarFreight(hData2, dData2, $('#date-delivery0'), xy2); //初始化
                        var hidCalTag = $("#hid_calendar_tag").val();
                        if (hidCalTag != "") {
                            $("#jzd_calendar_tag").html(hidCalTag).addClass("delivery-gap-con");
                        }
                    }
                }
                if ($("#gsd_shipment_item").hasClass("curr")) {
                    $("#li_zxj_id").hide();
                    $("#li_311_id").hide();
                    $("#li_411_id").hide();
                    $("#tab_311_div").hide();
                    $("#timeSave411").hide();
                }
                // 618促销配送信息
                shipmentTips618();
                $('#timeSaveZxj').bind('click', function () {
                    $("#saveParam_immediateDelivery").val("");
                    if ($("#311flag").val() == "1") {
                        $("#newForcedChoice").val("1");
                    } else {
                        $("#newForcedChoice").val("0");
                    }
                    if ($("#gsd_shipment_item").hasClass("curr")) {
                        $("#gsd_newForcedChoice").val("1");
                    } else {
                        $("#gsd_newForcedChoice").val("0");
                    }
                    if (JSON.stringify(calendar2.result) == "{}" && $("#calendar_x_zxj_jzd").val() == "" && $("#gsd_calendar_x_zxj_jzd").val() == "") {
                        alert("您还没有指定配送时间");
                        return;
                    } else if (JSON.stringify(calendar2.result) != "{}") {
                        if (calendar2.result.range != null && calendar2.result.range.length > 3 && calendar2.result.range.substring(0, 3) == "立即送") {
                            if (calendar2.result.xy[0] == 0 && calendar2.result.xy[1] == 0 && $("#gsd_immediately").val() == "true") {
                                $("#saveParam_immediateDelivery").val("1");
                            }
                        } else {
                            //给隐藏域赋值
                            $("#saveParam_promiseType").val(3); //预约配送类型，
                            $("#saveParam_jdShipTime").val(6);  //1，表示只工作日，2，表示只周末，3表示工作日、节假日均可，4表示311,5表示极速达 ,6表示京准达
                            $("#saveParam_promiseDate").val(calendar2.result.day);
                            $("#saveParam_promiseTimeRange").val(calendar2.result.range);
                            $("#saveParam_immediateDelivery").val("2");
                            var data = (calendar2.result['date-range']).split('-');

                            var dataLength = data.length - 1;//获取tdc京准达波次在数组的下标值
                            $("#tdc_cutOrder").val(data[dataLength]);
                            localStorage.setItem("tdc_cutOrder", data[dataLength]);//tdc京准达波次放入localStorage中，防止多次保存大家电日历刷新，使得隐藏域中tdc_cutOrder的值重置为空，再去从localStorage中获取

                            $("#saveParam_promiseSendPay").val(data[0]);
                            if (data.length > 1) {
                                $("#saveParam_batchId").val(data[1]);
                            }
                            if ($("#gsd_shipment_item").hasClass("curr")) {
                                $("#gsd_calendar_x_zxj_jzd").val(calendar2.result.xy[0]);
                                $("#gsd_calendar_y_zxj_jzd").val(calendar2.result.xy[1]);
                            } else {
                                $("#calendar_x_zxj_jzd").val(calendar2.result.xy[0]);
                                $("#calendar_y_zxj_jzd").val(calendar2.result.xy[1]);
                            }
                        }

                    } else if (JSON.stringify(calendar2.result) == "{}") {
                        $("#saveParam_promiseType").val(3); //预约配送类型，
                        $("#saveParam_jdShipTime").val(6); //1，表示只工作日，2，表示只周末，3表示工作日、节假日均可，4表示311,5表示极速达,6表示京准达
                        //如果上次有选中的日期，则用上次日期，否则默认一个
                        if ($("#gsd_shipment_item").hasClass("curr")) {
                            if ($("#gsd_last_sel_promiseDate_zxj_jzd").val() !== "" && $("#gsd_last_sel_promiseDate_zxj_jzd").val() !== null && $("#gsd_last_sel_promiseDate_zxj_jzd").val() !== "undefined" && $("#gsd_last_sel_promiseDate_zxj_jzd").val() !== undefined) {
                                $("#saveParam_promiseDate").val($("#gsd_last_sel_promiseDate_zxj_jzd").val());
                                $("#saveParam_promiseTimeRange").val($("#gsd_last_sel_promiseTimeRange_zxj_jzd").val());
                                $("#saveParam_promiseSendPay").val($("#gsd_last_sel_promiseSendPay_zxj_jzd").val());
                                $("#saveParam_batchId").val($("#gsd_last_sel_batchId_zxj_jzd").val());
                                if ($("#gsd_calendar_x_zxj_jzd").val() == "0" && $("#gsd_calendar_y_zxj_jzd").val() == "0" && $("#gsd_immediately").val() == "true") {
                                    $("#saveParam_immediateDelivery").val("1");
                                } else {
                                    $("#saveParam_immediateDelivery").val("2");
                                }
                            } else {
                                // 日历为空没有选择给一个默认的过期时间，异步验证会取最近的时间，提升用户体验
                                $("#saveParam_promiseDate").val("2011-06-27");
                                $("#saveParam_promiseTimeRange").val("{'1':1,'35':0,'30':1}");
                                $("#saveParam_promiseSendPay").val("9:00-15:00");
                                $("#saveParam_batchId").val("1");
                                $("#saveParam_immediateDelivery").val("2");
                            }
                        } else {
                            if ($("#last_sel_promiseDate_zxj_jzd").val() !== "" && $("#last_sel_promiseDate_zxj_jzd").val() !== null && $("#last_sel_promiseDate_zxj_jzd").val() !== "undefined" && $("#last_sel_promiseDate_zxj_jzd").val() !== undefined) {
                                $("#saveParam_promiseDate").val($("#last_sel_promiseDate_zxj_jzd").val());
                                $("#saveParam_promiseTimeRange").val($("#last_sel_promiseTimeRange_zxj_jzd").val());
                                $("#saveParam_promiseSendPay").val($("#last_sel_promiseSendPay_zxj_jzd").val());
                                $("#saveParam_batchId").val($("#last_sel_batchId_zxj_jzd").val());
                            } else {
                                // 日历为空没有选择给一个默认的过期时间，异步验证会取最近的时间，提升用户体验
                                $("#saveParam_promiseDate").val("2011-06-27");
                                $("#saveParam_promiseTimeRange").val("{'1':1,'35':0,'30':1}");
                                $("#saveParam_promiseSendPay").val("9:00-15:00");
                                $("#saveParam_batchId").val("1");
                            }
                        }

                    }
                    $("#reset_promise_311").val("1"); //是否需要重置311,不重置311
                    jQuery.closeDialog();
                    if ($("#car_shipment_item").hasClass("curr")) {
                        doSavePayAndShipmentInfo("car_shipment");
                    } else if ($("#gsd_shipment_item").hasClass("curr")) {
                        doSavePayAndShipmentInfo("gsd_shipment");
                    } else {
                        doSavePayAndShipmentInfo("jd_shipment");
                    }
                });
                $('#timeSave311').bind('click', function () {
                    if ($("#forcedChoice").val() == "true") {
                        $("#newForcedChoice").val("1");
                        $("#311flag").val("1");
                    } else {
                        $("#newForcedChoice").val("0");
                        $("#311flag").val("0");
                    }
                    try {
                        //tdc京准达多波次标示置空
                        $("#tdc_cutOrder").val("");
                        localStorage.removeItem("tdc_cutOrder");
                    } catch (e) {
                    }
                    if (JSON.stringify(calendar.result) == "{}" && $("#calendar_x").val() == "") {
                        alert("您还没有指定配送时间");
                        return;
                    } else if (JSON.stringify(calendar.result) != "{}") {
                        //给隐藏域赋值
                        $("#saveParam_promiseType").val(1); //预约配送类型，1表示311，2表示411
                        $("#saveParam_jdShipTime").val(4);
                        $("#saveParam_promiseDate").val(calendar.result.day);
                        $("#saveParam_promiseTimeRange").val(calendar.result.range);
                        var data = (calendar.result['date-range']).split('-');
                        $("#saveParam_promiseSendPay").val(data[0]);
                        if (data.length > 1) {
                            $("#saveParam_batchId").val(data[1]);
                        }
                        $("#calendar_x").val(calendar.result.xy[0]);
                        $("#calendar_y").val(calendar.result.xy[1]);
                    } else if (JSON.stringify(calendar.result) == "{}") {
                        $("#saveParam_promiseType").val(1); //预约配送类型，1表示311，2表示411
                        $("#saveParam_jdShipTime").val(4); //1，表示只工作日，2，表示只周末，3表示工作日、节假日均可，4表示311,5表示极速达
                        //如果上次有选中的日期，则用上次日期，否则默认一个
                        if ($("#last_sel_promiseDate").val() !== "" && $("#last_sel_promiseDate").val() !== null && $("#last_sel_promiseDate").val() !== "undefined" && $("#last_sel_promiseDate").val() !== undefined) {
                            $("#saveParam_promiseDate").val($("#last_sel_promiseDate").val());
                            $("#saveParam_promiseTimeRange").val($("#last_sel_promiseTimeRange").val());
                            $("#saveParam_promiseSendPay").val($("#last_sel_promiseSendPay").val());
                            $("#saveParam_batchId").val($("#last_sel_batchId").val());
                        } else {
                            // 日历为空没有选择给一个默认的过期时间，异步验证会取最近的时间，提升用户体验
                            $("#saveParam_promiseDate").val("2011-06-27");
                            $("#saveParam_promiseTimeRange").val("{'1':1,'35':0,'30':1}");
                            $("#saveParam_promiseSendPay").val("9:00-15:00");
                            $("#saveParam_batchId").val("1");
                        }
                    }
                    $("#reset_promise_311").val("1"); //是否需要重置311,不重置311
                    $("#shipment_times").show();
                    $("#forcedChoice-times").hide();
                    jQuery.closeDialog();
                    doSavePayAndShipmentInfo("jd_shipment");
                });
                $('#timeSave411').bind('click', function () {
                    //选择极速达重置newForcedChoice标
                    if ($("#311flag").val() == "1") {
                        $("#newForcedChoice").val("1");
                    } else {
                        $("#newForcedChoice").val("0");
                    }
                    //先把311参数设置为空
                    $("#saveParam_promiseDate").val("");
                    $("#saveParam_promiseTimeRange").val("");
                    $("#saveParam_promiseSendPay").val($("#shipment411_sendpay").val());
                    //给隐藏域赋值

                    $("#saveParam_promiseType").val(2); //预约配送类型，1表示311，2表示411
                    $("#saveParam_jdShipTime").val(5);
                    //更新配送时间说明
                    if ($("#411content").val() != "0" && $("#411content4save").val() != "0") {
                        setJdShipmentCalendarDate('<span class="ftx-03">配送时间：</span><font id="speedFreightNote">' + $("#411content4save").val() + '</font>');
                    } else {
                        setJdShipmentCalendarDate('<span class="ftx-03">配送时间：</span><font id="speedFreightNote">极速达（2小时之内送达）</font>');
                    }
                    $("#reset_promise_311").val("1"); //是否需要重置311,不重置311
                    //日历支持极速达，但是没有极速达配送时间模块时，将其展示出来
                    if ($("#forcedChoice-times").css("display") != 'none' && $("#shipment_times").css("display") == 'none') {
                        $("#shipment_times").show();
                        $("#forcedChoice-times").hide();
                    }
                    $("#forcedChoice-sales").hide();
                    jQuery.closeDialog();
                    doSavePayAndShipmentInfo("jd_shipment");
                });
                var copywritingContent = $("#copywritingContent").val();
                if (copywritingContent != 0) {
                    $("#li_zxj_id").html(copywritingContent);
                }
                $("#jzdAmount").html($("#jzdAmount_hidden").val());
                $("#jsdAmount").html($("#jsdAmount_hidden").val());
            } //onready end
        });
    })
}

//311、411切换功能
function doSwith311Tab(tabFlag) {
    if (tabFlag == "zxj") {
        if ($("#li_zxj_id").hasClass("disabled")) {
            return;
        }
        $("#li_zxj_id").addClass("tab-item-selected");
        $("#li_311_id").removeClass("tab-item-selected");
        $("#li_411_id").removeClass("tab-item-selected");
        $("#tab_zxj_div").show();
        $("#tab_311_div").hide();
        $("#tab_411_div").hide();
    } else if (tabFlag == "311") {
        if ($("#li_311_id").hasClass("disabled")) {
            return;
        }
        $("#li_311_id").addClass("tab-item-selected");
        $("#li_zxj_id").removeClass("tab-item-selected");
        $("#li_411_id").removeClass("tab-item-selected");
        $("#tab_311_div").show();
        $("#tab_411_div").hide();
        $("#tab_zxj_div").hide();
    } else if (tabFlag == "411") {
        if ($("#li_411_id").hasClass("disabled")) {
            return;
        } else {
            $("#li_411_id").addClass("tab-item-selected");
            $("#li_311_id").removeClass("tab-item-selected");
            $("#li_zxj_id").removeClass("tab-item-selected");
            $("#tab_411_div").show();
            $("#tab_311_div").hide();
            $("#tab_zxj_div").hide();
        }
    }
}

function getTagCalendar(id, tagType) {
    var venderid;
    if (id != null && id != "" && id.indexOf("zy") < 0) {
        var data = id.split('_');
        venderid = data[data.length - 1];
    }
    var actionUrl = OrderAppConfig.DynamicDomain + "/payAndShip/getPromise311.action";
    var payId = $('.payment-item.item-selected').attr('payId');
    initResetFlag();
    if (tagType == "0") {
        tagType = "2020";
    } else if (tagType == "1") {
        tagType = "2010";
    } else if (tagType == "2") {
        tagType = "2005";
    }
    if (isEmpty(payId)) {
        payId = 4;
    }
    var param = "paymentId=" + payId + "&promiseTagType=" + tagType;
    param = addFlowTypeParam(param);
    if (venderid != null) {
        param = param + "&sopVenderId=" + venderid;
    } else {
        $("#zxj_promiseTagType").val(tagType);//时效类型
    }
    var result;
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: actionUrl,
        data: param,
        async: false,
        cache: false,
        success: function (dataResult, textStatus) {
            // 没有登录跳登录
            if (isUserNotLogin(dataResult)) {
                goToLogin();
                return;
            }
            if (dataResult.success == false) {
                //$("#jd_shipment_calendar_date").html('<span class="ftx-03">配送时间：</span>工作日、双休日与节假日均可送货');
                alert("接口无数据");
                return;
            }
            var promiseJzd = dataResult.promiseZxjJzd;

            result = promiseJzd.newVersionCalendar;
        },
        error: function (XMLHttpResponse) {
            return null;
        }
    })
    return result;

}

function doZxjzdTab(type, venderid) {
    seajs.use(['user/purchase/2.0.0/js/deliveryCalendarFreight.js', 'user/purchase/2.0.0/js/deliveryCalendar.js'], function (DeliveryCalendarFreight, DeliveryCalendar) {
        var actionUrl = OrderAppConfig.DynamicDomain + "/payAndShip/getPromise311.action";
        var payId = $('.payment-item.item-selected').attr('payId');
        initResetFlag();
        if (isEmpty(payId)) {
            payId = 4;
        }
        var param = "paymentId=" + payId + "&promiseTagType=" + type;
        param = addFlowTypeParam(param);
        if (venderid != null) {
            param = param + "&sopVenderId=" + venderid;
        } else {
            $("#zxj_promiseTagType").val(type);//时效类型
        }
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: actionUrl,
            data: param,
            cache: false,
            success: function (dataResult, textStatus) {
                // 没有登录跳登录
                if (isUserNotLogin(dataResult)) {
                    goToLogin();
                    return;
                }
                if (dataResult.success == false) {
                    //$("#jd_shipment_calendar_date").html('<span class="ftx-03">配送时间：</span>工作日、双休日与节假日均可送货');
                    alert("接口无数据");
                    return;
                }
                var promiseJzd = dataResult.promiseZxjJzd;
                if (venderid != null) {
                    var hData2 = jQuery.parseJSON(JSON.stringify(promiseJzd.timeRangeTitle));
                    var dData2 = jQuery.parseJSON(JSON.stringify(promiseJzd.days));
                    var xy2 = new Array();
                    if (promiseJzd.date_x != "" && promiseJzd.date_y != "") {
                        xy2[0] = promiseJzd.date_x;
                        xy2[1] = promiseJzd.date_y;
                        calendarSopJzd = new DeliveryCalendarFreight(hData2, dData2, $('#date-delivery-sop-jzd'), xy2); //初始化
                        $("#jzd_calendar_tag_sop").html(promiseJzd.calendarTagText);
                    }
                } else {
                    if ((typeof promiseJzd !== 'undefined') && promiseJzd.support) {
                        /*var va = $("#shipment_support_type").val();
				      		$("#shipment_support_type").val(va+"3");
				      		$("#zxj_show_id").removeClass("hide");*/
                        $("#calendar_hdata_zxj_jzd").val(JSON.stringify(promiseJzd.timeRangeTitle));
                        $("#calendar_ddata_zxj_jzd").val(JSON.stringify(promiseJzd.days));
                        //设置日历坐标
                        $("#calendar_x_zxj_jzd").val(promiseJzd.date_x);
                        $("#calendar_y_zxj_jzd").val(promiseJzd.date_y);
                        //设置上次选中的日期，时间段和sendpay
                        $("#last_sel_promiseDate_zxj_jzd").val(promiseJzd.promiseDate);
                        $("#last_sel_promiseTimeRange_zxj_jzd").val(promiseJzd.promiseTimeRange);
                        $("#last_sel_promiseSendPay_zxj_jzd").val(promiseJzd.promiseSendPay);
                        $("#last_sel_batchId_zxj_jzd").val(promiseJzd.batchId);
                        //显示修改按钮
                        $("#jdshipdate_eidt_id").removeClass("hide");


                        var hData2 = jQuery.parseJSON(JSON.stringify(promiseJzd.timeRangeTitle));
                        var dData2 = jQuery.parseJSON(JSON.stringify(promiseJzd.days));
                        var xy2 = new Array();
                        if (promiseJzd.date_x != "" && promiseJzd.date_y != "") {
                            xy2[0] = $("#calendar_x_zxj_jzd").val();
                            xy2[1] = $("#calendar_y_zxj_jzd").val();
                            calendar2 = new DeliveryCalendarFreight(hData2, dData2, $('#date-delivery0'), xy2); //初始化
                            $("#jzd_calendar_tag").html(promiseJzd.calendarTagText).addClass("delivery-gap-con");
                        }
                        if (promiseJzd.date_x == "") {
                            alert("在日历时间段没有找到预约配送时间段！");
                        }
                        if (promiseJzd.date_y == "") {
                            alert("在日历日期中没有找要配送的日期！");
                        }
                    }
                }

            }
        })
    })
}

//大家电京准达tab切换
function doSwithBigTab(tabFlag) {
    if (tabFlag == "djd") {
        if ($("#bigshipment_jzd_support").val() == "0") {
            return;
        }
        $("#li_djd_id").addClass("tab-item-selected");
        $("#li_bzd_id").removeClass("tab-item-selected");
        $("#li_jsd_id").removeClass("tab-item-selected");
        $("#tab_djd_div").show();
        $("#tab_bzd_div").hide();
        $("#tab_jsd_div").hide();
    } else if (tabFlag == "bzd") {
        if ($("#bigshipment_bzd_support").val() == "0") {
            return;
        }
        $("#li_bzd_id").addClass("tab-item-selected");
        $("#li_djd_id").removeClass("tab-item-selected");
        $("#li_jsd_id").removeClass("tab-item-selected");
        $("#tab_bzd_div").show();
        $("#tab_djd_div").hide();
        $("#tab_jsd_div").hide();
    } else if (tabFlag == "jsd") {
        if ($("#bigshipment_jsd_support").val() == "0") {
            return;
        }
        $("#li_jsd_id").addClass("tab-item-selected");
        $("#li_djd_id").removeClass("tab-item-selected");
        $("#li_bzd_id").removeClass("tab-item-selected");

        do_djd_jsd_msg();
        $("#tab_jsd_div").show();
        $("#tab_djd_div").hide();
        $("#tab_bzd_div").hide();
    }
}

//保存京东配送
function doSaveJdShipment(flag) {
    if (!$("#gsd_shipment_item").hasClass("curr")) {
        $("#gsd_newForcedChoice").val("0");
    }
    doSavePayAndShipmentInfo(flag);
    jQuery.closeDialog();
}

//保存自提点
function doSavePickSite() {
    //给保存设置值
    var pickSiteId = $('#beforePickSiteId').val();
    var pickDate = $('#beforePickDate').val();
    var pickSiteNum = $('#beforePickSiteNum').val();
    var pickRegionId = $('#beforePickRegionId').val();
    var sel_regionid = $('#beforePickSelRegionid').val();
    if (pickSiteId != null && pickSiteId != "") {
        //----保存页面自提数据----
        $('#saveParam_pickSiteId').val(pickSiteId);
        $('#saveParam_pickDate').val(pickDate);
        $('#saveParam_pickSiteNum').val(pickSiteNum);
        $('#saveParam_pickRegionId').val(pickRegionId);
        $('#pick_sel_regionid').val(sel_regionid);
    }
    doSavePayAndShipmentInfo("jd_picksite");
    jQuery.closeDialog();
}

function doSaveDialogPickSite() {
    $("#pick_sel_regionid").val($("#temp_pick_sel_regionid").val());
    doSavePayAndShipmentInfo("save_picksite");
    jQuery.closeDialog();
}

//保存支付方式
function doSavePayWay() {
    $("#saveParam_jdPayWayId").val($('#subpayment .payment-item.item-selected').attr("supPaymentWayId"));
    $("#payment_name_div").html('<span class="ftx-03">付款方式：</span>' + $('#subpayment .payment-item.item-selected').attr("subPaymentWayName"));
    doSavePayAndShipmentInfo("jd_payway_save");
    jQuery.closeDialog();
}

//保存大家电支付方式
function doSaveBigItemPayWay() {
    $("#saveParam_jdPayWayId").val($('#bigItemsubpayment .payment-item.item-selected').attr("supPaymentWayId"));
    $("#payment_name_div_bigItem").html('<span class="ftx-03">付款方式：</span>' + $('#bigItemsubpayment .payment-item.item-selected').attr("subPaymentWayName"));
    doSavePayAndShipmentInfo("jd_payway_save");
    jQuery.closeDialog();
}

//点击切换大家电安装时间
function doSwithInstall(thisElement) {
    $('.li_shipment_install').removeClass().addClass("li_shipment_install");
    $(thisElement).removeClass().addClass("li_shipment_install selected");
}

//点击切换第三方大家电安装时间
function doSwithOtherInstall(thisElement) {
    $('.li_shipment_install_other').removeClass().addClass("li_shipment_install_other");
    $(thisElement).removeClass().addClass("li_shipment_install_other selected");
}

//保存选择的自营落地配小件安装时间
function doSaveJdInstallDate(venderId) {
    var installDate_date = $('.li_shipment_install.selected').attr("installDate_date");
    var installDate_weekDay = $('.li_shipment_install.selected').attr("installDate_weekDay");
    if (installDate_weekDay == undefined || installDate_weekDay == "undefined") {
        installDate_weekDay = "";
    }
    $("#saveParam_installTimeOffest").val($('.li_shipment_install.selected').attr("installDate_offset"));
    doSavePayAndShipmentInfo("jd_installdate");
    $("#reset_promise_311").val("1"); //是否需要重置311,不重置311
    jQuery.closeDialog();
}

//保存选择的大家电安装时间
function doSaveInstallDate(venderId) {
    var installDate_date = $('.li_shipment_install.selected').attr("installDate_date");
    var installDate_weekDay = $('.li_shipment_install.selected').attr("installDate_weekDay");
    if (installDate_weekDay == undefined || installDate_weekDay == "undefined") {
        installDate_weekDay = "";
    }
    $("#install_date_div").html('<span class="mode-label ftx-03">安装时间：</span><div class="mode-infor">' + installDate_date + " " + installDate_weekDay + '<br><span class="ftx-03">' + shmazhTips + '</span></div>');
    $("#saveParam_jdBigItemInstallTimeOffest").val($('.li_shipment_install.selected').attr("installDate_offset"));
    doSavePayAndShipmentInfo("jd_bigitem_installdate");
    $("#reset_promise_311").val("1"); //是否需要重置311,不重置311
    jQuery.closeDialog();
}

//保存选择的第三方大家电安装时间
function doSaveOtherInstallDate(venderId) {
    var installDate_date = $('.li_shipment_install_other.selected').attr("installDate_date");
    var installDate_weekDay = $('.li_shipment_install_other.selected').attr("installDate_weekDay");
    if (installDate_weekDay == undefined || installDate_weekDay == "undefined") {
        installDate_weekDay = "";
    }
    $("#otherinstall_date_div").html('<span class="mode-label ftx-03">安装时间：</span><div class="mode-infor">' + installDate_date + " " + installDate_weekDay + '<br><span class="ftx-03">' + shmazhTips + '</span></div>');
    $("#saveParam_otherBigItemInstallTimeOffset").val($('.li_shipment_install_other.selected').attr("installDate_offset"));
    doSavePayAndShipmentInfo("jd_otherbigitem_installdate");
    $("#reset_promise_311").val("1"); //是否需要重置311,不重置311
    jQuery.closeDialog();
}

//点击切换大家电配送时间
function doSwithBigShip(venderId, thisElement) {
    $('.li_shipment').removeClass().addClass("li_shipment");
    $(thisElement).removeClass().addClass("li_shipment selected");
}

//点击切换第三方大家电配送时间
function doSwithOtherBigShip(venderId, thisElement) {
    $('.li_shipment_other').removeClass().addClass("li_shipment_other");
    $(thisElement).removeClass().addClass("li_shipment_other selected");
}

//保存大家电配送时间
function doSaveBigShipDate() {
    $("#shipment_date_div").html('<span class="ftx-03">配送时间：</span>' + $('.li_shipment.selected').attr("shipDate_date") + " " + $('.li_shipment.selected').attr("shipDate_weekDay"));
    $("#saveParam_jdBigItemShipTimeOffset").val($('.li_shipment.selected').attr("shipDate_offset"));

    $("#saveParam_jdBigItemPromiseType").val(4);
    doSavePayAndShipmentInfo("jd_bigitem_shipdate");
    jQuery.closeDialog();
}

//保存第三方大家电配送时间
function doSaveOtherBigShipDate() {
    $("#othershipment_date_div").html('<span class="ftx-03">配送时间：</span>' + $('.li_shipment_other.selected').attr("shipDate_date") + " " + $('.li_shipment_other.selected').attr("shipDate_weekDay"));
    $("#saveParam_otherBigItemShipOffset").val($('.li_shipment_other.selected').attr("shipDate_offset"));

    $("#saveParam_otherBigItemPromiseType").val(4);
    doSavePayAndShipmentInfo("jd_otherbigitem_shipdate");
    jQuery.closeDialog();
}

//点击进入自提点配送修改时间界面
function doEditPickSiteDate(venderId) {
    var pickSiteShipmentHtml = $("#pickSiteShipDate").html();
    $('body').dialog({
        title: '自提时间',
        width: 530,
        height: 230,
        type: 'html',
        source: pickSiteShipmentHtml,
        onReady: function () {
            //给选中的配送日期设置样式
            var curSelPickSiteDate = $("#saveParam_pickDate").val();
            $(".li_pick_shipment").each(function (index, item) {
                if ($(this).attr("date") == curSelPickSiteDate) {
                    $(this).removeClass().addClass("li_pick_shipment selected");
                    return;
                }
            });
        }
    });
}


//点击选择京东配送，显示大家电日历
function doEditBigShipmentDate(venderId, shipTypeId) {
    var isOtherShipmentType = $("#isOtherShipmentType").val();
    if (isEmpty(isOtherShipmentType)) {
        var bigShipHtml = $("#bigItemShipEdit_" + venderId).html();
        $('body').dialog({
            title: '大件商品配送时间',
            width: 530,
            height: 230,
            type: 'html',
            source: bigShipHtml,
            onReady: function () {
                //给选中的大家电配送日期设置样式
                var curSelBigItemShipOffset = $("#saveParam_jdBigItemShipTimeOffset").val();
                var isOk = false;
                $(".li_shipment").each(function (index, item) {
                    if (curSelBigItemShipOffset != null && $(this).attr("shipDate_offset") == curSelBigItemShipOffset) {
                        $(this).removeClass().addClass("li_shipment selected");
                        isOk = true;
                    }
                });
                //如果没有值，则选中第一个
                if (!isOk) {
                    $(".li_shipment").eq(0).removeClass().addClass("li_shipment selected");
                }
                shipmentTips618();
            }
        });
        return;
    }
    seajs.use(['user/purchase/2.0.0/js/deliveryCalendarFreight.js', 'user/purchase/2.0.0/js/deliveryCalendar.js'], function (DeliveryCalendarFreight, DeliveryCalendar) {
        var hData = jQuery.parseJSON($("#calendar_big_hdata").val());
        var dData = jQuery.parseJSON($("#calendar_big_ddata").val());
        var hDataBzd = jQuery.parseJSON($("#calendar_big_bzd_hdata").val());
        var dDataBzd = jQuery.parseJSON($("#calendar_big_bzd_ddata").val());
        var _width = 660;
        var data = hData == null ? hDataBzd : hData;
        if (data != null && data.length > 8) {
            _width = _width + (data.length - 8) * 53;
        }
        var calendarHtml = $("#bigShipment_hidediv").html();
        $('body').dialog({
            title: '大件商品配送时间',
            width: _width,
            type: 'html',
            source: calendarHtml,
            onReady: function () {
                var bzdSupport = $("#bigshipment_bzd_support").val();
                var jzdSupport = $("#bigshipment_jzd_support").val();
                var jsdSupport = $("#bigshipment_jsd_support").val();
                if (shipTypeId == null || shipTypeId == "" || shipTypeId == "undefined" || shipTypeId == undefined || shipTypeId == "null") {
                    var shipmentSelSupport = $("#bigshipment_select_support").val();
                } else {
                    var shipmentSelSupport = shipTypeId;
                }
                var calendar = null;
                var calendar2 = null;
                if (bzdSupport == "1") {
                    if ($("#bigshipment_bzd_type").val() == "1") {
                        var xy_bzd = new Array();
                        if ($("#calendar_big_bzd_x").val() != "undefined" && $("#calendar_big_bzd_x").val() != "") {
                            xy_bzd[0] = $("#calendar_big_bzd_x").val();
                            xy_bzd[1] = $("#calendar_big_bzd_y").val();
                        }
                        calendar2 = new DeliveryCalendar(hDataBzd, dDataBzd, $('#big-date-delivery1'), xy_bzd); //初始化
                    } else {
                        var bigItemCodDates = jQuery.parseJSON($("#bigItemCodDates").val());
                        var bigHtml = '<div class="date-box"><div class="date-list"><ul>';

                        for (var i = 0; i < bigItemCodDates.length; i++) {
                            if (isOtherShipmentType == "jd") {
                                bigHtml += '<li class="li_shipment" shipDate_offset="' + bigItemCodDates[i].offset + '"  shipDate_date="' + bigItemCodDates[i].date + '" shipDate_weekDay="' + bigItemCodDates[i].week + '" onclick="doSwithBigShip(' + venderId + ',this)">';
                            } else {
                                bigHtml += '<li class="li_shipment_other" shipDate_offset="' + bigItemCodDates[i].offset + '"  shipDate_date="' + bigItemCodDates[i].date + '" shipDate_weekDay="' + bigItemCodDates[i].week + '" onclick="doSwithOtherBigShip(' + venderId + ',this)">';
                            }
                            bigHtml += bigItemCodDates[i].date + '<span class="data">' + bigItemCodDates[i].week + '</span>';
                            bigHtml += '</li>';
                        }
                        bigHtml += "</ul></div>";

                        bigHtml += '<div class="ftx-03 mt10"><i class="date-delivery-icon"></i>'
                            + $('#ddycShipTip').val()
                            + '<div class="tips-618 mt20 hide tips-618-for-calendar">'
                            + '    <div class="tips-con">'
                            + '        <p class="tips-m">双11大促恰逢周末，请确认好收货地址和时间以保证货物及时送达。</p>'
                            + '    </div>'
                            + '</div>'
                            + '<div class="op-btns mt10 ac"> <a id="timeSaveBzd" href="javascript:void(0);" class="btn-1"> 确定 </a>'
                            + '<a href="javascript:jQuery.closeDialog();"  class="btn-9 ml10"> 取消 </a> </div>';
                        $('#tab_bzd_div').html(bigHtml);
                        var curSelBigItemShipOffset;
                        if (isOtherShipmentType == "jd") {
                            curSelBigItemShipOffset = $("#saveParam_jdBigItemShipTimeOffset").val();
                        } else {
                            curSelBigItemShipOffset = $("#saveParam_otherBigItemShipOffset").val();
                        }

                        var isOk = false;
                        if (isOtherShipmentType == "jd") {
                            $(".li_shipment").each(function (index, item) {
                                if (curSelBigItemShipOffset != null && $(this).attr("shipDate_offset") == curSelBigItemShipOffset) {
                                    $(this).removeClass().addClass("li_shipment selected");
                                    isOk = true;
                                    return;
                                }
                            });
                        } else {
                            $(".li_shipment_other").each(function (index, item) {
                                if (curSelBigItemShipOffset != null && $(this).attr("shipDate_offset") == curSelBigItemShipOffset) {
                                    $(this).removeClass().addClass("li_shipment_other selected");
                                    isOk = true;
                                    return;
                                }
                            });
                        }
                        //如果没有值，则选中第一个
                        if (!isOk) {
                            if (isOtherShipmentType == "jd") {
                                $(".li_shipment").eq(0).removeClass().addClass("li_shipment selected");
                            } else {
                                $(".li_shipment_other").eq(0).removeClass().addClass("li_shipment_other selected");
                            }
                        }
                    }

                } else {
                    $("#li_bzd_id").hide();
                    $("#tab_bzd_div").hide();
                    $('#timeSaveBzd').hide();
                }
                if (jzdSupport == "1") {
                    var xy = new Array();
                    if ($("#calendar_big_x").val() != "undefined" && $("#calendar_big_x").val() != "") {
                        xy[0] = $("#calendar_big_x").val();
                        xy[1] = $("#calendar_big_y").val();
                    }
                    calendar = new DeliveryCalendarFreight(hData, dData, $('#big-date-delivery0'), xy); //初始化
                } else {
                    $("#li_djd_id").hide();
                    $("#tab_djd_div").hide();
                    $('#timeSaveDjdJzd').hide();
                }
                //大件极速达
                if (jsdSupport == "1") {
                    var djd_param_obj = getLocalStorageObject("djd_promiseParam");
                    if (djd_param_obj != null) {
                        var txtTag = djd_param_obj.txtTag;//大件仓极速达tag
                        $("#li_jsd_id").html(txtTag);
                    }
                } else {
                    $("#li_jsd_id").hide();
                    $("#tab_jsd_div").hide();
                    $('#timeSaveDjdJsd').hide();
                }

                if (shipmentSelSupport == "1") {//京准达
                    $("#li_djd_id").addClass("tab-item-selected");
                    $("#li_bzd_id").removeClass("tab-item-selected");
                    $("#li_jsd_id").removeClass("tab-item-selected");
                    $("#tab_bzd_div").hide();
                    $("#tab_jsd_div").hide();
                    $("#tab_djd_div").show();
                } else if (shipmentSelSupport == "2") {//标准达
                    $("#li_bzd_id").addClass("tab-item-selected");
                    $("#li_djd_id").removeClass("tab-item-selected");
                    $("#li_jsd_id").removeClass("tab-item-selected");
                    $("#tab_djd_div").hide();
                    $("#tab_jsd_div").hide();
                    $("#tab_bzd_div").show();
                } else if (shipmentSelSupport == "3") {//极速达
                    $("#li_jsd_id").addClass("tab-item-selected");
                    $("#li_bzd_id").removeClass("tab-item-selected");
                    $("#li_djd_id").removeClass("tab-item-selected");
                    $("#tab_djd_div").hide();
                    $("#tab_bzd_div").hide();
                    do_djd_jsd_msg();
                    $("#tab_jsd_div").show();
                }
                $('#timeSaveBzd').bind('click', function () {
                    $("#reset_promise_311").val("1"); //,不重置
                    $("#saveParam_jdBigItemInstallTimeOffest").val($("#bigItemInstallTimeOffest").val());
                    $("#saveParam_otherBigItemInstallTimeOffset").val($("#bigItemInstallTimeOffest").val());
                    setDjdCaldarSaveFlag();//保存大家电日历后,查询配送信息标识
                    if ($("#bigshipment_bzd_type").val() == "1") {
                        if (JSON.stringify(calendar2.result) == "{}" && $("#calendar_big_bzd_x").val() == "") {
                            alert("您还没有指定配送时间");
                            return;
                        } else if (JSON.stringify(calendar2.result) != "{}") {
                            //给隐藏域赋值
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val(4);
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val(calendar2.result.day);
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val(calendar2.result.range);
                            var data = (calendar2.result['date-range']).split('-');
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val(data[0]);
                            if (data.length > 1) {
                                $("#saveParam_" + isOtherShipmentType + "BigItemBatchId").val(data[1]);
                            }
                            if (data.length > 2) {
                                if (isOtherShipmentType == "jd") {
                                    $("#saveParam_jdBigItemShipTimeOffset").val(data[2]);
                                } else {
                                    $("#saveParam_otherBigItemShipOffset").val(data[2]);
                                }

                            }
                            $("#calendar_big_bzd_x").val(calendar2.result.xy[0]);
                            $("#calendar_big_bzd_y").val(calendar2.result.xy[1]);
                            //$("#jd_shipment_calendar_date").html('<span class="ftx-03">配送时间：</span>' + calendar.result.day + " " + calendar.result.range)
                        } else if (JSON.stringify(calendar2.result) == "{}") {
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val(4); //预约配送类型，1表示311，2表示411
                            //如果上次有选中的日期，则用上次日期，否则默认一个
                            if ($("#big_bzdrl_last_sel_promiseDate").val() !== "" && $("#big_bzdrl_last_sel_promiseDate").val() !== null && $("#big_bzdrl_last_sel_promiseDate").val() !== "undefined" && $("#big_bzdrl_last_sel_promiseDate").val() !== undefined) {
                                $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val($("#big_bzdrl_last_sel_promiseDate").val());
                                $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val($("#big_bzdrl_last_sel_promiseTimeRange").val());
                                $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val($("#big_bzdrl_last_sel_promiseSendPay").val());
                                $("#saveParam_" + isOtherShipmentType + "BigItemBatchId").val($("#big_bzdrl_last_sel_batchId").val());
                                $("#saveParam_" + isOtherShipmentType + "BigItemShipTimeOffset").val($("#big_bzdrl_last_sel_offset").val());
                                if (isOtherShipmentType == "jd") {
                                    $("#saveParam_jdBigItemShipTimeOffset").val($("#big_bzdrl_last_sel_offset").val());
                                } else {
                                    $("#saveParam_otherBigItemShipOffset").val(d$("#big_bzdrl_last_sel_offset").val());
                                }
                            } else {
                                // 日历为空没有选择给一个默认的过期时间，异步验证会取最近的时间，提升用户体验
                                $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val("2011-6-27");
                                $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val("9:00-11:00");
                                $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val("{'33':1}");
                                $("#saveParam_" + isOtherShipmentType + "BigItemBatchId").val("1");

                                $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val(4);
                                if (isOtherShipmentType == "jd") {
                                    $("#saveParam_jdBigItemShipTimeOffset").val("1");
                                } else {
                                    $("#saveParam_otherBigItemShipOffset").val("1");
                                }
                            }
                        }

                        jQuery.closeDialog();

                        if (isOtherShipmentType == "other") {
                            doSavePayAndShipmentInfo("jd_otherbigitem_shipdate");
                        } else {
                            doSavePayAndShipmentInfo("jd_bigitem_shipdate");
                        }

                    } else {
                        if (isOtherShipmentType == "other") {
                            doSaveOtherBigShipDate();
                        } else {
                            doSaveBigShipDate();
                        }
                    }

                });
                $('#timeSaveDjdJzd').bind('click', function () {

                    if (JSON.stringify(calendar.result) == "{}" && $("#calendar_big_x").val() == "") {
                        alert("您还没有指定配送时间");
                        return;
                    } else if (JSON.stringify(calendar.result) != "{}") {
                        setDjdCaldarSaveFlag();//保存大家电日历后,查询配送信息标识
                        //给隐藏域赋值
                        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val(5);
                        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val(calendar.result.day);
                        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val(calendar.result.range);
                        var data = (calendar.result['date-range']).split('-');
                        $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val(data[0]);
                        if (data.length > 1) {
                            $("#saveParam_" + isOtherShipmentType + "BigItemBatchId").val(data[1]);
                        }
                        if (data.length > 2) {
                            if (isOtherShipmentType == "jd") {
                                $("#saveParam_jdBigItemShipTimeOffset").val(data[2]);

                            } else {
                                $("#saveParam_otherBigItemShipOffset").val(data[2]);
                            }
                        }
                        $("#calendar_big_x").val(calendar.result.xy[0]);
                        $("#calendar_big_y").val(calendar.result.xy[1]);
                        //$("#jd_shipment_calendar_date").html('<span class="ftx-03">配送时间：</span>' + calendar.result.day + " " + calendar.result.range)
                    } else if (JSON.stringify(calendar.result) == "{}") {
                        $("#saveParam_jdBigItemPromiseType").val(5); //预约配送类型，1表示311，2表示411
                        //如果上次有选中的日期，则用上次日期，否则默认一个
                        if ($("#big_last_sel_promiseDate").val() !== "" && $("#big_last_sel_promiseDate").val() !== null && $("#big_last_sel_promiseDate").val() !== "undefined" && $("#big_last_sel_promiseDate").val() !== undefined) {
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val($("#big_last_sel_promiseDate").val());
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val($("#big_last_sel_promiseTimeRange").val());
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val($("#big_last_sel_promiseSendPay").val());
                            $("#saveParam_" + isOtherShipmentType + "BigItemBatchId").val($("#big_last_sel_batchId").val());
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val(5);
                            if (isOtherShipmentType == "jd") {
                                $("#saveParam_jdBigItemShipTimeOffset").val($("#big_last_sel_offset").val());
                            } else {
                                $("#saveParam_otherBigItemShipOffset").val($("#big_last_sel_offset").val());
                            }
                        } else {
                            // 日历为空没有选择给一个默认的过期时间，异步验证会取最近的时间，提升用户体验
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseDate").val("2011-6-27");
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseTimeRange").val("9:00-11:00");
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseSendPay").val("{'33':1");
                            $("#saveParam_" + isOtherShipmentType + "BigItemBatchId").val("1");
                            $("#saveParam_" + isOtherShipmentType + "BigItemPromiseType").val(5);
                            if (isOtherShipmentType == "jd") {
                                $("#saveParam_jdBigItemShipTimeOffset").val("1");
                            } else {
                                $("#saveParam_otherBigItemShipOffset").val("1");
                            }
                        }
                    }
                    jQuery.closeDialog();
                    $("#reset_promise_311").val("1"); //,不重置
                    if (isOtherShipmentType == "other") {
                        doSavePayAndShipmentInfo("jd_otherbigitem_shipdate");
                    } else {
                        doSavePayAndShipmentInfo("jd_bigitem_shipdate");
                    }

                });
                //大家电极速达
                $("#timeSaveDjdJsd").bind('click', function () {
                    $("#saveParam_jdBigItemPromiseType").val(6);//大件极速达
                    $("#reset_promise_311").val("1"); //是否需要重置311,不重置311
                    var speedHour = do_djd_jsd_speedHour();//极速达送达时效
                    $("#shipment_date_div").html('<span class="ftx-03">配送时间：</span><font id="speedFreightNote">极速达（' + speedHour + '小时之内送达）</font>');
                    jQuery.closeDialog();
                    setDjdCaldarSaveFlag();//保存大家电日历后,查询配送信息标识
                    if (isOtherShipmentType == "other") {
                        doSavePayAndShipmentInfo("jd_otherbigitem_shipdate");
                    } else {
                        doSavePayAndShipmentInfo("jd_bigitem_shipdate");
                    }
                });

                shipmentTips618();
                var copywritingContent = $("#bigItemCopywritingContent").val();
                if (copywritingContent != 0) {
                    $("#li_djd_id").html(copywritingContent);
                }
                $("#djzdAmount").html($("#djzdAmount_hidden").val());
            } //onready end
        });
    })
}


//点击进入第三方大家电配送时间选择界面
function doEditOtherBigShipmentDate(venderId) {
    var isOtherShipmentType = $("#isOtherShipmentType").val();
    if (isEmpty(isOtherShipmentType)) {
        var bigShipHtml = $("#otherBigItemShipEdit_" + venderId).html();
        $('body').dialog({
            title: '大件商品配送时间',
            width: 530,
            height: 230,
            type: 'html',
            source: bigShipHtml,
            onReady: function () {
                //给选中的大家电配送日期设置样式
                var curSelBigItemShipOffset = $("#saveParam_otherBigItemShipOffset").val();
                $(".li_shipment_other").each(function (index, item) {
                    if (curSelBigItemShipOffset != null && $(this).attr("shipDate_offset") == curSelBigItemShipOffset) {
                        $(this).removeClass().addClass("li_shipment_other selected");
                        return;
                    }
                });
            }
        });
        return;
    }
    doEditBigShipmentDate(venderId);
}

//京东付款方式
function doEditPayway(venderId) {
    var payHtml = $("#paywayEdit_" + venderId).html();
    var curSelPayWay = $("#saveParam_jdPayWayId").val();
    var showTitle = "选择付款方式";
    if (curSelPayWay == "0") {
        showTitle = "选择货到付款的付款方式";
    }
    $('body').dialog({
        title: showTitle,
        width: 425,
        height: 130,
        type: 'html',
        source: payHtml,
        onReady: function () {
            //给选中的配送日期设置样式
            $("#subpayment .payment-item").each(function (index, item) {
                if ($(this).attr("supPaymentWayId") == curSelPayWay) {
                    $(this).removeClass();
                    $(this).addClass("payment-item item-selected");
                    return;
                }
            });
            var link2 = $("#link2").val();
            var link3 = $("#link3").val();
            var link4 = $("#link4").val();
            var link5 = $("#link5").val();
            //控制显示提示
            if (curSelPayWay == "0") {
                $(".pay_way_remark").hide();
            } else if (curSelPayWay == "1") {
                $(".pay_way_remark").html('<span class="qmark"></span><a class="ftx-05" href="' + link2 + '" target="_blank">货到付款可以POS机刷卡吗？</a>');
                $(".pay_way_remark").show();
            }
            if (curSelPayWay == "2") {
                $(".pay_way_remark").html('<span class="qmark"></span>' +
                    '<a class="ftx-05" href="' + link3 + '" target="_blank">使用支票支付，如何填写抬头？</a>' +
                    '<br>' +
                    '<span class="qmark"></span>' +
                    '<a class="ftx-05" href="' + link4 + '" target="_blank">哪些地区可以使用支票支付？</a>' +
                    '<br>' +
                    '<span class="qmark"></span>' +
                    '<a class="ftx-05" href="' + link5 + '" target="_blank">支票支付的订单，我支票金额比订单的应支付金额多怎么办？</a>' +
                    '<br>' +
                    '<span class="qmark"></span>' +
                    '<a class="ftx-05" href="javascript:void(0)">非自营商品不支持支票支付。</a>');
                $(".pay_way_remark").show();
            }
        }
    });
}

//京东大家电付款方式
function doEditBigItemPayway(venderId) {
    var payHtml = $("#paywayBigItemEdit_" + venderId).html();
    var curSelPayWay = $("#saveParam_jdPayWayId").val();
    var showTitle = "选择付款方式";
    if (curSelPayWay == "0") {
        showTitle = "选择货到付款的付款方式";
    }
    $('body').dialog({
        title: showTitle,
        width: 425,
        height: 130,
        type: 'html',
        source: payHtml,
        onReady: function () {
            //给选中的配送日期设置样式
            $("#bigItemsubpayment .payment-item").each(function (index, item) {
                if ($(this).attr("supPaymentWayId") == curSelPayWay) {
                    $(this).removeClass().addClass("payment-item item-selected");
                    return;
                }
            });
            var link2 = $("#link2").val();
            var link3 = $("#link3").val();
            var link4 = $("#link4").val();
            var link5 = $("#link5").val();
            //控制显示提示
            if (curSelPayWay == "0") {
                $(".pay_way_remark").hide();
            } else if (curSelPayWay == "1") {
                $(".pay_way_remark").html('<span class="qmark"></span><a class="ftx-05" href="' + link2 + '" target="_blank">货到付款可以POS机刷卡吗？</a>');
                $(".pay_way_remark").show();
            }
            if (curSelPayWay == "2") {
                $(".pay_way_remark").html('<span class="qmark"></span>' +
                    '<a class="ftx-05" href="' + link3 + '" target="_blank">使用支票支付，如何填写抬头？</a>' +
                    '<br>' +
                    '<span class="qmark"></span>' +
                    '<a class="ftx-05" href="' + link4 + '" target="_blank">哪些地区可以使用支票支付？</a>' +
                    '<br>' +
                    '<span class="qmark"></span>' +
                    '<a class="ftx-05" href="' + link5 + '" target="_blank">支票支付的订单，我支票金额比订单的应支付金额多怎么办？</a>' +
                    '<br>' +
                    '<span class="qmark"></span>' +
                    '<a class="ftx-05" href="javascript:void(0)">非自营商品不支持支票支付。</a>');
                $(".pay_way_remark").show();
            }
        }
    });
}

//刷新大家电安装日期选择界面
function flushJdInstallDate(installDates) {
    var installHtml = '<div class="date-box"><div class="date-list"><ul>';
    for (var i = 0; i < installDates.length; i++) {
        installHtml += '<li class="li_shipment_install" installDate_offset="' + installDates[i].offset + '"  installDate_date="' + installDates[i].date + '" installDate_weekDay="' + installDates[i].weekDay + '" onclick="doSwithInstall(this)">';
        installHtml += installDates[i].date + '<span class="data">' + installDates[i].weekDay + '</span>';
        installHtml += '</li>';
        if (installDates[i].selected) {
            $("#jd_install_date_div .mode-infor").html(installDates[i].date + "&nbsp;" + installDates[i].weekDay + "<br><span class='ftx-03'>" + shmazhTips + "</span>");
        }
    }
    installHtml += "</ul></div>";
    var link10 = $("#link10").val();
    if (typeof link10 == 'undefined' || link10 == null || link10 == "") {
        link10 = "http://help.jd.com/user/issue/239-3760.html";
    }
    installHtml += '<div class="ftx-03 mt10">'
        + '大家电如何预约安装&nbsp;<a class="ftx-05 alink" target="_blank" href="' + link10 + '">查看详情</a>	</div>'
        + '<div class="op-btns mt20 ac"> <a  href="#none" onclick="doSaveJdInstallDate(0)" class="btn-9"> 保存 </a>'
        + '<a href="javascript:jQuery.closeDialog();"  class="btn-9 ml10"> 取消 </a> </div>';
    $('#installEdit').html(installHtml);
}

//刷新大家电安装日期选择界面
function flushInstallDate(installDates) {
    var installHtml = '<div class="date-box"><div class="date-list"><ul>';
    for (var i = 0; i < installDates.length; i++) {
        installHtml += '<li class="li_shipment_install" installDate_offset="' + installDates[i].offset + '"  installDate_date="' + installDates[i].date + '" installDate_weekDay="' + installDates[i].weekDay + '" onclick="doSwithInstall(this)">';
        installHtml += installDates[i].date + '<span class="data">' + installDates[i].weekDay + '</span>';
        installHtml += '</li>';
        if (installDates[i].selected) {
            $("#install_date_div .mode-infor").html(installDates[i].date + "&nbsp;" + installDates[i].weekDay + "<br><span class='ftx-03'>" + shmazhTips + "</span>");
        }
    }
    installHtml += "</ul></div>";
    var link10 = $("#link10").val();
    if (typeof link10 == 'undefined' || link10 == null || link10 == "") {
        link10 = "http://help.jd.com/user/issue/239-3760.html";
    }
    installHtml += '<div class="ftx-03 mt10">'
        + '大家电如何预约安装&nbsp;<a class="ftx-05 alink" target="_blank" href="' + link10 + '">查看详情</a>	</div>'
        + '<div class="op-btns mt20 ac"> <a  href="#none" onclick="doSaveInstallDate(0)" class="btn-9"> 保存 </a>'
        + '<a href="javascript:jQuery.closeDialog();"  class="btn-9 ml10"> 取消 </a> </div>';
    $('#bigItemInstallEdit').html(installHtml);
}

//刷新第三方大家电安装日期选择界面
function flushOtherInstallDate(installDates) {
    var installHtml = '<div class="date-box"><div class="date-list"><ul>';

    for (var i = 0; i < installDates.length; i++) {
        installHtml += '<li class="li_shipment_install_other" installDate_offset="' + installDates[i].offset + '"  installDate_date="' + installDates[i].date + '" installDate_weekDay="' + installDates[i].weekDay + '" onclick="doSwithOtherInstall(this)">';
        installHtml += installDates[i].date + '<span class="data">' + installDates[i].weekDay + '</span>';
        installHtml += '</li>';
        if (installDates[i].selected) {
            $("#otherinstall_date_div .mode-infor").html(installDates[i].date + "&nbsp;" + installDates[i].weekDay + "<br><span class='ftx-03'>" + shmazhTips + "</span>");
        }
    }
    installHtml += "</ul></div>";

    installHtml += '<div class="ftx-03 mt10">'
        + $('#ddycShipTip').val()
        + '<div class="op-btns mt20 ac"> <a  href="#none" onclick="doSaveOtherInstallDate(0)" class="btn-9"> 保存 </a>'
        + '<a href="javascript:jQuery.closeDialog();"  class="btn-9 ml10"> 取消 </a> </div>';

    $('#otherBigItemInstallEdit').html(installHtml);
}

//点击进入自营落地配安装日期选择界面
function doEditJdInstallDate(venderId) {
    var installHtml = $("#installEdit").html();
    $('body').dialog({
        title: '自营落地配商品安装时间',
        width: 530,
        height: 230,
        type: 'html',
        source: installHtml,
        onReady: function () {
            //给选中的配送日期设置样式
            var curSelBigInstalloffset = $("#saveParam_installTimeOffest").val();
            $(".li_shipment_install").each(function (index, item) {
                if (curSelBigInstalloffset != null && $(this).attr("installDate_offset") == curSelBigInstalloffset) {
                    $(this).removeClass().addClass("li_shipment_install selected");
                    return;
                }
            });
        }
    });
}

//点击进入大家电安装日期选择界面
function doEditInstallDate(venderId) {
    var installHtml = $("#bigItemInstallEdit").html();
    $('body').dialog({
        title: '大件商品安装时间',
        width: 530,
        height: 230,
        type: 'html',
        source: installHtml,
        onReady: function () {
            //给选中的配送日期设置样式
            var curSelBigInstalloffset = $("#saveParam_jdBigItemInstallTimeOffest").val();
            $(".li_shipment_install").each(function (index, item) {
                if (curSelBigInstalloffset != null && $(this).attr("installDate_offset") == curSelBigInstalloffset) {
                    $(this).removeClass().addClass("li_shipment_install selected");
                    return;
                }
            });
        }
    });
}

//点击进入第三方大家电安装日期选择界面
function doEditOtherInstallDate(venderId) {
    var installHtml = $("#otherBigItemInstallEdit").html();
    $('body').dialog({
        title: '大件商品安装时间',
        width: 530,
        height: 230,
        type: 'html',
        source: installHtml,
        onReady: function () {
            //给选中的配送日期设置样式
            var curSelBigInstalloffset = $("#saveParam_otherBigItemInstallTimeOffset").val();
            $(".li_shipment_install_other").each(function (index, item) {
                if (curSelBigInstalloffset != null && $(this).attr("installDate_offset") == curSelBigInstalloffset) {
                    $(this).removeClass().addClass("li_shipment_install_other selected");
                    return;
                }
            });
        }
    });
}

//进入修改自提点页面
function doEditPicksite() {
    var picksiteHtml = $("#picksite_hidediv").html();
    $('body').dialog({
        title: '选择自提点',
        width: 780,
        height: 500,
        type: 'html',
        source: '<div id="selfpick_siteDiv">' + picksiteHtml + '</div>',
        onReady: function () {
            //设置选择区域
            $("#temp_pick_sel_regionid").val($("#pick_sel_regionid").val());
            /*var selRegionId = $("#pick_sel_regionid").val();
          $(".pickRegion_select").val(selRegionId); */
        }
    });
}

//重新选择自提点
function doReChoosePicksite() {
    $("#consignee-list .consignee-item.item-selected").parent().next().next().find('.consignee-item').click();
}

function flshFactoryflag() {
    if ($("#containFactoryShip").val() == 3) {
        if ($(".vendor_name_freight.vendor_name_0").html() != null) {
            //var t = $(".vendor_name_freight.vendor_name_0").html().replace("京东自营" ,"京东自营和厂商配送");
            $(".vendor_name_freight.vendor_name_0").html("京东自营和厂商配送");
        }
        //$(".vendor_name_freight.vendor_name_0").html("京东自营和厂商配送");
        $(".vendor_name_h.vendor_name_0").html("商家：京东自营和厂商配送");
    } else if ($("#containFactoryShip").val() == 4) {
        $(".vendor_name_freight.vendor_name_0").html("厂商配送");
        $(".vendor_name_h.vendor_name_0").html("商家：厂商配送");
    } else {
        if ($(".vendor_name_freight.vendor_name_0").html() != null) {
            //var t = $(".vendor_name_freight.vendor_name_0").html().replace("京东自营和厂商配送" ,"京东自营");
            $(".vendor_name_freight.vendor_name_0").html("京东自营");
        }
        //$(".vendor_name_freight.vendor_name_0").html("京东自营");
        $(".vendor_name_h.vendor_name_0").html("商家：京东自营");
    }
}

function ysredPacket() {
    if ($("#EarnestPayRadio").hasClass("item-selected")) {
        $("#couponitem").addClass("hide");
        $(".coupon-main.ui-switchable-panel").css('display', 'none');
    }
    if ($("#couponitem").hasClass("curr") && !$("#couponitem").hasClass("hide")) {
        $("#red-packet").removeClass("curr");
    } else {
        if ($('#virtualdiv').attr('redpaket-forbidtype') == "false") {
            $(".redpack-main.ui-switchable-panel").css('display', 'block');
            $("#red-packet").addClass("curr");
            $("#couponitem").removeClass("curr");
        }
    }
    if (typeof $("#AllPayRadio").attr('data-onlyall') !== 'undefined' && $("#AllPayRadio").attr('data-onlyall') == "1") {
        $(".coupon-main.ui-switchable-panel").css('display', 'block');
        $(".redpack-main.ui-switchable-panel").css('display', 'none');
        $("#couponitem").addClass("curr");
        $("#red-packet").removeClass("curr");
    }

}

function clearIdCardMessage() {
    $("#idCardNullMessage").addClass("hide");
    $("#idCardErroMessage").addClass("hide");
    $("#tw_sfyz_input").removeClass("error");
}

function saveIdCard() {
    var idcard = $("#tw_sfyz_input").val();

    if (idcard == null || idcard == "") {
        $("#idCardUnSaveMessage").addClass("hide");
        $("#idCardNullMessage").removeClass("hide");
        $("#idCardErroMessage").addClass("hide");
        $("#tw_sfyz_input").addClass("error");
        return;
    }
    if ($("#hideCardNumInput").val() == idcard) {
        $("#hasIdcard").removeClass("hide");
        $("#noIdcard").addClass("hide");
        $("#tw_sfyz_input").addClass("error");
        return;
    }
    if ($("#hasNeedIdCardSku").val() == "true") {
        if (!check_idCard_new(idcard)) {
            $("#idCardUnSaveMessage").addClass("hide");
            $("#idCardNullMessage").addClass("hide");
            $("#idCardErroMessage").removeClass("hide");
            $("#tw_sfyz_input").addClass("error");
            return;
        }
    } else {
        if (idcard.length < 7 || idcard.length > 25) {
            $("#idCardUnSaveMessage").addClass("hide");
            $("#idCardNullMessage").addClass("hide");
            $("#idCardErroMessage").removeClass("hide");
            $("#tw_sfyz_input").addClass("error");
            return;
        }
        var re = /^[0-9a-zA-Z]*$/;
        if (!re.test(idcard)) {
            $("#idCardUnSaveMessage").addClass("hide");
            $("#idCardNullMessage").addClass("hide");
            $("#idCardErroMessage").removeClass("hide");
            $("#tw_sfyz_input").addClass("error");
            return;
        }
    }

    var consignee_id = $('.consignee-item.item-selected').attr('consigneeid');
    var provinceid = $('.consignee-item.item-selected').attr('provinceid');
    var consignee_commons_size = $("#hidden_consignees_size").val();
    var isUpdateCommonAddress = 1;
    var giftSender_consignee_name = "";
    var giftSender_consignee_mobile = "";
    var noteGiftSender = false;
    if (isGiftBuy()) {
        noteGiftSender = true;
        giftSender_consignee_name = $("#consigneeList_giftSenderConsigneeName").val();
        giftSender_consignee_mobile = $("#consigneeList_giftSenderConsigneeMobile").val();
    }

    var param = "consigneeParam.id=" + consignee_id + "&consigneeParam.provinceId=" + provinceid
        + "&consigneeParam.idCard=" + idcard + "&consigneeParam.saveTwIdCard=" + 1
        + "&consigneeParam.commonConsigneeSize=" + consignee_commons_size
        + "&consigneeParam.isUpdateCommonAddress=" + isUpdateCommonAddress + "&consigneeParam.giftSenderConsigneeName=" + giftSender_consignee_name
        + "&consigneeParam.giftSendeConsigneeMobile=" + giftSender_consignee_mobile + "&consigneeParam.noteGiftSender=" + noteGiftSender
    param = parent.addFlowTypeParam(param);
    var actionUrl = OrderAppConfig.DynamicDomain + "/consignee/saveConsignee.action";
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: actionUrl,
        data: param,
        cache: false,
        success: function (consigneeResult, textStatus) {
            if (parent.isUserNotLogin(consigneeResult)) {
                parent.goToLogin();
                return;
            }
            if (consigneeResult.success) {
                $(".consignee-item.item-selected").attr("idcard", idcard);
                var begain = idcard.substring(0, 2);
                var end = idcard.substring(idcard.length - 4, idcard.length);
                var newCard = begain + "**********" + end;
                $("#hideCardNum").html(newCard);
                $("#hideCardNumInput").val(newCard);
                $("#hasIdcard").removeClass("hide");
                $("#noIdcard").addClass("hide");
                $("#smrzInfoTip").addClass("hide");

            }
        },
        error: function (XMLHttpResponse) {

        }
    });
}

function updateIdcard() {
    var selectedIdCard = $(".consignee-item.item-selected").attr("idcard");
    $("#noIdcard").removeClass("hide");
    $("#hasIdcard").addClass("hide");
    $("#tw_sfyz_input").val(selectedIdCard);
}

function makeIdCard() {
    var selectedProvinceid = $(".consignee-item.item-selected").attr("provinceid");
    var selectedIdCard = $(".consignee-item.item-selected").attr("idcard");
    if ($("#hasNeedIdCardSku").val() == "true" && (selectedProvinceid == $("#taiWanId").val() || selectedProvinceid == $("#hongKongId").val() || selectedProvinceid == $("#overSeasId").val())) {
        $("#tw_sfyz_zone").addClass("hide");
        return;
    }
    if (($("#taiWanIdCardCheck").val() == "0" && typeof (selectedProvinceid) !== 'undefined' && selectedProvinceid == $("#taiWanId").val()) || $("#hasNeedIdCardSku").val() == "true") {
        $("#tw_sfyz_zone").removeClass("hide");
        if (selectedIdCard != null && selectedIdCard != "" && selectedIdCard != "null") {
            $("#hasIdcard").removeClass("hide");
            $("#noIdcard").addClass("hide");

            if (selectedIdCard.length > 4) {
                var begain = selectedIdCard.substring(0, 2);
                var end = selectedIdCard.substring(selectedIdCard.length - 4, selectedIdCard.length);
                var newCard = begain + "**********" + end;
                $("#hideCardNum").html(newCard);
            } else {
                $("#hideCardNum").html(selectedIdCard);
            }
            $("#hideCardNumInput").val(selectedIdCard);
            $("#smrzInfoTip").addClass("hide");
        } else {
            $("#noIdcard").removeClass("hide");
            $("#hasIdcard").addClass("hide");
            $("#smrzInfoTip").removeClass("hide");
            clearIdCardMessage();
            $("#tw_sfyz_input").val("");
        }
    } else {
        $("#tw_sfyz_zone").addClass("hide");
    }
}

/**
 * 异步获取商品清单、支付方式和配送相关信息
 * zhuqingjie
 */
function doAsynGetSkuPayAndShipInfo(typeFlag, callback) {
    var actionUrl = OrderAppConfig.DynamicDomain + "/payAndShip/getAdditShipment.action";
    var payId = $('.payment-item.item-selected').attr('payId');
    var otype = $('.payment-item.item-selected').attr('onlinepaytype');
    if ($("#taiWanIdCardCheck").val() == "0" || $("#hasNeedIdCardSku").val() == "true") {
        makeIdCard();
    }
    var reset311 = $('#reset_promise_311').val();
    var resetFlag = $('#resetFlag').val();
    var presaleSelectType;
    if ($(".presale-payment-item").hasClass("item-selected")) {
        presaleSelectType = $(".presale-payment-item.item-selected").attr("selectType");
    }
    initResetFlag();
    if ($("#flowType").val() == "15") {
        ysredPacket();
    }
    flshFactoryflag();
    if (isEmpty(payId)) {
        payId = 4;
    }
    if (isEmpty(otype)) {
        otype = 0;
    }

    if (typeFlag == 0) {
        try {
            //初始化京准达波次时效的参数
            localStorage.removeItem("zxj_promiseTagType");
        } catch (e) {
        }
    }
    var promiseTagType = "";
    var djd_save_flag = localStorage.getItem("djd_caldar_save_flag");
    if (djd_save_flag != null && djd_save_flag != undefined && djd_save_flag == "1") {
        promiseTagType = $("#zxj_promiseTagType").val();//获取京准达时效类型
        promiseTagType = doLocalStorageValue(promiseTagType, "zxj_promiseTagType");
        try {
            localStorage.removeItem("djd_caldar_save_flag");
        } catch (e) {
        }

    }
    var param = "paymentId=" + payId;
    param = param + "&shipParam.reset311=" + reset311 + "&resetFlag=" + resetFlag + "&shipParam.onlinePayType=" + otype + "&typeFlag=" + typeFlag + "&promiseTagType=" + promiseTagType;
    if (presaleSelectType != null) {
        param = param + "&shipParam.payType4YuShou=" + presaleSelectType;
    }
    var easyBuyFlag = $("#easyBuyFlag").val();
    if (easyBuyFlag == "1" || easyBuyFlag == "2") {
        param += "&ebf=" + easyBuyFlag;
    }
    //分期参数
    var fq = $("#fq").val();
    if (fq) {
        param += "&fq=" + fq;
    }
    param = addFlowTypeParam(param);
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: actionUrl,
        data: param,
        cache: false,
        success: function (dataResult, textStatus) {

            // 没有登录跳登录
            if (isUserNotLogin(dataResult)) {
                goToLogin();
                return;
            }
            if (dataResult.cjshFlag) {
                if ($(".orderInfo-tip").css("display") != 'none') {
                    $("#cjshtip").html($("#cjsh").val());
                } else {
                    $(".orderInfo-tip").show();
                    $("#cjshtip").html($("#cjsh").val());
                }
            } else {
                $("#cjshtip").html("温馨提示：订单中存在不支持7天无理由退货商品，请确认相关商品信息后提交订单。");
                orderInfoTip2();
            }
            var selfPickShutDownFlag = dataResult.isSelfPickShutDown;
            var selfPickOptimize = dataResult.selfPickOptimize;
//      alert("selfPickOptimize:"+selfPickOptimize);
            if (selfPickOptimize == 1 && $("#selfPickSiteName").length == 1 && !$("#selfPickSiteName").hasClass("item-selected")) {
                $("#selfPickOptimize").attr("value", "1");
                $("#pick_shipment_item").addClass("hide");
                $("#selfPickArea").addClass("hide");
                var jsonO = dataResult;
                $("#selfPickOptimizeUl").find("li").remove();
                var downUpdateSelfPick = $("#downUpdateSelfPick").val();
                if (jsonO != null) {
                    var flag = 0;
                    if (jsonO.usedPickView != null && jsonO.usedPickView != "" && jsonO.usedPickView.selfpickSiteAvailable === true && $("#hasNeedIdCardSku").val() != "true") {

                        upv = jsonO.usedPickView;
                        if (upv.pickId != 0) {
                            flag = 1;
                            var titleNameA;
                            if (upv.pickName != null && upv.pickName.length > 10) {
                                titleNameA = upv.pickName.slice(0, 8) + "...";
                            } else {
                                titleNameA = upv.pickName;
                            }
                            var usedLi = "";
                            usedLi = usedLi + "<li id='usedLi'> <div class='picksite-item optimize' pickId='" + upv.pickId + "' isCod='" + upv.isCod + "' id='usedDiv' clstag='pageclick|keycount|trade_201602181|56' onclick='doSelectSelfPickSiteOptimize(" + upv.pickId + ",1," + upv.isCod + ")' > <span>" + titleNameA + "</span> <b></b> </div>";
                            usedLi = usedLi + "<div class='addr-detail'> <span class='addr-name'>" + upv.pickName + "</span>";
                            usedLi = usedLi + "<span class='addr-info' id='usedInfo' title=''>" + upv.address + "</span>";
                            usedLi = usedLi + "<span class='addr-con' id='usedName'>" + upv.name + "</span>"
                            usedLi = usedLi + "<span class='addr-tel' id='usedMobile'>" + upv.selfPickMobile + "</span>";
                            if (upv.distance >= 1) {
                                usedLi = usedLi + "<span class='site-distance'><b></b>距收货人 " + upv.distance + "千米</span>";
                            } else if (upv.distance >= 0) {
                                usedLi = usedLi + "<span class='site-distance'><b></b>距收货人 " + upv.distance * 1000 + "米</span>";
                            }
                            usedLi = usedLi + "<b class='site-green'>上次使用</b><span></span>";
                            usedLi = usedLi + "<a href='#none' clstag='pageclick|keycount|trade_201602181|57' onclick='openEditSelfPickConsigneeDialog(2)' class='ftx-05 ml10 selfpick-edit" + (downUpdateSelfPick == "1" ? " hide" : "") + "'>修改自提点</a></div></li>";
                            $("#selfPickOptimizeUl").append(usedLi);
                        }
                    }
                    if (jsonO.nearestPickView != null && jsonO.nearestPickView != "" && $("#hasNeedIdCardSku").val() != "true") {
                        npv = jsonO.nearestPickView;
                        if (npv.pickId != 0) {
                            flag = 1;
                            var titleNameB;
                            if (npv.pickName != null && npv.pickName.length > 10) {
                                titleNameB = npv.pickName.slice(0, 8) + "...";
                            } else {
                                titleNameB = npv.pickName;
                            }
                            var nearestLi = "";
                            nearestLi = nearestLi + "<li id='nearestLi'> <div class='picksite-item optimize' id='nearestDiv' pickId='" + npv.pickId + "' isCod='" + npv.isCod + "' clstag='pageclick|keycount|trade_201602181|56' onclick='doSelectSelfPickSiteOptimize(" + npv.pickId + ",2," + npv.isCod + ")'> <span>" + titleNameB + "</span> <b></b> </div>";
                            nearestLi = nearestLi + "<div class='addr-detail'> <span class='addr-name'>" + npv.pickName + "</span>";
                            nearestLi = nearestLi + "<span class='addr-info' id='nearestInfo' title=''>" + npv.address + "</span>";
                            nearestLi = nearestLi + "<span class='addr-con' id='nearestName'>" + npv.name + "</span>"
                            nearestLi = nearestLi + "<span class='addr-tel' id='nearestMobile'>" + npv.selfPickMobile + "</span>";
                            if (npv.distance >= 1) {
                                nearestLi = nearestLi + "<span class='site-distance'><b></b>距收货人 " + npv.distance + "千米</span>";
                            } else if (npv.distance >= 0) {
                                nearestLi = nearestLi + "<span class='site-distance'><b></b>距收货人 " + npv.distance * 1000 + "米</span>";
                            }
                            nearestLi = nearestLi + "<b class='site-red'>距离最近</b><span></span>";
                            nearestLi = nearestLi + "<a href='#none' clstag='pageclick|keycount|trade_201602181|57' onclick='openEditSelfPickConsigneeDialog(3)' class='ftx-05 ml10 selfpick-edit" + (downUpdateSelfPick == "1" ? " hide" : "") + "'>修改自提点</a></div></li>";
                            $("#selfPickOptimizeUl").append(nearestLi);
                            $("#nearestPickId").val(jsonO.nearestPickView.pickId);
                        }
                    }
                    if (flag == 1) {
                        $("#justPickCopy").val("1");
                        $("#zitihr").removeClass("hide");
                        if (jsonO.copyContent != null && jsonO.copyContent != "") {
                            //$("#absMoney").html(jsonO.copyContent);
                            $("#zititype2").removeClass("hide");
                            $("#zititype1").addClass("hide");
                            $("#zititype3").addClass("hide");
                            $("#zititype4").addClass("hide");
                            $("#zititype5").addClass("hide");
                        } else {
                            if (jsonO.saveMoney != 0) {
                                //$("#absMoney").html("选择京东自提，立省"+jsonO.saveMoney+"元运费");
                                $("#zititype2").removeClass("hide");
                                $("#zititype1").addClass("hide");
                                $("#zititype3").addClass("hide");
                                $("#zititype4").addClass("hide");
                                $("#zititype5").addClass("hide");
                            } else if (jsonO.restDay == 1) {
                                $("#zititype3").removeClass("hide");
                                $("#zititype1").addClass("hide");
                                $("#zititype2").addClass("hide");
                                $("#zititype4").addClass("hide");
                                $("#zititype5").addClass("hide");
                            } else {
                                $("#zititype1").removeClass("hide");
                                $("#zititype2").addClass("hide");
                                $("#zititype3").addClass("hide");
                                $("#zititype4").addClass("hide");
                                $("#zititype5").addClass("hide");
                            }
                        }
                    } else {
                        $("#justPickCopy").val("0");
                        $("#zititype1").addClass("hide");
                        $("#zititype2").addClass("hide");
                        $("#zititype3").addClass("hide");
                        $("#zititype5").addClass("hide");
                        if ((jsonO.existUnSupportSkus == 1 || jsonO.existUnSupportSkus == '1') && jsonO.unSupportSelfPickSkuList != null && jsonO.unSupportSelfPickSkuList.length > 0) {
                            $("#zitihr").removeClass("hide");
                            $("#zititype4").removeClass("hide");
                            $("#unSupportSelfPickSkuList").find("li").remove();
                            $.each(jsonO.unSupportSelfPickSkuList, function (i, unSupportSelfPickSku) {
                                if (unSupportSelfPickSku.imgUrl != null && unSupportSelfPickSku.imgUrl != "") {
                                    var li = "";
                                    li = li + "<li title='" + unSupportSelfPickSku.name + "'>";
                                    li = li + "<a href='#none'><img src='//img10.360buyimg.com/cms/s80x80_" + unSupportSelfPickSku.imgUrl + "' alt></a></li>";
                                    $("#unSupportSelfPickSkuList").append(li);
                                }
                            });
                        } else {
                            $("#zitihr").addClass("hide");
                            $("#zititype4").addClass("hide");
                            $("#zititype5").removeClass("hide");
                        }
                    }
                    var hongKongId = $("#hongKongId").val();
                    //港澳售项目
                    var consignee_area = $("#hideAreaIds").val();
                    var consignee_provinceId = 0;
                    if (consignee_area != null) {
                        consignee_provinceId = consignee_area.split("-")[0];
                    }
                    if (consignee_provinceId == hongKongId) {
                        $("#gaztqd1").addClass("hide");
                        $("#absMoney").addClass("hide");
                        $("#gaztqd2").addClass("hide");
                        $("#gaztqd3").addClass("hide");
                    } else {
                        $("#gaztqd1").removeClass("hide");
                        $("#absMoney").removeClass("hide");
                        $("#gaztqd2").removeClass("hide");
                        $("#gaztqd3").removeClass("hide");
                    }
                }

            } else {
                $("#justPickCopy").val("0");
                if (selfPickOptimize != 1) {
                    $("#selfPickOptimize").attr("value", "0");
                }
            }
            doResetShipTime(dataResult.resetShipTime);
            //Tag 判断商品清单是否发生变化，如果发生变化则重新加载订单备注信息
            shipmentTips618();
            // 更新续重运费相关的总重和超额重量
            $("#allFreightWeight").val(dataResult.allFreightWeight);
            $("#overFreightWeight").val(dataResult.overFreightWeight);
            $("#allSxFreightWeight").val(dataResult.allSxFreightWeight);
            $("#overSxFreightWeight").val(dataResult.overSxFreightWeight);
            $("#allWmFreightWeight").val(dataResult.allWmFreightWeight);
            $("#overWmFreightWeight").val(dataResult.overWmFreightWeight);

            $("#allXuZhongWeightSamSXShow").val(dataResult.allXuZhongWeightSamSXShow);
            $("#overXuZhongWeightSamSX").val(dataResult.overXuZhongWeightSamSX);
            $("#allXuZhongWeightSamGenShow").val(dataResult.allXuZhongWeightSamGenShow);
            $("#overXuZhongWeightSamGen").val(dataResult.overXuZhongWeightSamGen);
            $("#allXuZhongWeightSCFShow").val(dataResult.allXuZhongWeightSCFShow);
            $("#overXuZhongWeightSCF").val(dataResult.overXuZhongWeightSCF);
            if (typeof dataResult.hasLocNew !== 'undefined' && dataResult.hasLocNew == "1") {
                $("#locInvoiceTip").removeClass("hide");
            } else {
                $("#locInvoiceTip").addClass("hide");
            }
            if (typeof dataResult.onlyHasLocNew !== 'undefined' && dataResult.onlyHasLocNew == "1") {
                $("#part-inv").addClass("hide");
            } else {
                $("#part-inv").removeClass("hide");
            }
            refreshFreightWeight();
            resetFreightDetailWeight();
            //新版日历
            if (dataResult.calendarVersion == 1 || dataResult.calendarVersion == 2) {
                newVersionCalendarzy(dataResult);
                $("#calendarVersion").val(dataResult.calendarVersion);
            }

            //处理311、411日历信息
            doDealCalenderInfo(dataResult);
            //处理大家电京准达和标准达日历信息
            if (typeof dataResult.promiseDjdBzd !== 'undefined') {
                doDealBigShipCalenderInfo(dataResult);
                setdjJdShipmentCalendarDate();
            }

            var promiseSop = dataResult.promiseSopViewList;
            $("#promiseSopViewList").val(JSON.stringify(promiseSop));

            //处理sop日历信息
            if (typeof dataResult.promiseSopViewList !== 'undefined' && dataResult.promiseSopViewList != null && dataResult.promiseSopViewList.length != 0 && !$(".selfPickInCommonItem").hasClass("item-selected")) {
                doDealSopCalenderInfo(dataResult);
            }
            //处理sop大件日历
            if (typeof $("#saveParam_sopShipment").val() !== 'undefined' && $("#saveParam_sopShipment").val() != null && $("#saveParam_sopShipment").val() != "") {
                doDealSopBigShipCalenderInfo(dataResult);
            }

            //处理自提点信息
            //初始化页面的时候，不默认选中自提
            doSelfPickStatus(dataResult.selfPick, 1, dataResult.gsd);

            //等待之前的处理自提点信息完后处理自提的信息
            if (selfPickShutDownFlag == 1) {
                //轻松购和礼品购过来的按照原来的逻辑走，相当于降级
                if (easyBuyFlag == "1" || easyBuyFlag == "2" || isGiftBuy()) {
                    $("#selfPickShutDownFlag").attr("value", "0");
                } else {
                    if ($(".selfPickInCommonItem").hasClass("item-selected")) {
                        $("#jd_shipment_item").addClass("hide");
                        $("#gsd_shipment_item").addClass("hide");
                        $("#_jdpay").addClass("hide");
                        $("#car_shipment_item").addClass("hide");
                        var honorVenderIds = $("#saveParam_honorVenderIds").val();
                        if (honorVenderIds != null && honorVenderIds != "") {
                            var honors = honorVenderIds.split(",");
                            for (var i = 0; i < honors.length; i++) {
                                $("#Honor_shipment_item_" + honors[i]).addClass("hide");
                                $("#Honor_tip_" + honors[i]).addClass("hide");
                                $("#honorFeetip").addClass("hide");
                            }
                        }
                    } else {
                        $("#pick_shipment_item").addClass("hide");
                    }
                    $("#selfPickShutDownFlag").attr("value", "1");
                    if (typeFlag == 0) {
                        //初始化
                        doAsynInitSelfPickInfo();
                        try {
                            //删除上一次选择的tdc京准达波次时效
                            localStorage.removeItem("tdc_cutOrder");
                        } catch (e) {
                        }
                    }
                    if (typeFlag == 1 && !$(".selfPickInCommonItem").hasClass("item-selected") && typeof $("#closeRefreshSelfpick").val() != 'undefined' && $("#closeRefreshSelfpick").val() == "0") {
                        doAsynInitSelfPickInfo();
                    }
                    if (typeFlag == 1 && $(".selfPickInCommonItem").hasClass("item-selected")) {
                        doHandleSelfPick(0);
                    } else if (!$(".selfPickInCommonItem").hasClass("item-selected")) {
                        ///query_coupons_vertual();
                        if (typeFlag == "0" && $("#useBestCoupons").val() == "1") {
                            if (typeof $("#bestCouponCheck")[0] !== 'undefined') {
                                //$("[id='bestCouponCheck']").attr("checked",'true');
                                //getBastCouponList($("#bestCouponCheck")[0]);
                                //showCouponItem(true);
                            }
                        } else if (easyBuyFlag == "1" || easyBuyFlag == "2" || isGiftBuy()) {
                            query_coupons_vertual();
                        }
                        $("#selfPickSiteName").removeClass("item-selected");
                    } else if (typeFlag == 3 && $(".selfPickInCommonItem").hasClass("item-selected")) {
                        $("#selfpick_name").addClass("hide");
                        $("#selfpick_name").next("div").addClass("hide");
                    }

                    if ($(".selfPickInCommonItem").hasClass("item-selected")) {
                        var actionUrl = OrderAppConfig.AsyncDomain + "/payAndShip/verifySelfPick.action";
                        var param = "shipParam.payId=" + payId;
                        var regionId = $("#temp_pick_sel_regionid").val();
                        if (isEmpty(regionId)) {
                            regionId = "-1";
                        }
                        param = param + "&shipParam.regionId=" + regionId;
                        param = addFlowTypeParam(param)
                        jQuery.ajax({
                            type: "POST",
                            dataType: "json",
                            url: actionUrl,
                            data: param,
                            cache: false,
                            success: function (dataResult, textStatus) {
                                // 没有登录跳登录
                                if (isUserNotLogin(dataResult)) {
                                    goToLogin();
                                    return;
                                }
                                if (dataResult == "null" || dataResult == null || dataResult == "" || dataResult == 0) {
                                    $(".payment-item").each(function () {
                                        var payid = $(this).attr('payid');
                                        if (payid == 1) {
                                            $(this).addClass("payment-item-disabled");
//					  	    		$(this).children('span').remove();
                                            if ($("#codtips").length > 0) {
                                                $("#codtips").remove();
                                            }
                                            $(this).append("<span id='codtips' class='qmark-icon qmark-tip' data-tips='商品属性或所在地区不支持货到付款'></span>");
                                            $(this).parent().removeAttr("onclick");
                                            $(this).parent().removeAttr("clstag");
                                        }
                                    });
                                }
                            },
                            error: function (XMLHttpResponse) {
                                return false;
                            }
                        });
                    }

                }

            } else {
                $("#selfPickShutDownFlag").attr("value", "0");
            }
            // 京准达初始化页面需重置为标准达。故需刷新运费券
            if (typeFlag == "0" && $("#useBestCoupons").val() == "1") {
                if (typeof $("#bestCouponCheck")[0] !== 'undefined') {
                    $("[id='bestCouponCheck']").attr("checked", 'true');
                    getBastCouponList($("#bestCouponCheck")[0]);
                    showCouponItem(true);
                }
            } else if (easyBuyFlag == "1" || easyBuyFlag == "2" || isGiftBuy()) {
                query_coupons_vertual();
            }
            //加载库存、获取店铺名称
            //loadSkuListStock(dataResult.noAvailableSku);
            if (window.orderApi) {
                window.orderApi.loadSkuStock(dataResult.noAvailableSku);
            }
            doGetVendorName();
            showFreightInsurance(dataResult);
            locShopInfo();
            flushOrderPrice(dataResult.orderPrice, false);
            if (dataResult.orderPrice != null && dataResult.orderPrice.payPrice != null) {
                btBrief(dataResult.orderPrice.payPrice);
            }
            jdPayCardList();
            if (dataResult.extraOrderInfo && dataResult.extraOrderInfo.addedService)
                createPopService(dataResult.extraOrderInfo.addedService);
            var otype = $('.payment-item.item-selected').attr('onlinepaytype');
            if (otype != "3") {//如果是京东支付在加载卡列表是判断是否需要支付密码
                isNeedPaymentPassword();
            }
            // 如果是礼品购流程，加载隐藏价格
            if (isGiftBuy()) {
                loadGiftBuyHidePrice();
            }
            // 商品清单埋点
            // skuListTracking(dataResult.cartJson);
            if (typeof callback === 'function') {
                callback();
            }
        },
        error: function (XMLHttpResponse) {
            //alert("系统繁忙，请稍后再试！");
            //goOrder();
        }
    });
    var consignee_area = $("#hideAreaIds").val();
    var consignee_provinceId = 0;
    var consignee_cityId = 0;
    if (consignee_area != null) {
        consignee_provinceId = consignee_area.split("-")[0];
        consignee_cityId = consignee_area.split("-")[1];
    }


    var hongKongId = $("#hongKongId").val();
    var taiWanId = $("#taiWanId").val();
    var overSeasId = $("#overSeasId").val();
    var hkId = $("#hkId").val();
    var mkId = $("#mkId").val();
    //港澳的不显示七天无理由退货
    if (consignee_provinceId == hongKongId || consignee_provinceId == overSeasId || consignee_provinceId == taiWanId) {
        $("#overseamtbuy-area").removeClass("hide");
        $("#overseamtbuy").attr("checked", false);
        overseaAddressWarm(consignee_cityId, hkId, mkId);
        /*$("#tariffTip").removeClass("hide");*/
    } else {
        $("#overseamtbuy-area").addClass("hide");
        //没选择港澳地址可以提单
        $("#tariffTip").addClass("hide");
        $("#hkTip").addClass("hide");
    }
    if (consignee_provinceId == hongKongId || consignee_provinceId == taiWanId || consignee_provinceId == overSeasId) {
        $("#invoiceEdit").addClass("hide");
        $(".seven").text("不支持7天无理由退货");
        $(".seven").removeClass("ftx-04");
        $(".seven").addClass("ftx-03");
        $(".sevenicon").removeClass("p-icon-w");
        $(".sevenicon").addClass("p-icon-no-w");

        if (consignee_provinceId != overSeasId && consignee_provinceId != taiWanId) {
            $("#freighttips").removeClass("hide");
            $("#ftsfreighttips").removeClass("hide");
            $("#tsfreighttips").removeClass("hide");
        } else {
            $("#freighttips").addClass("hide");
            $("#ftsfreighttips").addClass("hide");
            $("#tsfreighttips").addClass("hide");
        }
    } else {
        //代码会覆盖初始化的7天无理由退换状态。
        /**
         * $(".seven").text("支持7天无理由退货");
         $(".seven").addClass("ftx-07");
         $(".seven").removeClass("ftx-03");
         $(".sevenicon").addClass("p-icon-w");
         $(".sevenicon").removeClass("p-icon-no-w");
         *
         */
        $("#invoiceEdit").removeClass("hide");
        $("#freighttips").addClass("hide");
        $("#ftsfreighttips").addClass("hide");
        $("#tsfreighttips").addClass("hide");
    }
    var second = $("#second").val();
    var secondTag = $("#secondHandTag").val();
    var secondMsg = $("#secondHandMsg").val();
    if (second == "true") {
        $("#secondHint").removeClass("hide");
        $("#secondHint").html('<b></b><span id="secondTag"><i></i>' + secondTag + '<a id="secondMsg" href="#none" class="ftx-09 J_ershouBuyTips" onclick="secondHandWarm();">' + secondMsg + '</a></span>');
    }
}

function overseaAddressWarm(consignee_cityId, hkId, mkId) {
    if (consignee_cityId == hkId) {
        $("#hkTip").removeClass("hide");
        $("#tariffTip").addClass("hide");
    } else if (consignee_cityId == mkId) {
        $("#hkTip").addClass("hide");
        $("#tariffTip").addClass("hide");
    } else {
        $("#hkTip").addClass("hide");
        $("#tariffTip").removeClass("hide");
    }
}

function newVersionCalendarzy(dataResult) {
    if (dataResult.newVersionCalendar) {
        $("#jd_shipment_calendar_v2_zy").html(dataResult.newVersionCalendar);
    }
    if (dataResult.carDeliverJzd) {
        $("#car_shipment_calendar_v2_zy").html(dataResult.carDeliverJzd.newVersionCalendar);
    }
    if (dataResult.gsd) {
        $("#gsd_shipment_calendar_v2_zy").html(dataResult.gsd.newVersionCalendar);
    }
    if (typeof dataResult.promiseSopViewList !== 'undefined' && dataResult.promiseSopViewList != null && dataResult.promiseSopViewList.length != 0 && !$(".selfPickInCommonItem").hasClass("item-selected")) {
        var promiseSop = dataResult.promiseSopViewList;
        for (var i = 0; i < promiseSop.length; i++) {
            var venderId = promiseSop[i].venderId;
            if (promiseSop[i].newVersionCalendar) {
                $("#sopjd_shipment_calendar_v2_" + venderId).html(promiseSop[i].newVersionCalendar);
            }
            if (promiseSop[i].promiseGsdView && promiseSop[i].promiseGsdView.newVersionCalendar) {
                $("#gsd_shipment_calendar_v2_" + venderId).html(promiseSop[i].promiseGsdView.newVersionCalendar);
            }
        }
    }
}

/*
 * 首页温馨提示
 */
function orderInfoTip2() {
    if ($("#topTitleInfoUsed").val() == "1" && $("#topTitleInfoFor315").val() == "1") {
        if ($(".ftx-03.withouthk.notseven").length > 0 || $(".withouthk.seven.ftx-03").length > 0) {
            $(".orderInfo-tip").show();
        } else {
            $(".orderInfo-tip").hide();
        }
    } else if ($("#topTitleInfoUsed").val() == "1" && $("#topTitleInfoFor315").val() == "0") {
        $(".orderInfo-tip").show();
    } else {
        $(".orderInfo-tip").hide();
    }
}

function doSelfPickStatus(selfPick, flag, gsd) {
    if (selfPick == null) {
        return;
    }
    var honorVenderId = $("#honorVenderId").val();
    if (selfPick.pickShowStatus == "0") {
        if (gsd != null && $("#gsd_shipment_item").hasClass("curr")) {
            $("#pick_shipment_item").removeClass("curr").addClass("hide");
            $("#selfpick_shipment").addClass("hide");
        } else if ($("#car_shipment_item").hasClass("curr")) {

        } else if ($("#Honor_shipment_item_0").hasClass("curr")) {

        } else {
            if (typeof $("#_jdpay") !== 'undefined' && typeof $("#jd_shipment_item") !== 'undefined' && $("#_jdpay").length > 0 && $("#jd_shipment_item").length == 0) {
                $("#_jdpay").addClass("curr");
            } else {
                if (!$(".selfPickInCommonItem").hasClass("item-selected")) {
                    //厂商直送，自提点不可用
                    $("#jd_shipment_item").addClass("curr");
                    $("#pick_shipment_item").removeClass("curr").addClass("hide");
                    $("#selfpick_shipment").addClass("hide");
                    $("#jd_shipment").addClass("ui-switchable-panel-selected").removeClass("hide");
                }
            }

        }

    } else if (selfPick.pickShowStatus == "1") {

        //自提点可用，并且是选中状态
        //设置自提点显示名称
        var pickNameTemp = $("#beforePickName").val();
        if (pickNameTemp == null || pickNameTemp == "") {
            pickNameTemp = selfPick.pickName;
        }
        //add by zhuqingjie 如果之前还未选过自提点，自提地点为空
        if (pickNameTemp == "null" || pickNameTemp == null || pickNameTemp == "undefined" || pickNameTemp == undefined) {
            pickNameTemp = "";
        }
        if (selfPick.showBanDateTip) {
            $("#selfpick_name").html("<span class='ftx-03'>自提地点：</span>" + pickNameTemp + "<span class='ftx-04'>&nbsp;&nbsp;" + selfPick.showBanDateTip + "</span>");
        } else {
            $("#selfpick_name").html("<span class='ftx-03'>自提地点：</span>" + pickNameTemp);
        }
        $("#selfpick_date").html("<span class='ftx-03'>自提时间：</span>" + selfPick.simplePickDate);
        if ("提货时间以短信通知为准" == selfPick.simplePickDate) {
            $("#selfpick_date").next("div").hide();
        } else {
            $("#selfpick_date").next("div").show();
        }
        //给保存设置值
        $('#saveParam_pickSiteId').val(selfPick.selectedPickView.pickId);
        $('#saveParam_pickDate').val(selfPick.pickDate);
        $('#saveParam_pickSiteNum').val(selfPick.pickSiteNum);
        $('#saveParam_pickRegionId').val(selfPick.selRegionId);
        $('#pick_sel_regionid').val(selfPick.selRegionId);
        $("#pick_shipment_item").removeClass("hide");
        if (selfPick.recommended == true) {
            if ($("#pick_shipment_item > .m-txt > .ftx01").length == 0) {
                //lizheng要求去掉
                //$("#pick_shipment_item .qmark-icon").before('<span class="ftx01">(荐)</span>');
            }
        } else {
            $("#pick_shipment_item .m-txt .ftx01").remove();
        }
        if (selfPick.pickShipSelected == true) {
            if ($("#saveParam_jdShipTime").val() == "4" && $("#saveParam_promiseDate").val() == "") {
                $("#saveParam_jdShipTime").val("3");
            }
            $("#jd_shipment_item").removeClass("curr");
            $("#_jdpay").removeClass("curr");
            $("#jd_shipment").addClass("hide");
            $("#selfpick_shipment").removeClass("hide");
            $("#pick_shipment_item").addClass("curr");
            $("#selfpick_shipment").addClass("ui-switchable-panel-selected");
            $("#gsd_shipment").addClass("hide");

            var venderList = jQuery.parseJSON($("#promiseSopViewList").val());
            if (venderList != null && venderList.length > 0) {
                for (var i = 0; i < venderList.length; i++) {
                    var vendId = venderList[i].venderId;
                    if (vendId != 0) {
                        $("#selfpick_shipment_" + vendId).removeClass("hide");
                        $("#pick_shipment_item_" + vendId).addClass("curr");
                        if (venderList[i].pickDate.length != "" && venderList[i].pickDate.length > 0) {
                            $("#selfpick_date_" + vendId).html("<span class='ftx-03'>自提时间：</span>" + venderList[i].pickDate + " 24:00前");
                        } else {
                            $("#selfpick_date_" + vendId).html("<span class='ftx-03'>自提时间：</span>" + "工作日、双休日与节假日均可送货");
                        }
                        $("#selfpick_date_" + vendId).next("div").hide();
                        $("#sop_jd_shipment_item_" + vendId).addClass("hide");
                        $("#sop_other_shipment_item_" + vendId).addClass("hide");
                        $("#pick_shipment_item_" + vendId).removeClass("hide");
                        $("#selfpick_shipment_" + vendId).removeClass("hide");
                        $("#sop_shipment_date_li_" + vendId).css("display", "none");
                        $("#sop_pick_item_" + vendId).removeClass("curr");
                        $("#sop_pick_item_" + vendId).addClass("hide");
                        $("#delivery-info-li-zxj-sop_" + vendId).hide();
                        $("#sop_pick_" + vendId).addClass("hide");
                    }
                }
            }
        } else if ($("#jd_shipment_item").length == 1) {
            if (!$("#gsd_shipment_item").hasClass("curr")) {
                $("#jd_shipment_item").addClass("curr");
                $("#pick_shipment_item").removeClass("curr");
                $("#selfpick_shipment").addClass("hide");
                $("#jd_shipment").addClass("ui-switchable-panel-selected");
                $("#jd_shipment").removeClass("hide");
                $("#gsd_shipment_item").removeClass("curr");
                $("#gsd_shipment").addClass("hide");
            }

        } else if ($("#_jdpay").length == 1) {
            $("#_jdpay").addClass("curr");
            $("#pick_shipment_item").removeClass("curr");
            $("#selfpick_shipment").addClass("hide");
        }
        $("#noSupSkus_hideDiv")[0].text = "";

    }
    //自提点显示，但是不可用状态
    else if (selfPick.pickShowStatus == "2") {
        $("#pick_shipment_item").removeClass("hide");
        $("#pick_shipment_item").addClass("disabled");
        $("#jd_shipment_item").addClass("curr");
        $("#pick_shipment_item").removeClass("curr");
        $("#selfpick_shipment").addClass("hide");
        $("#jd_shipment").addClass("ui-switchable-panel-selected").removeClass("hide");
        var _arr = [];
        for (var i = 0; i < selfPick.noSupportSelfPickSkuList.length; i++) {
            _arr[i] = "<div class='goods-item'>\
                  <div class='p-img'>\
                    <a target='_blank' href='http://item.jd.com/" + selfPick.noSupportSelfPickSkuList[i].id + ".html'><img src='//img14.360buyimg.com/N4/" + selfPick.noSupportSelfPickSkuList[i].imgUrl + "' alt=''></a>\
                  </div>\
                  <div class='p-name'>\
                    <a target='_blank' href='http://item.jd.com/" + selfPick.noSupportSelfPickSkuList[i].id + ".html'>" + selfPick.noSupportSelfPickSkuList[i].name + "+</a>\
                  </div>\
                </div>";
        }
        var noSupSkusHTML = "<div class='tooltip-goods'><div class='tooltip-tit'>以下商品不支持自提</div><div class='goods-items'>" + _arr.join('') + "</div></div>";
        $("#noSupSkus_hideDiv")[0].text = noSupSkusHTML;
    }

    $("#picksite_hidediv").html(selfPick.pickShipmentView);
    $("#pickSiteShipDate").html(selfPick.pickDateHtml);
    // 618促销配送信息
    shipmentTips618();
}

/**
 * 大促错峰文案
 */
function shipmentTips618(flag) {
    //默认隐藏所有提示
    $(".tips-618").addClass('hide');
    //通过配置方式获取配置文案
    var normalCopywritingContent = $("#normalCopywritingContent").val();
    var calendarCopywritingContent = $("#calendarCopywritingContent").val();
    var zTCopyInfoConfig = jQuery.parseJSON($(".zTCopyInfoConfig").html());
    var content = "";
    var specialprid = $("#specialprid").val();
    var specialctid = $("#specialctid").val();
    var specialctyid = $("#specialctyid").val();
    var specialtyid = $("#specialtyid").val();
    if (typeof specialprid === 'undefined' || specialprid == "" || specialprid == null) {
        specialprid = $("#consignee-list .item-selected").attr("provinceId");

    }
    if (typeof specialctid === 'undefined' || specialctid == "" || specialctid == null) {
        specialctid = $("#consignee-list .item-selected").attr("cityId");

    }
    if (typeof specialctyid === 'undefined' || specialctyid == "" || specialctyid == null) {
        specialctyid = $("#consignee-list .item-selected").attr("countyId");

    }
    if (typeof specialtyid === 'undefined' || specialtyid == "" || specialtyid == null) {
        specialtyid = $("#consignee-list .item-selected").attr("townId");
    }

    if (zTCopyInfoConfig != null && typeof zTCopyInfoConfig != 'undefined') {
        var ztContent = zTCopyInfoConfig.ztContent;
        for (var key in ztContent) {
            if (key == specialprid) {
                content = ztContent[key];
            }
            if (key == specialprid + "-" + specialctid) {
                content = ztContent[key];
            }
            if (key == specialprid + "-" + specialctid + "-" + specialctyid) {
                content = ztContent[key];
            }
            if (key == specialprid + "-" + specialctid + "-" + specialctyid + "-" + specialtyid) {
                content = ztContent[key];
            }

        }
    }

    if ($("#justPick").val() == 1) {
        if ($("#justPickCopy").val() == 1 || $(".selfPickInCommonItem").hasClass("item-selected")) {
            normalCopywritingContent = $("#normalCopywritingContent").val();
            if (content != "") {
                normalCopywritingContent = content;
            }
            if ($("#pick_shipment_item").hasClass("curr")) {
                $(".tips-618.tips-618-for-selfpick").find(".tips-m").html(normalCopywritingContent);
                $(".tips-618.tips-618-for-selfpick").removeClass('hide');
            } else {
                $(".tips-618.tips-618-for-normal").find(".tips-m").html(normalCopywritingContent);
                $(".tips-618.tips-618-for-normal").removeClass('hide');
            }
            if ($("#jdpayself").val() == 1) {
                $(".tips-618.tips-618-for-jdpay").find(".tips-m").html(normalCopywritingContent);
                $(".tips-618.tips-618-for-jdpay").removeClass('hide');
            }
        } else {
            $(".tips-618.tips-618-for-selfpick").addClass('hide');
            $(".tips-618.tips-618-for-normal").addClass('hide');
            $(".tips-618.tips-618-for-jdpay").addClass('hide');
        }
        return;
    }

    //判断文案是否在存在京准达的情况下
    if ($("#needForJZD").val() == 1) {
        normalCopywritingContent = 0;
        if ($("#jd_shipment_item").hasClass("curr") && !$("#zxj_show_id").hasClass("hide")) {
            normalCopywritingContent = $("#normalCopywritingContent").val();
        }
        if ($("#bigitem_shipment_item").hasClass("curr") && !$("#djdJzd_show_id").hasClass("hide")) {
            normalCopywritingContent = $("#normalCopywritingContent").val();
        }
    }
    if ($("#supportByDay").val() == 1) {
        var tips;
        if ($("#jd_shipment_item").hasClass("curr")) {
            tips = $("#jd_shipment_calendar_date").find(".mode-infor").html();
        } else if ($("#bigitem_shipment_item").hasClass("curr")) {
            tips = $("#shipment_date_div").find(".mode-infor").html();
        }
        if (tips != null && typeof tips !== 'undefined' && tips != null) {
            if (tips.indexOf("周一") > 0 || tips.indexOf("周二") > 0 || tips.indexOf("周三") > 0 || tips.indexOf("周四") > 0 || tips.indexOf("周五") > 0) {
                normalCopywritingContent = $("#workdayContent").val();
            } else if (tips.indexOf("周六") > 0 || tips.indexOf("周日") > 0) {
                normalCopywritingContent = $("#weekendContent").val();
            }
            if (tips.indexOf("今天") > 0) {
                var week = new Date().getDay();
                if (week == 0 || week == 6) {
                    normalCopywritingContent = $("#weekendContent").val();
                } else {
                    normalCopywritingContent = $("#workdayContent").val();
                }
            }
        }
    }
    if ($("#supportSelfPick").val() == 1 && $(".selfPickInCommonItem").hasClass("item-selected")) {
        //normalCopywritingContent = $("#normalCopywritingContent").val();
        var tips = $("#selfpick_date").html();
        if (tips != null && typeof tips !== 'undefined' && tips != null && $("#supportByDay").val() == 1) {
            if (tips.indexOf("周一") > 0 || tips.indexOf("周二") > 0 || tips.indexOf("周三") > 0 || tips.indexOf("周四") > 0 || tips.indexOf("周五") > 0) {
                normalCopywritingContent = $("#workdayContent").val();
            } else if (tips.indexOf("周六") > 0 || tips.indexOf("周日") > 0) {
                normalCopywritingContent = $("#weekendContent").val();
            }
            if (tips.indexOf("今天") > 0) {
                var week = new Date().getDay();
                if (week == 0 || week == 6) {
                    normalCopywritingContent = $("#weekendContent").val();
                } else {
                    normalCopywritingContent = $("#workdayContent").val();
                }
            }
        }
        if ($("#pick_shipment_item").hasClass("curr") && normalCopywritingContent != 0 && normalCopywritingContent != undefined) {
            $(".tips-618.tips-618-for-selfpick").find(".tips-m").html(normalCopywritingContent);
            $(".tips-618.tips-618-for-selfpick").removeClass('hide');
        }
    }

    //首页引到话术
    if (normalCopywritingContent != 0 && normalCopywritingContent != undefined) {
        if ($("#jd_shipment_item").hasClass("curr") || $("#gsd_shipment_item").hasClass("curr") || $("#car_shipment_item").hasClass("curr")) {
            $(".tips-618.tips-618-for-normal").find(".tips-m").html(normalCopywritingContent);
            $(".tips-618.tips-618-for-normal").removeClass('hide');
        } else if ($("#bigitem_shipment_item").hasClass("curr")) {
            $(".tips-618.tips-618-for-bigitem").find(".tips-m").html(normalCopywritingContent);
            $(".tips-618.tips-618-for-bigitem").removeClass('hide');
        }
    }

    if ($("#supportSop").val() == 1) {
        var venderList = jQuery.parseJSON($("#promiseSopViewList").val());
        if (venderList != null && typeof venderList != undefined && venderList.length > 0) {
            for (var i = 0; i < venderList.length; i++) {
                if ($("#supportByDay").val() == 1) {
                    var tips = $("#sop_shipment_date_" + venderList[i].venderId).find(".mode-infor").html();
                    if (tips != null && typeof tips !== 'undefined' && tips != null) {
                        if (tips.indexOf("周一") > 0 || tips.indexOf("周二") > 0 || tips.indexOf("周三") > 0 || tips.indexOf("周四") > 0 || tips.indexOf("周五") > 0) {
                            normalCopywritingContent = $("#workdayContent").val();
                        } else if (tips.indexOf("周六") > 0 || tips.indexOf("周日") > 0) {
                            normalCopywritingContent = $("#weekendContent").val();
                        } else {
                            normalCopywritingContent = $("#normalCopywritingContent").val();
                        }
                        if (tips.indexOf("今天") > 0) {
                            var week = new Date().getDay();
                            if (week == 0 || week == 6) {
                                normalCopywritingContent = $("#weekendContent").val();
                            } else {
                                normalCopywritingContent = $("#workdayContent").val();
                            }
                        }
                    }
                    var bigCopywritingContent = $("#normalCopywritingContent").val();
                    var bigtips = $("#sop_big_shipment_date_" + venderList[i].venderId).find(".mode-infor").html();
                    if (bigtips != null && typeof bigtips !== 'undefined' && bigtips != null) {
                        if (bigtips.indexOf("周一") > 0 || bigtips.indexOf("周二") > 0 || bigtips.indexOf("周三") > 0 || bigtips.indexOf("周四") > 0 || bigtips.indexOf("周五") > 0) {
                            bigCopywritingContent = $("#workdayContent").val();
                        } else if (bigtips.indexOf("周六") > 0 || bigtips.indexOf("周日") > 0) {
                            bigCopywritingContent = $("#weekendContent").val();
                        } else {
                            normalCopywritingContent = $("#normalCopywritingContent").val();
                        }
                    }
                }
                if ($("#sop_jd_shipment_item_" + venderList[i].venderId).hasClass("curr") && normalCopywritingContent != 0 && normalCopywritingContent != undefined) {
                    $("#618SopTips_" + venderList[i].venderId).find(".tips-m").html(normalCopywritingContent);
                    $("#618SopTips_" + venderList[i].venderId).removeClass('hide');
                }
                if ($("#sop_big_jd_shipment_item_" + venderList[i].venderId).hasClass("curr") && bigCopywritingContent != 0 && bigCopywritingContent != undefined) {
                    $("#618SopBigTips_" + venderList[i].venderId).find(".tips-m").html(bigCopywritingContent);
                    $("#618SopBigTips_" + venderList[i].venderId).removeClass('hide');
                }
                if ($("#pick_shipment_item_" + venderList[i].venderId).hasClass("curr") && bigCopywritingContent != 0 && bigCopywritingContent != undefined) {
                    $("#618SopTips_" + venderList[i].venderId).find(".tips-m").html(bigCopywritingContent);
                    $("#618SopTips_" + venderList[i].venderId).removeClass('hide');
                }
            }
        }
    }

}

//点击切换付款方式
function doSwithPaymentWay(supPaymentWayId) {
    $("#subpayment .payment-item").removeClass("item-selected");
    $("#supPaymentWay_" + supPaymentWayId).addClass("item-selected");
    var link2 = $("#link2").val();
    var link3 = $("#link3").val();
    var link4 = $("#link4").val();
    var link5 = $("#link5").val();
    //控制显示提示
    if (supPaymentWayId == "0") {
        $(".pay_way_remark").hide();
    } else if (supPaymentWayId == "1") {
        $(".pay_way_remark").html('<span class="qmark"></span><a class="ftx-05" href="' + link2 + '" target="_blank">货到付款可以POS机刷卡吗？</a>');
        $(".pay_way_remark").show();
    }
    if (supPaymentWayId == "2") {
        $(".pay_way_remark").html('<span class="qmark"></span>' +
            '<a class="ftx-05" href="' + link3 + '" target="_blank">使用支票支付，如何填写抬头？</a>' +
            '<br>' +
            '<span class="qmark"></span>' +
            '<a class="ftx-05" href="' + link4 + '" target="_blank">哪些地区可以使用支票支付？</a>' +
            '<br>' +
            '<span class="qmark"></span>' +
            '<a class="ftx-05" href="' + link5 + '" target="_blank">支票支付的订单，我支票金额比订单的应支付金额多怎么办？</a>' +
            '<br>' +
            '<span class="qmark"></span>' +
            '<a class="ftx-05" href="javascript:void(0)">非自营商品不支持支票支付。</a>');
        $(".pay_way_remark").show();
    }
}

//点击切换付款方式
function doSwithBigItemPaymentWay(thisElement) {
    $("#bigItemsubpayment .payment-item").removeClass("item-selected");
    $(thisElement).addClass("item-selected");
    var link2 = $("#link2").val();
    var link3 = $("#link3").val();
    var link4 = $("#link4").val();
    var link5 = $("#link5").val();
    //控制显示提示
    if ($(thisElement).attr("supPaymentWayId") == "0") {
        $(".pay_way_remark").hide();
    } else if ($(thisElement).attr("supPaymentWayId") == "1") {
        $(".pay_way_remark").html('<span class="qmark"></span><a class="ftx-05" href="' + link2 + '" target="_blank">货到付款可以POS机刷卡吗？</a>');
        $(".pay_way_remark").show();
    }
    if ($(thisElement).attr("supPaymentWayId") == "2") {
        $(".pay_way_remark").html('<span class="qmark"></span>' +
            '<a class="ftx-05" href="' + link3 + '" target="_blank">使用支票支付，如何填写抬头？</a>' +
            '<br>' +
            '<span class="qmark"></span>' +
            '<a class="ftx-05" href="' + link4 + '" target="_blank">哪些地区可以使用支票支付？</a>' +
            '<br>' +
            '<span class="qmark"></span>' +
            '<a class="ftx-05" href="' + link5 + '" target="_blank">支票支付的订单，我支票金额比订单的应支付金额多怎么办？</a>' +
            '<br>' +
            '<span class="qmark"></span>' +
            '<a class="ftx-05" href="javascript:void(0)">非自营商品不支持支票支付。</a>');
        $(".pay_way_remark").show();
    }
}

function doEditPickReigon(obj) {
    var actionUrl = OrderAppConfig.AsyncDomain + "/payAndShip/getPickSiteByRegion.action";
    var payId = $("#payment-list .payment-item.item-selected").attr("payid");
    var pickId = $("#pick-sites .site-item.site-item-selected").attr("pickid");
    if (isEmpty(payId)) {
        payId = 4;
    }
    var regionId = $(obj).val();
    if (isEmpty(regionId)) {
        regionId = "-1";
    }
    $("#temp_pick_sel_regionid").val(regionId);
    //var repRegionId = regionId.replace(/:/g,"-");
    var param = "shipParam.payId=" + payId;
    param = param + "&shipParam.pickSiteId=" + pickId;
    param = param + "&shipParam.regionId=" + regionId;
    param = param + "&shipParam.pickSiteNum=5";
    param = addFlowTypeParam(param);
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: actionUrl,
        data: param,
        cache: false,
        success: function (dataResult, textStatus) {
            // 没有登录跳登录
            if (isUserNotLogin(dataResult)) {
                goToLogin();
                return;
            }
            if (dataResult == "null") {
                alert("自提点获取异常，请重新选择或稍后尝试");
                goOrder();
            }
            var jsonO = dataResult;
            if (jsonO.pickViewList.length == 0) {
                alert("自提点获取异常，请重新选择或稍后尝试");
                goOrder();
            }
            var pickSiteListHTML = "";
            if (jsonO.pickViewList.length != 0) {
                for (var i = 0; i < jsonO.pickViewList.length; i++) {
                    pickSiteListHTML = pickSiteListHTML + "<div class='site-item";
                    if (jsonO.pickViewList[i].selected == true) {
                        pickSiteListHTML = pickSiteListHTML + " site-item-selected";
                    }
                    //add by zhuqingjie 添加自提点不可用标记
                    if (jsonO.pickViewList[i].cabinetAvailable == false) {
                        pickSiteListHTML = pickSiteListHTML + " site-item-disabled";
                    }
                    //end add
                    pickSiteListHTML = pickSiteListHTML + "' pickName='" + jsonO.pickViewList[i].pickName + "' pickid='" + jsonO.pickViewList[i].pickId + "' > <div class='site-in-short' onclick='doSelectPicksite(this)' >";
                    pickSiteListHTML = pickSiteListHTML + jsonO.pickViewList[i].pickName;
                    if (jsonO.pickViewList[i].used == true) {
                        pickSiteListHTML = pickSiteListHTML + "<span class='ftx-04'>[最近使用]</span>";
                    }
                    if (jsonO.pickViewList[i].cabinetAvailable == false) {
                        pickSiteListHTML = pickSiteListHTML + "<span class='ftx-01'>[已满]</span>";
                    }
                    if (jsonO.pickViewList[i].limitKeyword == "1") {
                        pickSiteListHTML = pickSiteListHTML + "<span class='ftx-01'>[限]</span>";
                    }
                    if (jsonO.pickViewList[i].limitKeyword == "1" && jsonO.pickViewList[i].specialRemark != "") {
                        pickSiteListHTML = pickSiteListHTML + jsonO.pickViewList[i].specialRemark;
                    }
                    pickSiteListHTML = pickSiteListHTML + " <b></b></div>";
                    pickSiteListHTML = pickSiteListHTML + " <div class='field'> ";
                    pickSiteListHTML = pickSiteListHTML + " <span class='tip'> ";
                    pickSiteListHTML = pickSiteListHTML + jsonO.pickViewList[i].address;
                    pickSiteListHTML = pickSiteListHTML + " </span> ";
                    pickSiteListHTML = pickSiteListHTML + " <a class='ftx-05 map-link' target='_blank' href='" + jsonO.pickViewList[i].mapUrl + "'>" + jsonO.pickViewList[i].helpMessage + "</a> ";
                    pickSiteListHTML = pickSiteListHTML + " </div> <div class='clr'></div></div>  ";
                }
            }
            $("#selfpick_siteDiv .pick-sites").html(pickSiteListHTML);
            if (jsonO.pickViewList.length >= 5) {
                $("#selfpick_siteDiv .selfpick_more_link").removeClass("hide");
            } else {
                $("#selfpick_siteDiv .selfpick_more_link").addClass("hide");
            }
        },
        error: function (XMLHttpResponse) {
            //alert("系统繁忙，请稍后再试！");
            return false;
        }
    });
}

function open_MorePicksite(obj) {
    var actionUrl = OrderAppConfig.AsyncDomain + "/payAndShip/getPickSiteByRegion.action";
    var payId = $("#payment-list .payment-item.item-selected").attr("payid");
    var pickId = $("#selfpick_siteDiv #pick-sites .site-item.site-item-selected").attr("pickid");
    if (isEmpty(payId)) {
        payId = 4;
    }

    var regionId = $("#temp_pick_sel_regionid").val();
    if (isEmpty(regionId)) {
        regionId = "-1";
    }
    //var repRegionId = regionId.replace(/:/g,"-");
    var param = "shipParam.payId=" + payId;
    param = param + "&shipParam.pickSiteId=" + pickId;
    param = param + "&shipParam.regionId=" + regionId;
    param = param + "&shipParam.pickSiteNum=100";
    param = addFlowTypeParam(param);
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: actionUrl,
        data: param,
        cache: false,
        success: function (dataResult, textStatus) {
            // 没有登录跳登录
            if (isUserNotLogin(dataResult)) {
                goToLogin();
                return;
            }
            if (dataResult == "null") {
                alert("自提点获取异常，请重新选择或稍后尝试");
                goOrder();
            }
            var jsonO = dataResult;
            if (jsonO.pickViewList.length == 0) {
                alert("自提点获取异常，请重新选择或稍后尝试");
                goOrder();
            }
            var pickSiteListHTML = "";
            if (jsonO.pickViewList.length != 0) {
                for (var i = 0; i < jsonO.pickViewList.length; i++) {
                    pickSiteListHTML = pickSiteListHTML + "<div class='site-item";
                    if (jsonO.pickViewList[i].selected == true) {
                        pickSiteListHTML = pickSiteListHTML + " site-item-selected";
                    }
                    //add by zhuqingjie 添加自提点不可用标记
                    if (jsonO.pickViewList[i].cabinetAvailable == false) {
                        pickSiteListHTML = pickSiteListHTML + " site-item-disabled";
                    }
                    //end add
                    pickSiteListHTML = pickSiteListHTML + "' pickid='" + jsonO.pickViewList[i].pickId + "' > <div class='site-in-short' onclick='doSelectPicksite(this)' >";
                    pickSiteListHTML = pickSiteListHTML + jsonO.pickViewList[i].pickName;
                    if (jsonO.pickViewList[i].used == true) {
                        pickSiteListHTML = pickSiteListHTML + "<span class='ftx-04'>[最近使用]</span>";
                    }
                    if (jsonO.pickViewList[i].cabinetAvailable == false) {
                        pickSiteListHTML = pickSiteListHTML + "<span class='ftx-01'>[已满]</span>";
                    }
                    if (jsonO.pickViewList[i].limitKeyword == "1") {
                        pickSiteListHTML = pickSiteListHTML + "<span class='ftx-01'>[限]</span>";
                    }
                    if (jsonO.pickViewList[i].limitKeyword == "1" && jsonO.pickViewList[i].specialRemark != "") {
                        pickSiteListHTML = pickSiteListHTML + jsonO.pickViewList[i].specialRemark;
                    }
                    pickSiteListHTML = pickSiteListHTML + " <b></b></div>";
                    pickSiteListHTML = pickSiteListHTML + " <div class='field'> ";
                    pickSiteListHTML = pickSiteListHTML + " <span class='tip'> ";
                    pickSiteListHTML = pickSiteListHTML + jsonO.pickViewList[i].address;
                    pickSiteListHTML = pickSiteListHTML + " </span> ";
                    pickSiteListHTML = pickSiteListHTML + " <a class='ftx-05 map-link' target='_blank' href='" + jsonO.pickViewList[i].mapUrl + "'>" + jsonO.pickViewList[i].helpMessage + "</a> ";
                    pickSiteListHTML = pickSiteListHTML + " </div> <div class='clr'></div></div>  ";

                }
            }
            $("#selfpick_siteDiv .pick-sites").html(pickSiteListHTML);
            $("#selfpick_siteDiv .selfpick_more_link").addClass("hide");
        },
        error: function (XMLHttpResponse) {
            //alert("系统繁忙，请稍后再试！");
            return false;
        }
    });
}

function closebtDialog() {
    $.closeDialog();
}

function closebtErrorTip() {
    $(".payment-bt-tips").hide();
}

function btBrief(orderPrice) {
    if ($(".payment-item[onlinepaytype='1']").hasClass("item-selected")) {
        $(".fc-baitiao-info").show();
        if (orderPrice == 0) {
            $(".bt-edit-icon").hide();
        } else {
            $(".bt-edit-icon").show();
        }
        $("#sumPayPriceId").text("￥" + $("#btNeedPay").val());
    } else {
        $(".fc-baitiao-info").hide();
        $("#sumPayPriceId").text("￥" + orderPrice.toFixed(2));
    }

}

function saveBtInfo(param, plan, laterPay, couponDes, total, des) {
    if (typeof (total) != "number") {
        total = parseFloat(total);
    }
    $("#sumPayPriceId").text("￥" + total.toFixed(2));
    $("#btNeedPay").val(total.toFixed(2));
    $("#baitiaoPayRequest").val(param);
    var t;
    if (des == undefined) {
        if (isEmpty(couponDes)) {
            couponDes = '（不使用优惠';
        } else {
            couponDes = '（优惠' + couponDes;
        }
        if (plan == undefined || plan == 1) {
            plan = '<em>不分期</em>';
        } else {
            plan = '<em>¥' + laterPay + 'x' + plan + '</em>期';
        }
        t = '白条支付：' + plan + couponDes + '）';
    } else {
        t = des;
    }
    var info = '<span>' + t + '<i class="bt-edit-icon" onclick="javascript:btDetail();" clstag="pageclick|keycount|PaymentLead__2016030411|5"></i></span>';
    $(".fc-baitiao-info").html(info);
}

function resetBt(price) {
    var lastneedPay = $("#lastneedPay").val();
    if (typeof (price) != "number") {
        price = parseFloat(price);
    }
    if (price != parseFloat(lastneedPay)) {
        $("#lastneedPay").val(price.toFixed(2));
        if ($("#baitiaoPayRequest").val() != "plan=1") {
            if ($(".payment-item[onlinepaytype='1']").hasClass("item-selected")) {
                $(".payment-bt-tips").show();
            }
        }
        saveBtInfo("plan=1", 1, 0, null, price.toFixed(2));
    }
    if ($(".payment-item[onlinepaytype='1']").hasClass("item-selected")) {
        if (price == 0) {
            $(".bt-edit-icon").hide();
        } else {
            $(".bt-edit-icon").show();
        }
    }
}

function btDetail() {
    if ($("#canBaitiaoDetail").val() == "false") {
        return;
    }
    var lastneedPay = $("#lastneedPay").val();
    if (parseFloat(lastneedPay) == 0) {
        alert("您已不需要分期！");
        return;
    }
    var orderAmount = $("#lastneedPay").val();
    var btParam = $("#baitiaoPayRequest").val();
    var allskus = $.parseJSON($("#sopCartJson").val());
    var notgitfsku = [];
    $(allskus).each(function () {
        if (!this.gift) {
            var tmp = {"skuId": this.id, "count": this.num, "shopId": this.shopId, "cid": this.cid};
            notgitfsku.push(tmp);
        }
    });
    var dataMap = JSON.stringify(notgitfsku);
    var param = "orderAmount=" + orderAmount + "&" + btParam + "&dataMap=" + encodeURIComponent(dataMap) + "&v=" + new Date().getTime();

    //如果白条首次还款日期未自动设置（#baitiaoPayRequest中），则使用结算页初始化时的默认值。
    var baitiaoPayRepayDateInfo = $("#baitiaoPayRepayDateRequest").val();
    if (!isEmpty(baitiaoPayRepayDateInfo) && param.indexOf("repayDate") < 0) {
        param += "&" + baitiaoPayRepayDateInfo;
    }

    var actionUrl = "//btrim.jd.com/coupon/getCalculateStage?" + param;
    $('body').dialog({
        title: '选择白条支付',
        width: 570,
        height: 310,
        type: 'iframe',
        autoIframe: false,
        iframeTimestamp: false,
        source: actionUrl,
        mainId: "btDialog"
    });
}

function jdPayCardList() {
    if (!$(".payment-item[onlinepaytype='3']").hasClass("item-selected")) {
        return;
    }
    var flowType = $("#flowType").val();
    var actionUrl = OrderAppConfig.DynamicDomain + "/payAndShip/getCardsInfo.action";
    if (!isEmpty(flowType)) {
        actionUrl = actionUrl + "?flowType=" + flowType;
    }
    jQuery.ajax({
        type: "POST",
        dataType: "text",
        url: actionUrl,
        cache: false,
        success: function (dataResult, textStatus) {
            $("#jdpayCards").remove();
            if (isUserNotLogin(dataResult)) {
                return;
            }
            if (!$(".payment-item[onlinepaytype='3']").hasClass("item-selected")) {
                return;
            }
            if (isHasMessage(dataResult)) {
                $('.payment-list').append('<div id="jdpayCards" class="bankcard-con"><span id="nocard" cardInfo="error" class="nobankcard"><i></i>当前没有获取到银行卡，提交订单后进入收银台结算</span></div>');
                alert("获取银行卡列表异常");
                return;
            } else {
                $('.payment-list').append('<div id="jdpayCards" class="bankcard-con">' + dataResult + '</div>');
            }
        },
        error: function (XMLHttpResponse) {
            $("#jdpayCards").remove();
            if (!$(".payment-item[onlinepaytype='3']").hasClass("item-selected")) {
                return;
            }
            $('.payment-list').append('<div id="jdpayCards" class="bankcard-con"><span id="nocard" cardInfo="error" class="nobankcard"><i></i>当前没有获取到银行卡，提交订单后进入收银台结算</span></div>');
            alert("获取银行卡列表异常");
        }
    });
}

//商品清单埋点
function skuListTracking(cartJson) {
    var skuIds = "";
    var obj = eval(cartJson);
    $(obj).each(function (index) {
        var value = obj[index];
        skuIds = skuIds + value.id + ",";
    });
    log('ord', 'trade', 10, skuIds);
}

//页面加载后异步调用推荐自提地址信息
function doAsynInitSelfPickInfo() {
    if ($("#selfPickShutDownFlag").attr("value") == 1) {
        if ($("#selfPickOptimize").attr("value") == 1) {
        } else {
            $("#pick_shipment_item").addClass("hide");
            var actionUrl = OrderAppConfig.AsyncDomain + "/payAndShip/initSelfPick.action";
            var selectedAddressType = "";
            var pickName = $("#pickName");
            var pickId = "";
            var isOpenConsignee = 0;
            if ($("#isOpenConsignee").val() == 1) {
                isOpenConsignee = 1;
            }
            //如果orderStore里有自提地址，以前用过，就取以前的，没用过的话就传过去null
            if (pickName.length > 0) {
                pickId = $("#pickName").attr("pickId");
                if (isEmpty(pickId)) {
                    pickId = "";
                }
            }
            //这个根据上面的方法获得的，此时已经异步走了一趟支付配送了？
            var payId = $("#payment-list .payment-item.item-selected").attr("payid");
            if (isEmpty(payId)) {
                payId = 4;
            }

            var regionId = $("#temp_pick_sel_regionid").val();
            if (isEmpty(regionId)) {
                regionId = "-1";
            }
            //四级地址id
            var consigneeId = $("#consignee-list .item-selected").attr("consigneeId");

            //是否为默认地址 ，因为默认地址只有一个，且默认选中，初始化时选中的地址肯定为默认地址，判断有无addr-default类即可
            //isAddrDefault:0不是，1是
            var isAddrDefaultSpan = $(".addr-default");
            var isAddrDefault = 0;
            if (isAddrDefaultSpan.length > 0) {
                isAddrDefault = 1;
            }
            var param = "shipParam.payId=" + payId;
            param = param + "&shipParam.pickSiteId=" + pickId;
            param = param + "&shipParam.regionId=" + regionId;
            param = param + "&shipParam.pickSiteNum=10";
            param = param + "&consigneeId=" + consigneeId;
            param = param + "&isAddrDefault=" + isAddrDefault;
            param = param + "&selectedAddressType=" + selectedAddressType;
            param = param + "&isOpenConsignee=" + isOpenConsignee;
            param = addFlowTypeParam(param);
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: actionUrl,
                data: param,
                cache: false,
                success: function (dataResult, textStatus) {
                    // 没有登录跳登录
                    if (isUserNotLogin(dataResult)) {
                        goToLogin();
                        return;
                    }
                    if (dataResult == "null" || dataResult == null || dataResult == "") {
                        return;
                    }
                    var jsonO = dataResult;
                    if (jsonO.selfPickFlag == 1) {
                        $("#selfPickArea").removeClass("hide");
                        var pickSiteListHTML = "";
                        if (typeof $("#closeRefreshSelfpick").val() != 'undefined' && $("#closeRefreshSelfpick").val() == "0") {
                            $("#selfPickSiteName").addClass("consignee-item");
                            $("#selfPickSiteName").removeClass("consignee-item-disable");
                        }
                        pickSiteListHTML = pickSiteListHTML + "<li class='ui-switchable-panel ui-switchable-panel-selected selfPickInCommon' style='display:none' id='consignee_index_0'>";
                        pickSiteListHTML = pickSiteListHTML + "<div class='consignee-item selfPickInCommonItem hide' consigneeid='";
                        pickSiteListHTML = pickSiteListHTML + jsonO.consigneeId;
                        pickSiteListHTML = pickSiteListHTML + "' id='consignee_index_div_0'>";
                        pickSiteListHTML = pickSiteListHTML + "<span limit='8' title=''></span><b></b></div>";
                        pickSiteListHTML = pickSiteListHTML + "<div class='addr-detail hide'><span class='addr-name' limit='6' title=''>闅愯棌鍦板潃";
                        pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45' title=''></span>";
                        pickSiteListHTML = pickSiteListHTML + "<span class='addr-tel'></span></div>";
                        pickSiteListHTML = pickSiteListHTML + "<div class='op-btns hide' consigneeid=''></div></li>";
                        $("#consignee-list").append(pickSiteListHTML);
                        $("#selfPickEdit").removeClass("hide");
                    } else if (jsonO.selfPickFlag == 2) {
                        //把自提显示打开,置灰，不可选
                        $("#selfPickArea").removeClass("hide");
                        $("#selfPickSiteName").removeClass("consignee-item");
                        $("#selfPickSiteName").addClass("consignee-item-disable");
                        $(".selfPickChoose").removeClass("hide");
                    } else if (jsonO.selfPickFlag == 3) {
                        //把自提显示打开,置灰，可选
                        $("#selfPickArea").removeClass("hide");
                        $("#selfPickSiteName").removeClass("consignee-item");
                        $("#selfPickSiteName").addClass("consignee-item-disable");
                        $(".selfPickChoose").removeClass("hide");
                        if (jsonO != null && jsonO.pickId != 0) {
                            $("#recommendAddr").removeClass("hide");
                            //把新的推荐地址显示到页面
                            var pickSiteListHTML = "";
                            pickSiteListHTML = pickSiteListHTML + "<li id='recommendAddr' pickid='";
                            pickSiteListHTML = pickSiteListHTML + jsonO.pickId;
                            pickSiteListHTML = pickSiteListHTML + "'><div class='consignee-item' onclick='openUseSelfPickConsigneeDialog()'><i class='pick-rec-icon'></i><span>";
                            pickSiteListHTML = pickSiteListHTML + "匹配自提点";
                            pickSiteListHTML = pickSiteListHTML + "</span><b></b></div><div class='addr-detail'><span class='addr-name'>";
                            pickSiteListHTML = pickSiteListHTML + jsonO.pickName;
                            pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45'>";
                            //			    	  pickSiteListHTML = pickSiteListHTML + jsonO.pickName+" "+jsonO.areaName+" ";
                            //			    	  pickSiteListHTML = pickSiteListHTML + jsonO.pickName+"   ";
                            pickSiteListHTML = pickSiteListHTML + jsonO.address;
                            pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-tel'>";
                            pickSiteListHTML = pickSiteListHTML + "";
                            pickSiteListHTML = pickSiteListHTML + "</span></div><div class='addr-ops'>";
                            pickSiteListHTML = pickSiteListHTML + "<a href='#none' class='setdefault-selfPick ftx-05 mr10' onclick='openUseSelfPickConsigneeDialog(";
                            pickSiteListHTML = pickSiteListHTML + jsonO.pickId;
                            pickSiteListHTML = pickSiteListHTML + ")'>更换自提地址</a>";
                            pickSiteListHTML = pickSiteListHTML + "</div></li>";
                            $("#selfPickInfo").append(pickSiteListHTML);
                        } else {
                            $("#recommendAddr").addClass("hide");
                        }
                    } else if (jsonO.selfPickFlag == 4) {
                        //去掉现有选中地址
                        $(".consignee-item.item-selected").removeClass("item-selected");
                        //把自提关联的常用地址添加到地址列表里
                        var pickSiteListHTML = "";
                        pickSiteListHTML = pickSiteListHTML + "<li class='ui-switchable-panel ui-switchable-panel-selected selfPickInCommon' style='display:none' id='consignee_index_0'>";
                        pickSiteListHTML = pickSiteListHTML + "<div class='consignee-item selfPickInCommonItem hide' consigneeid='";
                        pickSiteListHTML = pickSiteListHTML + jsonO.consigneeId;
                        pickSiteListHTML = pickSiteListHTML + "' id='consignee_index_div_0'>";
                        pickSiteListHTML = pickSiteListHTML + "<span limit='8' title=''></span><b></b></div>";
                        pickSiteListHTML = pickSiteListHTML + "<div class='addr-detail hide'><span class='addr-name' limit='6' title=''>隐藏地址";
                        pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45' title=''></span>";
                        pickSiteListHTML = pickSiteListHTML + "<span class='addr-tel'></span></div>";
                        pickSiteListHTML = pickSiteListHTML + "<div class='op-btns hide' consigneeid=''></div></li>";
                        $("#consignee-list").append(pickSiteListHTML);
                        //把自提显示打开，并选中自提
                        $("#selfPickArea").removeClass("hide");
                        $("#selfPickSiteName").addClass("item-selected");//这句还用不用

                        doSelectSelfPickSite();

                        //右下角的寄送至和收货人改了
                        $("#sendAddr").html("寄送至：" + $("#defaultSelfPick").find(".addr-detail").find(".addr-info").text());
                        $("#sendMobile").html("收货人：" + $("#defaultSelfPick").find(".addr-detail").find(".addr-name").text() + " " + $("#defaultSelfPick").find(".addr-detail").find(".addr-tel").text());
                    } else if (jsonO.selfPickFlag == 5) {
                        //原先没有自提，推荐一条自提给前面显示
                        //把自提显示打开
                        $("#selfPickArea").removeClass("hide");
                        $("#selfPickInfo").children('li').remove();
                        if (jsonO != null && jsonO.pickId != 0) {
                            $("#recommendAddr").removeClass("hide");
                            //把新的推荐地址显示到页面
                            var pickSiteListHTML = "";
                            pickSiteListHTML = pickSiteListHTML + "<li id='recommendAddr' pickid='";
                            pickSiteListHTML = pickSiteListHTML + jsonO.pickId;
                            pickSiteListHTML = pickSiteListHTML + "'><div class='consignee-item' onclick='openUseSelfPickConsigneeDialog()'><i class='pick-rec-icon'></i><span>";
                            pickSiteListHTML = pickSiteListHTML + "匹配自提点";
                            pickSiteListHTML = pickSiteListHTML + "</span><b></b></div><div class='addr-detail'><span class='addr-name'>";
                            pickSiteListHTML = pickSiteListHTML + jsonO.pickName;
                            pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45'>";
                            //			    	  pickSiteListHTML = pickSiteListHTML + jsonO.pickName+" "+jsonO.areaName+" ";
                            //			    	  pickSiteListHTML = pickSiteListHTML + jsonO.pickName+"   ";
                            pickSiteListHTML = pickSiteListHTML + jsonO.address;
                            pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-tel'>";
                            pickSiteListHTML = pickSiteListHTML + "";
                            pickSiteListHTML = pickSiteListHTML + "</span></div><div class='addr-ops'>";
                            pickSiteListHTML = pickSiteListHTML + "<a href='#none' class='setdefault-selfPick ftx-05 mr10' onclick='openUseSelfPickConsigneeDialog(";
                            pickSiteListHTML = pickSiteListHTML + jsonO.pickId;
                            pickSiteListHTML = pickSiteListHTML + ")'>更换自提地址</a>";
                            //	    	  pickSiteListHTML = pickSiteListHTML + "<a href='#none'>编辑</a>";
                            pickSiteListHTML = pickSiteListHTML + "</div></li>";
                            $("#selfPickInfo").append(pickSiteListHTML);
                        } else {
                            $("#recommendAddr").addClass("hide");
                        }
                    } else if (jsonO.selfPickFlag == 6) {
                        // 降级，把原有自提打开，现有的继续隐藏
                    } else if (jsonO.selfPickFlag == 7) {
                        //商品不支持自提，置灰自提，不可重新选择
                        $("#selfPickArea").removeClass("hide");
                        $("#selfPickSiteName").removeClass("consignee-item");
                        $("#selfPickSiteName").addClass("consignee-item-disable");
                        $(".noPickChoose").removeClass("hide");
                    }
                    subStrConsignee();

                    if ($("#defaultSelfPick").length == 0 && $("#recommendAddr").length == 0) {
                        $("#selfPickLine").addClass("hide");
                    } else {
                        $("#selfPickLine").removeClass("hide");
                        if (jsonO.isFirstAccess == 0) {
                            $("#firstAccessTip").removeClass("hide");
                        }
                    }

                    //没降级的情况下，下面的tab标签只保留一个
                    if (jsonO.selfPickFlag == 1 || jsonO.selfPickFlag == 2 || jsonO.selfPickFlag == 3 || jsonO.selfPickFlag == 4 || jsonO.selfPickFlag == 5) {
                        if ($("#jd_shipment_item").hasClass("curr")) {
                            $("#pick_shipment_item").addClass("hide");
                            $("#selfpick_name").addClass("hide");
                            $("#selfpick_name").next("div").addClass("hide");
                        } else if ($("#pick_shipment_item").hasClass("curr")) {
                            $("#jd_shipment_item").addClass("hide");
                            $("#_jdpay").addClass("hide");
                            $("#selfpick_name").addClass("hide");
                            $("#selfpick_name").next("div").addClass("hide");
                        } else if ($("#_jdpay").hasClass("curr")) {
                            $("#pick_shipment_item").addClass("hide");
                            $("#selfpick_name").addClass("hide");
                            $("#selfpick_name").next("div").addClass("hide");
                        }
                    }
                },
                error: function (XMLHttpResponse) {
                    return false;
                }
            });

            try {
                log('order_05', 'trade_10', 1);
            } catch (e) {
            }
        }
    }
}

function doAsyncInitOptimize() {
    if ($("#selfPickShutDownFlag").attr("value") == 1) {
        if ($("#selfPickOptimize").attr("value") == 1) {
            $("#pick_shipment_item").addClass("hide");
            var selectedAddressType = "";
            var pickName = $("#pickName");
            var pickId = "";
            var isOpenConsignee = 0;
            if ($("#isOpenConsignee").val() == 1) {
                isOpenConsignee = 1;
            }
            if (pickName.length > 0) {
                pickId = $("#pickName").attr("pickId");
                if (isEmpty(pickId)) {
                    pickId = "";
                }
            }
//			//这个根据上面的方法获得的，此时已经异步走了一趟支付配送了？
            var payId = $("#payment-list .payment-item.item-selected").attr("payid");
            if (isEmpty(payId)) {
                payId = 4;
            }
            var regionId = $("#temp_pick_sel_regionid").val();
            if (isEmpty(regionId)) {
                regionId = "-1";
            }
            showOptimazeSelfPickAddress(pickId);
        }
    }
}

function doHandleFirstAccess() {
    $("#firstAccessTip").addClass("hide");
    var param = addFlowTypeParam(param);
    var actionUrl = OrderAppConfig.AsyncDomain + "/payAndShip/doHandleFirstAccess.action";
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: actionUrl,
        data: param,
        cache: false,
        success: function (dataResult, textStatus) {
        },
        error: function (XMLHttpResponse) {
        }
    });
}


function doSelectSelfPickSite(pickId, pick_name) {
    if (!$("#selfPickSiteName").hasClass("consignee-item-disable")) {
        //判断当前选中的是否是货到付款
        var payId = $("#payment-list .payment-item.item-selected").attr("payid");
        //是货到付款的话，并且这个自提点不支持货到付款,不能选
        if (payId == 1) {
            var actionUrl = OrderAppConfig.AsyncDomain + "/payAndShip/verifySelfPick.action";
            var param = "shipParam.payId=" + payId;
            var regionId = $("#temp_pick_sel_regionid").val();
            if (isEmpty(regionId)) {
                regionId = "-1";
            }
            param = param + "&shipParam.regionId=" + regionId;
            param = addFlowTypeParam(param)
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: actionUrl,
                data: param,
                cache: false,
                success: function (dataResult, textStatus) {
                    // 没有登录跳登录
                    if (isUserNotLogin(dataResult)) {
                        goToLogin();
                        return;
                    }
                    if (dataResult == "null" || dataResult == null || dataResult == "") {
//			    	    alert("该自提点不支持货到付款");
                        $(".payment-item").each(function () {
                            var payid = $(this).attr('payid');
                            var onlinepaytype = $(this).attr('onlinepaytype');
                            if (payid == 1) {
                                $(this).removeClass("item-selected");
                                $(this).addClass("payment-item-disabled");
//				  	    		$(this).children('span').remove();
                                if ($("#codtips").length > 0) {
                                    $("#codtips").remove();
                                }
                                $(this).append("<span id='codtips' class='qmark-icon qmark-tip' data-tips='商品属性或所在地区不支持货到付款'></span>");
                                $(this).parent().removeAttr("onclick");
                                $(this).parent().removeAttr("clstag");
                            } else if (payid == 4 && onlinepaytype == 0) {
                                $(this).addClass("item-selected");
                            }
                        });
                        //去除常用地址选中标记
                        //$(".consignee-item.item-selected").removeClass("item-selected");
                        window.removeConsigneeItemSelected();

                        if ($(".consignee-item.selfPickInCommonItem").length == 0) {
                            var pickSiteListHTML = "";
                            pickSiteListHTML = pickSiteListHTML + "<li class='ui-switchable-panel ui-switchable-panel-selected selfPickInCommon' style='display:none' id='consignee_index_0'>";
                            pickSiteListHTML = pickSiteListHTML + "<div class='consignee-item selfPickInCommonItem hide' consigneeid='138180911";
                            //  	  pickSiteListHTML = pickSiteListHTML + pickId;
                            pickSiteListHTML = pickSiteListHTML + "' id='consignee_index_div_0'>";
                            pickSiteListHTML = pickSiteListHTML + "<span limit='8' title=''></span><b></b></div>";
                            pickSiteListHTML = pickSiteListHTML + "<div class='addr-detail hide'><span class='addr-name' limit='6' title=''>隐藏地址";
                            pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45' title=''></span>";
                            pickSiteListHTML = pickSiteListHTML + "<span class='addr-tel'></span></div>";
                            pickSiteListHTML = pickSiteListHTML + "<div class='op-btns hide' consigneeid=''></div></li>";
                            $("#consignee-list").append(pickSiteListHTML);
                        }
                        //选中隐藏在常用地址中的自提地址
                        $(".consignee-item.selfPickInCommonItem").addClass("item-selected");
                        //去掉推荐自提
                        $("#recommendAddr").remove();
                        //给默认自提加选中标记
                        $("#selfPickSiteName").addClass("item-selected");
                        //    切换地址
                        tab_save_Consignee(1);
                        $("#selfPickEdit").removeClass("hide");
                        $("#selfPickSiteName").removeClass("consignee-item-disable");
                        $("#selfPickSiteName").addClass("consignee-item");
//				        return;
                    }
                    if (dataResult == 1) {
                        //去除常用地址选中标记
                        //$(".consignee-item.item-selected").removeClass("item-selected");
                        window.removeConsigneeItemSelected();

                        if ($(".consignee-item.selfPickInCommonItem").length == 0) {
                            var pickSiteListHTML = "";
                            pickSiteListHTML = pickSiteListHTML + "<li class='ui-switchable-panel ui-switchable-panel-selected selfPickInCommon' style='display:none' id='consignee_index_0'>";
                            pickSiteListHTML = pickSiteListHTML + "<div class='consignee-item selfPickInCommonItem hide' consigneeid='138180911";
                            //  	  pickSiteListHTML = pickSiteListHTML + pickId;
                            pickSiteListHTML = pickSiteListHTML + "' id='consignee_index_div_0'>";
                            pickSiteListHTML = pickSiteListHTML + "<span limit='8' title=''></span><b></b></div>";
                            pickSiteListHTML = pickSiteListHTML + "<div class='addr-detail hide'><span class='addr-name' limit='6' title=''>隐藏地址";
                            pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45' title=''></span>";
                            pickSiteListHTML = pickSiteListHTML + "<span class='addr-tel'></span></div>";
                            pickSiteListHTML = pickSiteListHTML + "<div class='op-btns hide' consigneeid=''></div></li>";
                            $("#consignee-list").append(pickSiteListHTML);
                        }
                        //选中隐藏在常用地址中的自提地址
                        $(".consignee-item.selfPickInCommonItem").addClass("item-selected");
                        //去掉推荐自提
                        $("#recommendAddr").remove();
                        //给默认自提加选中标记
                        $("#selfPickSiteName").addClass("item-selected");
                        //    切换地址
                        tab_save_Consignee(1);
                        $("#selfPickEdit").removeClass("hide");
                        $("#selfPickSiteName").removeClass("consignee-item-disable");
                        $("#selfPickSiteName").addClass("consignee-item");
                    }
                },
                error: function (XMLHttpResponse) {
                    return false;
                }
            });
        } else {
            //去除常用地址选中标记
            //$(".consignee-item.item-selected").removeClass("item-selected");
            window.removeConsigneeItemSelected();

            if ($(".consignee-item.selfPickInCommonItem").length == 0) {
                var pickSiteListHTML = "";
                pickSiteListHTML = pickSiteListHTML + "<li class='ui-switchable-panel ui-switchable-panel-selected selfPickInCommon' style='display:none' id='consignee_index_0'>";
                pickSiteListHTML = pickSiteListHTML + "<div class='consignee-item selfPickInCommonItem hide' consigneeid='138180911";
                //  	  pickSiteListHTML = pickSiteListHTML + pickId;
                pickSiteListHTML = pickSiteListHTML + "' id='consignee_index_div_0'>";
                pickSiteListHTML = pickSiteListHTML + "<span limit='8' title=''></span><b></b></div>";
                pickSiteListHTML = pickSiteListHTML + "<div class='addr-detail hide'><span class='addr-name' limit='6' title=''>隐藏地址";
                pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45' title=''></span>";
                pickSiteListHTML = pickSiteListHTML + "<span class='addr-tel'></span></div>";
                pickSiteListHTML = pickSiteListHTML + "<div class='op-btns hide' consigneeid=''></div></li>";
                $("#consignee-list").append(pickSiteListHTML);
            }
            //选中隐藏在常用地址中的自提地址
            $(".consignee-item.selfPickInCommonItem").addClass("item-selected");
            //去掉推荐自提
            $("#recommendAddr").remove();
            //给默认自提加选中标记
            $("#selfPickSiteName").addClass("item-selected");
            //    切换地址

            tab_save_Consignee(1);
            $("#selfPickEdit").removeClass("hide");
            $("#selfPickSiteName").removeClass("consignee-item-disable");
            $("#selfPickSiteName").addClass("consignee-item");
        }
    }
}

function doSelectSelfPickSiteOptimize(consignee_pickId, type, isCod) {
    var provinceId = $("#consignee-list .item-selected").attr("provinceId");
    var cityId = $("#consignee-list .item-selected").attr("cityId");
    var countyId = $("#consignee-list .item-selected").attr("countyId");
    var townId = $("#consignee-list .item-selected").attr("townId");
    $("#specialprid").val(provinceId);
    $("#specialctid").val(cityId);
    $("#specialctyid").val(countyId);
    $("#specialtyid").val(townId);
    if (isCod == 0) {
        $(".payment-item").each(function () {
            var payid = $(this).attr('payid');
            var onlinepaytype = $(this).attr('onlinepaytype');
            if (payid == 1) {
                $(this).removeClass("item-selected");
                $(this).addClass("payment-item-disabled");
                //$(this).children('span').remove();
                if ($("#codtips").length > 0) {
                    $("#codtips").remove();
                }
                $(this).append("<span id='codtips' class='qmark-icon qmark-tip' data-tips='商品属性或所在地区不支持货到付款'></span>");
                $(this).parent().removeAttr("onclick");
                $(this).parent().removeAttr("clstag");
            } else if (payid == 4 && onlinepaytype == 0) {
                $(this).addClass("item-selected");
            }
        });
    }
    var consignee_pickName = $("#nearestInfo").text();
    var showMobile = $("#nearestMobile").text();
    var showName = $("#nearestName").text();
    if (type == 1) {
        consignee_pickName = $("#usedInfo").text();
        showMobile = $("#usedMobile").text();
        showName = $("#usedName").text();
    }
    $("#defaultSelfPick").remove();
    var pickSiteListHTML = "";
    pickSiteListHTML = pickSiteListHTML + "<li id='defaultSelfPick' defaultSelfPick='1'><div id='selfPickSiteName' class='consignee-item item-selected' limit='8' clstag='pageclick|keycount|trade_201602181|40'";
    pickSiteListHTML = pickSiteListHTML + "onclick=doSelectSelfPickSite('";
    pickSiteListHTML = pickSiteListHTML + consignee_pickId;
    pickSiteListHTML = pickSiteListHTML + "','";
    pickSiteListHTML = pickSiteListHTML + consignee_pickName;
    pickSiteListHTML = pickSiteListHTML + "')><span id='pickName' pickId='";
    pickSiteListHTML = pickSiteListHTML + consignee_pickId;
    pickSiteListHTML = pickSiteListHTML + "'>";
    pickSiteListHTML = pickSiteListHTML + "京东自提点";
    pickSiteListHTML = pickSiteListHTML + "</span><b></b></div><div class='addr-detail'><span class='addr-name' limit='6'>";
    pickSiteListHTML = pickSiteListHTML + showName;
    pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45'>";
    pickSiteListHTML = pickSiteListHTML + consignee_pickName;
    pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-tel'>";
    pickSiteListHTML = pickSiteListHTML + showMobile;
    pickSiteListHTML = pickSiteListHTML + "</span></div><div class='addr-ops'>";
    pickSiteListHTML = pickSiteListHTML + "<a href='#none' onclick='openEditSelfPickConsigneeDialog()' class='ftx-05 mr10 edit-selfconsignee' fid='";
    pickSiteListHTML = pickSiteListHTML + consignee_pickId;
    pickSiteListHTML = pickSiteListHTML + "'>更换自提地址</a>";
    pickSiteListHTML = pickSiteListHTML + "</div></li>";
    $("#selfPickInfo").append(pickSiteListHTML);
    subStrConsignee();
    //将自提点的值改了
    var pickId = consignee_pickId;
    var regionId = $("#pick_sel_regionid").val();//这里的regionId要不要改？？？？
    var pick_name = consignee_pickName;
    if (pick_name == "null" || pick_name == null || pick_name == "undefined" || pick_name == undefined) {
        pick_name = "";
    }
    var showPickSite = "<span class='ftx-03'>自提地点：</span>" + pick_name;
    //如果没有选中自提点，不与保存
//	    if (isEmpty(pickId)) {
//	      return;
//	    }
    $("#beforePickRegionId").val(regionId);
    $("#beforePickSelRegionid").val(regionId);
    $("#beforePickSiteId").val(pickId);
    $("#beforePickName").val(pick_name);

    $("#pick_sel_regionid").val(regionId);
    $("#pick_sel_id").val(pickId);
    $("#is_invoke_pickdate").val("1");

    $("#selfpick_name").html(showPickSite);
    $("#saveParam_pickSiteId").val(pickId);
    $("#saveParam_pickRegionId").val(regionId);
    $("#saveParam_pickShipmentType").val(64);
    $("#saveParam_jdShipmentType").val("");
    $("#saveParam_otherShipmentType").val("");
    //end

    //1、改样式，改推荐自提为选中状态
    $(".consignee-item.item-selected").removeClass("item-selected");
    $(".optimize").removeClass("item-selected");
    if ($(".consignee-item.selfPickInCommonItem").length == 0) {
        var pickSiteListHTML = "";
        pickSiteListHTML = pickSiteListHTML + "<li class='ui-switchable-panel ui-switchable-panel-selected selfPickInCommon' style='display:none' id='consignee_index_0'>";
        pickSiteListHTML = pickSiteListHTML + "<div class='consignee-item selfPickInCommonItem hide' consigneeid='138180911";
        pickSiteListHTML = pickSiteListHTML + "' id='consignee_index_div_0'>";
        pickSiteListHTML = pickSiteListHTML + "<span limit='8' title=''></span><b></b></div>";
        pickSiteListHTML = pickSiteListHTML + "<div class='addr-detail hide'><span class='addr-name' limit='6' title=''>隐藏地址";
        pickSiteListHTML = pickSiteListHTML + "</span><span class='addr-info' limit='45' title=''></span>";
        pickSiteListHTML = pickSiteListHTML + "<span class='addr-tel'></span></div>";
        pickSiteListHTML = pickSiteListHTML + "<div class='op-btns hide' consigneeid=''></div></li>";
        $("#consignee-list").append(pickSiteListHTML);
    }
    $(".consignee-item.selfPickInCommonItem").addClass("item-selected");
    $("#recommendAddr").remove();
    if ($("#defaultSelfPick").length == 0) {
        var defaultSelfPick = "<li id='defaultSelfPick' class='hide' defaultSelfPick='1'><div id='selfPickSiteName' class='consignee-item' clstag='pageclick|keycount|trade_201602181|40'><span id='pickName'>京东自提点</span><b></b></div></li>";
        $("#selfPickInfo").append(defaultSelfPick);
    }
    $("#selfPickInfo").addClass("hide");
    $("#selfPickLine").addClass("hide");
    $("#selfPickSiteName").addClass("item-selected");
    if (type == 1) {
        $("#usedDiv").addClass("item-selected");
    } else if (type == 2) {
        $("#nearestDiv").addClass("item-selected");
    }
    $("#selfPickArea").removeClass("hide");
    //tab_save
    tab_save_Consignee(1, type);
}

function doHandleSelfPick(type) {
    if ($("#selfPickShutDownFlag").attr("value") == 1) {
        //选中非自提方式
        if (!$(".consignee-item.selfPickInCommonItem").hasClass("item-selected")) {
            if ($("#jd_shipment_item").length > 0 && $("#pick_shipment_item").hasClass("curr")) {
                if ($("#jd_shipment_item").attr("onclick").indexOf('pay') != -1) {
                    doSwithTab('pay');
                } else if ($("#jd_shipment_item").attr("onclick").indexOf('jd_other') != -1) {
                    doSwithTab('jd_other');
                }
            } else if ($("#_jdpay").length > 0 && $("#pick_shipment_item").hasClass("curr")) {
                if ($("#_jdpay").attr("onclick").indexOf('pay') != -1) {
                    doSwithTab('pay');
                } else if ($("#_jdpay").attr("onclick").indexOf('jd_other') != -1) {
                    doSwithTab('jd_other');
                }
            }
        }
        if ($(".consignee-item.selfPickInCommonItem").hasClass("item-selected")) {

            var venderList = jQuery.parseJSON($("#promiseSopViewList").val());
            //选中常用自提
            if ($("#pick_shipment_item").length > 0 && $("#pick_shipment_item").attr("onclick").indexOf('picksite_other') != -1) {
                //				doSwithTab('picksite_other');
                //京东第三方自提
                if ($("#pick_shipment_item").hasClass("disabled") == false) {
                    $("#pick_shipment_item").addClass("curr");
                    $("#pick_shipment_item").removeClass("hide");
                    $("#jd_shipment_item").addClass("hide");
                    $("#_jdpay").addClass("hide");
                    $("#selfpick_name").addClass("hide");
                    $("#selfpick_name").next("div").addClass("hide");
                    $("#_jdpay").removeClass("curr");
                    $("#selfpick_shipment").addClass("ui-switchable-panel-selected");
                    $("#selfpick_shipment").removeClass("hide");
                    //点击自提table标签保存默认自提点
                    //模拟选中当前自提点start
                    var pickId = $("#pickName").attr("pickid");
                    var pick_name = $("#pickName").text();
                    var pickDate = $('#beforePickDate').val();
                    var pickSiteNum = $('#beforePickSiteNum').val();
                    var sel_regionid = $('#beforePickSelRegionid').val();
                    var regionId = $("#pick_sel_regionid").val();
                    if (pick_name == "null" || pick_name == null || pick_name == "undefined" || pick_name == undefined) {
                        pick_name = "";
                    }
                    var showPickSite = "<span class='ftx-03'>自提地点：</span>" + pick_name;
                    $("#beforePickRegionId").val(regionId);
                    $("#beforePickSelRegionid").val(regionId);
                    $("#beforePickSiteId").val(pickId);
                    $("#beforePickName").val(pick_name);
                    $("#pick_sel_regionid").val(regionId);
                    $("#pick_sel_id").val(pickId);
                    $("#is_invoke_pickdate").val("1");

                    $("#selfpick_name").html(showPickSite);
                    $("#saveParam_pickSiteId").val(pickId);
                    $("#saveParam_pickRegionId").val(regionId);
                    $("#saveParam_pickShipmentType").val(64);
                    $("#saveParam_jdShipmentType").val("");
                    $("#saveParam_otherShipmentType").val("");
                    $('#saveParam_pickDate').val(pickDate);
                    $('#saveParam_pickSiteNum').val(pickSiteNum);
                    $('#pick_sel_regionid').val(sel_regionid);
                    submitShipment(1);
                }
            } else if (($("#pick_shipment_item").length > 0 && $("#pick_shipment_item").attr("onclick").indexOf('picksite') != -1) || (venderList != null && venderList.length > 0)) {
                //京东自提
                if ($("#pick_shipment_item").hasClass("disabled") == false) {
                    $("#pick_shipment_item").addClass("curr");
                    $("#jd_shipment_item").removeClass("curr");
                    //自提前置，把下面的自提隐藏掉
                    if ($("#selfPickShutDownFlag").attr("value") == 1) {
                        $("#pick_shipment_item").removeClass("hide");
                        $("#jd_shipment_item").addClass("hide");
                        $("#_jdpay").addClass("hide");
                        $("#selfpick_name").addClass("hide");
                        $("#selfpick_name").next("div").addClass("hide");
                    }
                    $("#jd_shipment").addClass("hide");
                    $("#selfpick_shipment").addClass("ui-switchable-panel-selected");
                    $("#selfpick_shipment").removeClass("hide");
                    //点击自提table标签保存默认自提点
                    //模拟选中当前自提点start
                    var pickId = $("#pickName").attr("pickid");
                    var pick_name = $("#pickName").text();
                    var pickDate = $('#beforePickDate').val();
                    var pickSiteNum = $('#beforePickSiteNum').val();
                    var sel_regionid = $('#beforePickSelRegionid').val();
                    var regionId = $("#pick_sel_regionid").val();
                    if (pick_name == "null" || pick_name == null || pick_name == "undefined" || pick_name == undefined) {
                        pick_name = "";
                    }
                    var showPickSite = "<span class='ftx-03'>自提地点：</span>" + pick_name;
                    $("#beforePickRegionId").val(regionId);
                    $("#beforePickSelRegionid").val(regionId);
                    $("#beforePickSiteId").val(pickId);
                    $("#beforePickName").val(pick_name);
                    $("#pick_sel_regionid").val(regionId);
                    $("#pick_sel_id").val(pickId);
                    $("#is_invoke_pickdate").val("1");

                    $("#selfpick_name").html(showPickSite);
                    $("#saveParam_pickSiteId").val(pickId);
                    $("#saveParam_pickRegionId").val(regionId);
                    $("#saveParam_pickShipmentType").val(64);
                    $("#saveParam_jdShipmentType").val("");
                    $("#saveParam_otherShipmentType").val("");
                    $('#saveParam_pickDate').val(pickDate);
                    $('#saveParam_pickSiteNum').val(pickSiteNum);
                    $('#pick_sel_regionid').val(sel_regionid);
                    submitShipment(1);
                }
            }

        }
        if ($("#jd_shipment_item").hasClass("curr")) {
            $("#pick_shipment_item").addClass("hide");
            $("#selfpick_name").addClass("hide");
            $("#selfpick_name").next("div").addClass("hide");
        } else if ($("#pick_shipment_item").hasClass("curr")) {
            $("#jd_shipment_item").addClass("hide");
            $("#selfpick_name").addClass("hide");
            $("#selfpick_name").next("div").addClass("hide");
        } else if ($("#_jdpay").hasClass("curr")) {
            $("#pick_shipment_item").addClass("hide");
            $("#selfpick_name").addClass("hide");
            $("#selfpick_name").next("div").addClass("hide");
        }
    }
}

//POPCarEXTService
function createPopService(addedServices) {
    var itemObjs = $('.goods-list .goods-items .goods-item');
    for (var k = 0; k < addedServices.length; k++) {
        itemObjs.each(function (j, item) {
            if (addedServices[k].skuId == item.getAttribute('goods-id') && $(item).parent().find('.suit-total').length === 0 && $(item).find(".gift-item") && null == item.getAttribute('gift-tag')) {
                if ($(item).find('.extra-item').length < 2) {
                    var serviceStatusDiv = '';
                    if (null != addedServices[k].serviceItemPrice && null != addedServices[k].serviceItemNum) {
                        serviceStatusDiv = '<span class="ml5"><strong style="color: #e4393c;font-family: verdana;">¥' + addedServices[k].serviceItemPrice + '</strong>&nbsp x' + addedServices[k].serviceItemNum + '</span>';
                    }
                    var locShopName = addedServices[k].locShopName === null ? '门店已失效，请到商详页重新选择其他门店' : addedServices[k].locShopName;
                    var serviceName = addedServices[k].serviceItemName === null ? '您选购的服务已下架' : addedServices[k].serviceItemName;
                    $(item).append('<div class="clr"></div><div class="extra-item ml-5 ftx-03"><span>【服务门店】' + locShopName + '</span> </div><div class="extra-item ml-5 ftx-03"><span>【服务】' + serviceName + serviceStatusDiv + '</span></div>')
                }
            }
        })
    }
}
