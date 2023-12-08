let baseUrl = "";
if (process.env.NODE_ENV === 'development') {
	// 开发环境
	baseUrl = 'http://app.yo-shequan.com'
	// #ifdef H5
	// baseUrl = "/appapi"
	// #endif
} else if (process.env.NODE_ENV === 'production') {
	// 生产环境
	baseUrl = 'http://app.yo-shequan.com'
	// #ifdef H5
	// baseUrl = "/api"
	// #endif
}
const courtConfig = {
    publicAppId:'',//公众号appId
	baseUrl: baseUrl,//域名
    mapData:{
        key:'',//地图key
        sk:'',
    },
    share: {
    	title: '基于uview2.0快速开发框架',    //分享标题
    	desc: "基于uview2.0快速开发框架详情",  //分享详情
    	link: "", // 分享链接
    	imgUrl: "", // 分享图
    }
};
export default Object.assign({}, courtConfig);
