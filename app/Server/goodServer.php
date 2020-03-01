<?php


namespace App\Server;


use Illuminate\Support\Carbon;
use Sunra\PhpSimple\HtmlDomParser;
use function simplehtmldom_1_5\str_get_html;

class goodServer
{

    protected $httpServe = null;

    public function __construct()
    {
        $this->httpServe = new httpServer();
    }

    public function checkReservation($id)
    {
        $url = 'https://yushou.jd.com/youshouinfo.action?callback=jQueryCallback&sku=' . $id . '&_=' . $this->msectime();
        $ret = $this->httpServe->get($url);
        if (!!empty($ret['data']['error']) && $ret['data']['error'] == 'pss info is null') {

        } else if (!empty($ret['data']['yueStime'])) {
            return $this->checkReservationTime($ret['data']);
        }
    }

    public function msectime()
    {
        $times = explode(' ', microtime());
        $msectime = (float)sprintf('%.0f', (floatval($times[0]) + floatval($times[1])) * 1000);
        return $msectime;
    }

    private function checkReservationTime($info)
    {
        $nowDateTime = Carbon::now()->toDateTimeString();
        if (!empty($info)) {
            if ($info['yueStime'] > $nowDateTime) {
                return ['code' => 101, 'msg' => '等待预约', 'data' => $info];
            }
            if ($info['yueStime'] <= $nowDateTime && $info['yueEtime'] > $nowDateTime) {
                return ['code' => 100, 'msg' => '预约中', 'data' => $info];
            }
            if ($info['yueEtime'] < $nowDateTime) {
                if ($info['qiangStime'] > $nowDateTime) {
                    return ['code' => 301, 'msg' => '等待抢购', 'data' => $info];
                }
                if ($info['qiangStime'] <= $nowDateTime && $info['qiangEtime'] > $nowDateTime) {
                    return ['code' => 300, 'msg' => '抢购中', 'data' => $info];
                }
                if ($info['qiangEtime'] < $nowDateTime) {
                    return ['code' => 302, 'msg' => '抢购结束', 'data' => $info];
                }
            }
        }
        return ['code' => 200, 'data' => $info];

    }

    public function qiangGou($id)
    {
        $text = '';
        $code = 0;
        $ret = $this->checkReservation($id);
        if ($ret['code'] == 100) {
            $url = $ret['data']['url'];
            $text = $this->yuyue($url);
            $code = 100;
        } else if ($ret['code'] == 300) {
            $url = $ret['data']['url'];
            $text = $this->order($url);
            $code = 300;
        }
        return ['code' => $code, 'msg' => $text];
    }

    public function yuyue($url)
    {
        $ret = $this->httpServe->get($url);
        return $this->analyzeHtml($ret['data']);
    }

    public function order($url)
    {
        $ret = $this->httpServe->get($url);
        return $this->analyzeOrderHtml($ret['data']);
    }

    private function analyzeHtml($text)
    {
        $html = HtmlDomParser::str_get_html($text);
        $ret = $html->find('.bd-right-result', 0);
        return $ret->innertext();
    }

    private function analyzeOrderHtml($text)
    {
        $html = HtmlDomParser::str_get_html($text);
        $ret = $html->find('.ftx-02', 0);
        return $ret->innertext();
    }

    public function getOrderInfo()
    {
        $url = 'https://trade.jd.com/shopping/order/getOrderInfo.action?rid=' . $this->msectime();
        $ret = $this->httpServe->get($url);
        return $ret;
    }

    public function cancelAllItem()
    {
        $header = [
            'Accept' => 'application/json, text/javascript, */*;',
            'Origin' => 'https://cart.jd.com',
            'referer' => 'https://cart.jd.com/cart.action?r=0.9190602998343163',
        ];
        $data = [
            't' => 0,
            'outSkus' => '',
            'random' => 0.9190602998343163,
            'locationId' => $this->getLocationId(),
        ];
        $ret = $this->httpServe->post('https://cart.jd.com/cancelAllItem.action', $data, $header);
        if (!empty($ret['data'])) {
            return true;
        }
        return false;
    }

