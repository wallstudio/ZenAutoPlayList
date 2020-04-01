// ==UserScript==
// @name         ZenAutoPlayList
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.nicovideo.jp/my/top
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let box = document.createElement("div");
    box.style.display = "box";
    box.style.position = "fixed";
    box.style.bottom = 0;
    document.body.appendChild(box);

    let g_saveEntry = null;

    let getPlayList = function()
    {
        let allPost = Array.from(document.getElementsByClassName("NicorepoTimelineItem"));
        let enable = allPost.filter(e => getComputedStyle(e, null).display != "none");
        let videos = enable.filter(e =>e.getAttribute("data-topic") == "nicovideo.user.video.upload");

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
        let entry = document.createElement("a");
        entry.style.margin = "5px";
        entry.innerText = `Save(${jsonContainer.items.length})`;
        entry.href = 'data:application/json,' + encodeURIComponent(`${json}`);
        entry.download = `${jsonContainer.items[0].title}-${jsonContainer.items[jsonContainer.items.length - 1].title}.playlist.json`;
        box.appendChild(entry);

        if(g_saveEntry != null)
        {
            g_saveEntry.parentNode.removeChild(g_saveEntry);
        }
        g_saveEntry = entry;
        console.log(json);
    }

    let entry = document.createElement("a");
    entry.style.margin = "5px";
    entry.innerText = "ZenAutoPlayList";
    entry.addEventListener("click", getPlayList);
    box.appendChild(entry);
})();
