// ==UserScript==
// @name         MT time correct
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       zxszx
// @match        https://*.m-team.cc/*
// @match        https://*.m-team.io/*
// @match        https://test2.m-team.cc/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=usvisa-info.com
// @grant        GM_log
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    const regex = /https\:\/\/api\.m-team.(io|cc)\/api\/torrent\/search/g;
    const originOpen = XMLHttpRequest.prototype.open;
    const offset =new Date().getTimezoneOffset() * 60 * 1000 + 8 * 3600 * 1000;

    Number.prototype.padLeft = function(base,chr){
    var len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
    window.nativeFetch = window.fetch;
    window.fetch = async function(request, headers) {
        console.log(request);
        return await window.nativeFetch(request, headers);
    }

    XMLHttpRequest.prototype.open = function (_, url) {
        if(regex.test(url)){
            const xhr = this;
            let response = 'responseText'
            const getter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, response).get;
            Object.defineProperty(xhr, response, {
                get: () => {
                var result = JSON.parse(getter.call(xhr));
                result = watch(result);
                return result;
                }
            });
        }
        originOpen.apply(this, arguments);
    };

   function watch(result){
       if(!result){
           return;
       }
       else{
           if(result.code == "0"){
               for(var idx in result.data.data){
                   var obj = result.data.data[idx];
                  // console.log(obj.lastModifiedDate);
                   var dateTime = new Date(Date.parse(obj.lastModifiedDate) - offset);
                   obj.lastModifiedDate = [dateTime.getFullYear(), (dateTime.getMonth()+1).padLeft(), dateTime.getDate().padLeft()].join('-') + ' ' + [dateTime.getHours().padLeft(),dateTime.getMinutes().padLeft(),dateTime.getSeconds().padLeft()].join(':');
                //   console.log(obj.lastModifiedDate);
                   dateTime = new Date(Date.parse(obj.createdDate) - offset);
                   obj.createdDate = [dateTime.getFullYear(), (dateTime.getMonth()+1).padLeft(), dateTime.getDate().padLeft()].join('-') + ' ' + [dateTime.getHours().padLeft(),dateTime.getMinutes().padLeft(),dateTime.getSeconds().padLeft()].join(':');
                   dateTime = new Date(Date.parse(obj.editDate) - offset);
                   obj.editDate = [dateTime.getFullYear(), (dateTime.getMonth()+1).padLeft(), dateTime.getDate().padLeft()].join('-') + ' ' + [dateTime.getHours().padLeft(),dateTime.getMinutes().padLeft(),dateTime.getSeconds().padLeft()].join(':');
               }
           }
       }
       return result;
   }

})();