    public function getConsigneeList()
    {
        $url = 'https://trade.jd.com/shopping/dynamic/consignee/getConsigneeList.action?charset=UTF-8&callback=jQueryCallback&_=' . $this->msectime();
        $ret = $this->httpServe->get($url, ['referer' => 'https://cart.jd.com/cart.action?r=0.9190602998343163']);
        return $ret['data'];
    }

    public function orderAction()
    {
        $html = $this->getOrderInfo();
        $ret = $this->analyzeOrderActionHtml($html['data']);
        if ($ret['code'] == 200) {
            $this->submitOrder($ret);
            echo '提交订单成功';
        } else {
            echo $ret['msg'];
        }
    }

    public function getLocationId()
    {
        $data = $this->getConsigneeList();
        $id = '';
        if (!empty($data)) {
            $id = $data[0]['provinceId'] . '-' . $data[0]['cityId'] . '-' . $data[0]['countyId'] . '-' . $data[0]['townId'];
        }
        return $id;
    }

    public function analyzeOrderActionHtml($text)
    {
        $html = HtmlDomParser::str_get_html($text);
        $refresh = $html->find('#refresh', 0);
        $refresh = $refresh->find('.mb', 0);
        $msg = $refresh->innertext();
        if ($msg) {
            return ['code' => 404, 'data' => '', 'msg' => $msg];
        }
        $overseaPurchaseCookies = $html->find('#overseaPurchaseCookies', 0);
        $overseaPurchaseCookiesVal = $overseaPurchaseCookies->getAttribute('value');
        $sopNotPutInvoice = $html->find('#sopNotPutInvoice', 0);
        $sopNotPutInvoiceVal = $sopNotPutInvoice->getAttribute('value');
        $ignorePriceChange = $html->find('#ignorePriceChange', 0);
        $ignorePriceChangeVal = $ignorePriceChange->getAttribute('value');
        $data = [
            'overseaPurchaseCookies' => $overseaPurchaseCookiesVal,
            'vendorRemarks' => [],
            'submitOrderParam.sopNotPutInvoice' => $sopNotPutInvoiceVal ?? false,
            'submitOrderParam.trackID' => 'TestTrackId',
            'submitOrderParam.ignorePriceChange' => $ignorePriceChangeVal,
            'submitOrderParam.btSupport' => 0,
            'submitOrderParam.eid' => 'QOYNBYX6GPAIXNDND36C6VATHCPYGCWPZTEDYKCRG5OS547XHJ3ANAEYL3ENOR7UXAD4RSJFPTKBF5HEVIG7X67AT',
            'submitOrderParam.fp' => '886383f37a1ca76589c8399bace2db90',
            'riskControl' => 'D0E404CB705B97328D0307C85B6551CB48AE81060B0D9D6C6F884D3A540FCAAE',
            'submitOrderParam.jxj' => 1,
            'submitOrderParam.trackId' => $this->httpServe->getStorageCookieByKey('TrackID'),
        ];
        return ['code' => 200, 'data' => $data];
    }

    public function submitOrder($data)
    {
        $url = 'https://trade.jd.com/shopping/order/submitOrder.action';
        $header = [
            'referer' => 'https://trade.jd.com/shopping/order/getOrderInfo.action?rid=1582971694272'
        ];
        $this->httpServe->post($url, $data, $header);
    }

    public function addOrder($id)
    {
        $ret = $this->cancelAllItem();
        if ($ret) {
            $ret = $this->qiangGou($id);
            if ($ret['code'] == 300) {
                $this->orderAction();
            } else if ($ret['code'] == 100) {

            } else {
                $this->addToCart($id);
            }
        }
    }

    public function addToCart($id)
    {
        $url = 'https://cart.jd.com/gate.action?pid=' . $id . '&pcount=1&ptype=1';
        $ret = $this->httpServe->get($url);
        if (!empty($ret['data'])) {
            echo '加入购物车成功';
            return;
        }
        echo '加入购物车失败';
    }

