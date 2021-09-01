// ==UserScript==
// @name         ZenAutoPlayList
// @namespace    https://github.com/wallstudio/ZenAutoPlayList
// @version      0.2
// @description  https://github.com/wallstudio/ZenAutoPlayList/blob/master/ZenAutoPlayList.user.js
// @author       うぷはし
// @match        https://www.nicovideo.jp/my*
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    window.DebugForZenAutoPlayList = false;
    function log(arg)
    {
        if(!window.DebugForZenAutoPlayList) return;
        log(arg)
    }

    async function fetchFromExternal(id)
    {
        const url = 'https://www.nicovideo.jp/watch/' + id;
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok)
            throw `${id} Bad Response ${res.status} ${res.statusText}`;

        const dom = new DOMParser().parseFromString(await res.text(), 'text/html');
        log(dom);
        const dataContainerElem = dom.getElementById('js-initial-watch-data');
        if (!dataContainerElem)
            throw `${id} Not exist dataContainerElem`;

        const dataJson = dataContainerElem.getAttribute('data-api-data');
        const data = JSON.parse(dataJson);
        log(data);
        const videoInfo = {
            active: true,
            played: false,
            title: data.video.title,
            url: url,
            id: data.video.id,
            thumbnail_url: data.video.largeThumbnailURL,
            length_seconds: data.video.duration,
            num_res: data.thread.commentCount,
            mylist_counter: data.video.mylistCount,
            view_counter: data.video.viewCount,
            first_retrieve: data.video.postedDateTime,
        };
        await new Promise(r => setTimeout(r, 1000));
        return videoInfo;
    }

    async function fetchFromInternal(id)
    {
        const contianers = Array.from(document.getElementsByClassName('NicorepoItem-content'));
        const container = contianers.find(e => e.href.match(id));
        log(container)

        const videoInfo = {
            active: true,
            played: false,
            title: container.getElementsByClassName('NicorepoItem-contentDetailTitle')[0].innerHTML,
            url: 'https://www.nicovideo.jp/watch/' + id,
            id: id,
            thumbnail_url: container.getElementsByClassName('Thumbnail-image')[0].style.backgroundImage.match(/\"(https\:\/\/.*)"/)[1],
            length_seconds: 0,
            num_res: 0,
            mylist_counter: 0,
            view_counter: 0,
            first_retrieve: "2000/1/1",
        };
        return videoInfo;
    }

    window.addEventListener('click', async e =>
    {
        if(!e.originalTarget.classList.contains('ThreePointMenu-button'))
        {
            return;
        }
        if(!e.originalTarget.parentElement.classList.contains('NicorepoItem-header'))
        {
            return;
        }

        await new Promise(r => setTimeout(r, 1));

        const videoContainer = e.originalTarget.parentElement.parentElement.getElementsByClassName('NicorepoItem-content')[0];
        const videoId = videoContainer.href.match(/sm[0-9]+/)[0];
        
        const popup = document.getElementsByClassName('ThreePointMenu NicorepoItemMenu')[0];
        log(popup);
        
        const button = popup.getElementsByTagName('button')[0].cloneNode(true);
        button.innerHTML = 'ここからのプレイリスト';
        popup.appendChild(button);
        log(button);

        button.addEventListener('click', async () =>
        {
            try
            {
                const loadedList = Array.from(document.getElementsByClassName('NicorepoItem-content')).map(e => e.href.match(/sm[0-9]+/)[0]);
                const lastIndex = loadedList.findIndex(e => e == videoId);
                const useList = loadedList.slice(0, lastIndex + 1);
                log(useList);

                let jsonContainer = {
                    items: [],
                    index: 0,
                    enable: true,
                    loop: false,
                };
                for (const id of useList)
                {
                    console.log(id);
                    jsonContainer.items.push(await fetchFromInternal(id))
                }
                log(jsonContainer);

                const json = JSON.stringify(jsonContainer);
                const dummy = document.createElement('a');
                dummy.href = 'data:application/json,' + encodeURIComponent(`${json}`);
                dummy.download = `${jsonContainer.items[0].title}-${jsonContainer.items[jsonContainer.items.length - 1].title}.playlist.json`;
                alert(jsonContainer.items.map(e => e.title).join("\n"));
                dummy.click();
            }
            catch(e)
            {
                alert(e);
                console.error(e);
            }
        });
    });
})();

