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
        console.log(popup);
        
        const button = popup.getElementsByTagName('button')[0].cloneNode(true);
        button.innerHTML = 'ここからのプレイリスト';
        popup.appendChild(button);
        console.log(button);

        button.addEventListener('click', async () =>
        {
            const loadedList = Array.from(document.getElementsByClassName('NicorepoItem-content')).map(e => e.href.match(/sm[0-9]+/)[0]);
            const lastIndex = loadedList.findIndex(e => e == videoId);
            const useList = loadedList.slice(0, lastIndex + 1);
            console.log(useList);

            let jsonContainer = {
                items: await Promise.all(useList.reverse().map(async id =>
                {
                    try
                    {
                        const url = 'https://www.nicovideo.jp/watch/' + id;
                        const res = await fetch(url, {mode: 'cors'});
                        const dataXML = new DOMParser().parseFromString(await res.text(), 'text/html');
                        const dataJson = JSON.parse(dataXML.getElementById('js-initial-watch-data').getAttribute('data-api-data'));
                        console.log(dataXML);
                        console.log(dataJson);

                        return {
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
                    }
                    catch(e)
                    {
                        console.error(e);
                        return null;
                    }
                })),
                index: 0,
                enable: true,
                loop: false,
            }
            console.log(jsonContainer);

            const json = JSON.stringify(jsonContainer);
            const dummy = document.createElement('a');
            dummy.href = 'data:application/json,' + encodeURIComponent(`${json}`);
            dummy.download = `${jsonContainer.items[0].title}-${jsonContainer.items[jsonContainer.items.length - 1].title}.playlist.json`;
            dummy.click();
            document.removeChild(dummy);
        });
    });
})();
