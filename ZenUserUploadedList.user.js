// ==UserScript==
// @name         ZenUserUploadedList
// @namespace    https://github.com/wallstudio/ZenAutoPlayList
// @version      0.2
// @description  https://github.com/wallstudio/ZenAutoPlayList/blob/master/ZenUserUploadedList.user.js
// @author       うぷはし
// @match        https://www.nicovideo.jp/*
// @grant        none
// @require      https://raw.githubusercontent.com/wallstudio/UserScriptLibrary/master/xhrFetchInjection.js
// @require      https://raw.githubusercontent.com/wallstudio/UserScriptLibrary/master/io.js
// ==/UserScript==


(function() {
    'use strict';

    console.log("ZenUserUploadedList");

    window.DebugForZenAutoPlayList = false;
    function log(arg)
    {
        if(!window.DebugForZenAutoPlayList) return;
        log(arg)
    }

    let loaded = [];

    RequestInjector.injectFetch((_url, args) =>
    {
        if(!args.input.match(/nvapi.nicovideo.jp\/v1\/playlist\/user-uploaded\/[0-9]+/))
        {
            return args;
        }

        if(loaded.includes(args.input))
        {
            return args;
        }

        loaded.push(args.input);

        console.log(args);
        (async function()
        {
            let res, body, playlist;
            try
            {
                res = await fetch(args.input, args.init);
                body = await res.text();
                playlist = JSON.parse(body);
                
                let jsonContainer = {
                    items: playlist.data.items.reverse().map(item =>
                    {
                        return {
                            active: true,
                            played: false,
                            title: item.content.title,
                            url: 'https://www.nicovideo.jp/watch/' + item.watchId,
                            id: item.watchId,
                            thumbnail_url: item.content.thumbnail.url,
                            length_seconds: item.content.duration,
                            num_res: item.content.count.comment,
                            mylist_counter: item.content.count.mylist,
                            view_counter: item.content.count.view,
                            first_retrieve: item.content.registeredAt.split("T")[0].replace("-", "/"),
                        };
                    }),
                    index: 0,
                    enable: true,
                    loop: false,
                };
                
                log(jsonContainer);

                const json = JSON.stringify(jsonContainer);
                const dummy = document.createElement('a');
                dummy.href = 'data:application/json,' + encodeURIComponent(`${json}`);
                dummy.download = `${playlist.data.meta.ownerName}_${playlist.data.meta.title}.playlist.json`;
                if(confirm(jsonContainer.items.map(e => e.title).join("\n")))
                {
                    dummy.click();
                }
            }
            catch(e)
            {
                console.log(e);
                console.log(res);
                console.log(body);
                console.log(playlist);
            }
        })();
        
        return args;
    });
})();

