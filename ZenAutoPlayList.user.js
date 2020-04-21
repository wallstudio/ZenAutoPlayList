// ==UserScript==
// @name         ZenAutoPlayList
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  https://github.com/wallstudio/ZenAutoPlayList/blob/master/ZenAutoPlayList.user.js
// @author       You
// @match        https://www.nicovideo.jp/*
// @grant        none
// @require      https://raw.githubusercontent.com/wallstudio/XhrFetchInjection/master/xhrFetchInjection.user.js
// ==/UserScript==


(function() {
    'use strict';


    let getPlayList = function(videos)
    {
        let jsonContainer = new Object();
        jsonContainer.items = [];
        for(let i = 0; i < videos.length; i++)
        {
            try
            {
                let item = new Object();
                item.active = true;
                item.played = false;
                item.title = videos[i].getElementsByClassName("log-target-info")[0].getElementsByTagName("a")[0].innerText;
                item.url = videos[i].getElementsByClassName("log-target-thumbnail")[0].getElementsByTagName("a")[0].href;
                item.id = item.url.match(/sm[0-9]+/)[0];
                item.thumbnail_url = videos[i].getElementsByClassName("log-target-thumbnail")[0].getElementsByTagName("img")[0].src;
                item.length_seconds = 0;
                item.num_res = 0;
                item.mylist_counter = 0;
                item.view_counter = 0;
                item.first_retrieve = "2020/01/01";
                jsonContainer.items[i] = item;
            }
            catch(e){ }
        }
        jsonContainer.items = jsonContainer.items.reverse();
        if(jsonContainer.items.length < 1)
        {
            return;
        }

        let json = JSON.stringify(jsonContainer);
        let href = 'data:application/json,' + encodeURIComponent(`${json}`);
        let download = `${jsonContainer.items[0].title}-${jsonContainer.items[jsonContainer.items.length - 1].title}.playlist.json`;
        return { href : href, download : download};
    }

    let doneList = [];
    injectFetch((url, args, callback) =>
    {
        let ret = callback(args);

        try
        {
            let allPost = Array.from(document.getElementsByClassName("NicorepoTimelineItem"));
            let enable = allPost.filter(e => getComputedStyle(e, null).display != "none");
            let videos = enable.filter(e =>e.getAttribute("data-topic") == "nicovideo.user.video.upload");
            for(let i = 1; i < videos.length; i++)
            {
                let last = videos[i - 1];
                if(doneList.includes(last))
                {
                    continue;
                }

                doneList.push(last);
                let partVideos = videos.slice(0, i);
                let playListData = getPlayList(partVideos);
                console.log(`${partVideos.length} ${playListData.download}`);

                let button = document.createElement("a");
                button.innerText = `  PlayList(${partVideos.length})`;
                button.href = playListData.href;
                button.download = playListData.download;
                let footer = last.getElementsByClassName("log-footer-inner")[0];
                footer.insertBefore(button, footer.childNodes[0]);
            }
        }
        catch(e)
        {
            console.error(e);
        }

        return ret;
    });

})();
