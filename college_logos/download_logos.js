// Downloads large version of all team images from:
// http://247sports.com/Season/2015-Football/CollegeTeamTalentComposite

var a = $('<a>').appendTo('body');

var trans = {};

var img = $("img.jsonly");

download(0, 2000, img.length);

function download(i, t, l) {
    if (i === l)  {
        console.log("done!");
        console.log(JSON.stringify(trans));
        return;
    } else {
        var $this = $(img[i]);
        
        var href = $this.attr("src").replace('1_', '9_');
        if (href.indexOf('9_') !== -1) {
            var name = $this.attr("alt") + ".gif";
            trans[href.split("/").pop()] = name;

            console.log("Downloading " + name);

            a.attr("href", href);
            a.attr("download", name);
            a[0].click();
            setTimeout(download, t, i + 1, t, l);
        } else {
            download(i + 1, t, l);
        }
    }
}