    public function test()
    {
        $url = 'https://wq.jd.com/bases/yuyue/item?callback=subscribeItemCBA&dataType=1&skuId=100007346854&sceneval=2';
        $ret = $this->httpServe->get($url);
        print_r($ret);
    }

    public function buy()
    {
        $header = [
            'Accept' => '*/*',
            'Cache-Control' => 'no-cache',
            'User-Agent' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 MicroMessenger/7.0.4.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat',
            'Referer' => 'https://servicewechat.com/wxb455dc8601ea1ac2/22/page-frame.html',
            'Host' => 'mina2.hbbyun.com',
            'Connection' => 'keep-alive',
            'Accept-Encoding' => 'gzip, deflate, br',
            'content-type' => 'application/x-www-form-urlencoded',
        ];
        $url = 'https://mina2.hbbyun.com/HBBAPI/GetData';
        $data = [
            'HBBWSType' => 7,
            'IsRSA' => 0,
            'strAuthorizationCode' => 'hbb',
            'strJsonData' => '{"tableData":[{"EntID":"881350672161","UserID":"888420198324","AppID":"@AppID","Secret":"@Secret","BSN":"@BSN","UserName":"采芝林电商","UserCode":"13611468273","DtbCYTypeID":"2","VipID":"VIP350672161374619659","VipName":"不愿透露姓名的靓仔","ShopID":"889089848428","ShopName":"采芝林中药智能代煎商城","BaseID":"005058867","BaseCode":"1","BaseName":"采芝林药业有限公司","DepID":"613468883","DepName":"广州采芝林药业连锁店","SalesManID":"888420198324","SalesManCode":"13611468273","SalesManName":"采芝林电商","CustCountry":"","CustProvince":"广东省","CustCity":"广州市","CustDistrict":"天河区","CustMainAddress":"上社口岗大街4巷16号","CustZip":"","CustPhone":"18825071654","CustName":"卢文钊","Remark":"","Count":1,"Qua":1,"SalesAmo":86,"Amo":86,"DisAmo":0,"FeeAmo":0,"CouponAmo":0,"TotalAmo":86,"LocalSheetID":"20200301211144821701259","FollowUserID":"888420198324","SheetFile":"","AppName":"HBB_MinaMall","PosType":"3"}],"Item1":[{"GoodsID":"886445463604","GoodsCode":"015","GoodsCoverImg":"881350672161/638182303/1582507971000_491889197.jpg","GoodsName":"【保为康】KN95口罩 10个/包","GoodsTypeID":"0","IsInventory":"1","Unit":"包","PUnit":"","SkuID":"887445463604","SkuCode":"","SkuItems":"","PSalesPrice":86,"SalesPrice":86,"PUnitPrice":86,"Price":86,"SalesAmo":86,"Amo":86,"DisAmo":0,"CostPrice":0,"Qua":1,"PQua":0,"MQua":1,"Ref":1,"ItemID":1,"SalType":"2","PromotePlanSheetID":"726755620"}]}',
            'strKeyName' => 'PosSalSheet_PosSalSheetSubmit_V9_Add'
        ];
        $ret = $this->httpServe->post($url, $data, $header);
        return $ret['data'];
    }

    public function checkTime()
    {
        $header = [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 MicroMessenger/7.0.4.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat',
            'Referer' => 'https://servicewechat.com/wxb455dc8601ea1ac2/22/page-frame.html',
            'Host' => 'hbbapi.hbbyun.com',
            'Connection' => 'keep-alive',
            'Accept-Encoding' => 'gzip, deflate, br',
            'content-type' => 'application/x-www-form-urlencoded',
        ];
        $url = 'https://hbbapi.hbbyun.com/CurrDateTime';
        $ret = $this->httpServe->post($url, [], $header);
        if (!empty($ret['data'])) {
            $result = json_decode($ret['data'], true);
            if (!empty($result) && $result['code'] == 0 && $result['errmsg'] == 'succ') {
                return $result['data'];
            }
        }
        return 0;
    }

    public function getBuy()
    {
        while (true) {
            echo $this->buy();
            echo '<br/>';
            sleep(1);
        }
    }

}
