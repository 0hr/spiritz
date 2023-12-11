import axios from "axios";

export default class TiktokService {
    getHeaders() {
        const headers = new Headers();
        headers.append('User-Agent', 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet');

        return headers;
    }

    getIdFromUrl(url) {
        const matching = url.includes("/video/");
        if (!matching) {
            throw new Error("Video url wasn't matched");
        }
        const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
        return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
    }

    async getRealUrl(url) {
        const response = await axios.get(url);
        return response.request.res.responseUrl;
    }

    async getUrl(url) {
        const headers = this.getHeaders();
        const redirectedUrl = await this.getRealUrl(url);
        const idVideo = this.getIdFromUrl(redirectedUrl);
        const API_URL = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;
        const request = await fetch(API_URL, {
            method: "GET",
            headers: headers
        });
        const body = await request.text();
        const res = JSON.parse(body);
        const description =  res.aweme_list[0].desc;
        const nickname =  res.aweme_list[0].author.nickname;
        const videoUrl = res.aweme_list[0].video.play_addr.url_list[0]
        return {
            redirectedUrl: redirectedUrl,
            url: videoUrl,
            nickname: nickname,
            description: description,
            id: idVideo
        }
    }
}