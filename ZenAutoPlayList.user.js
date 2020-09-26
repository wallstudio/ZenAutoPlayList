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
            for (const id of useList.reverse())
            {
                let videoInfo = null;
                let error = null;
                for (let i = 0; i < 8; i++)
                {
                    try
                    {
                        const url = 'https://www.nicovideo.jp/watch/' + id;
                        const res = await fetch(url, {mode: 'cors'});
                        const dataXML = new DOMParser().parseFromString(await res.text(), 'text/html');
                        const dataJson = JSON.parse(dataXML.getElementById('js-initial-watch-data').getAttribute('data-api-data'));
                        log(dataXML);
                        log(dataJson);
                        videoInfo = {
                            active: true,
                            played: false,
                            title: dataXML.title,
                            url: url,
                            id: dataJson.video.id,
                            thumbnail_url: dataJson.video.largeThumbnailURL,
                            length_seconds: dataJson.video.duration,
                            num_res: dataJson.thread.commentCount,
                            mylist_counter: dataJson.video.mylistCount,
                            view_counter: dataJson.video.viewCount,
                            first_retrieve: dataJson.video.postedDateTime,
                        };
                        break;
                    }
                    catch(e)
                    {
                        error = e.toString();
                        console.error(`retry ${i} ${id}`);
                        await new Promise(r => setTimeout(r, 1000 * i));
                    }
                    await new Promise(r => setTimeout(r, 100));
                }
                
                if(error != null)
                {
                    alert(`${id}\n${error}`);
                    throw error;
                }
                jsonContainer.items.push(videoInfo)
            }
            log(jsonContainer);

            const json = JSON.stringify(jsonContainer);
            const dummy = document.createElement('a');
            dummy.href = 'data:application/json,' + encodeURIComponent(`${json}`);
            dummy.download = `${jsonContainer.items[0].title}-${jsonContainer.items[jsonContainer.items.length - 1].title}.playlist.json`;
            alert(jsonContainer.items.map(e => e.title).join("\n"));
            dummy.click();
        });
    });
})();
