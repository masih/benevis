require.config(
    {
        waitSeconds: 15,
        paths: {
            jquery: 'https://code.jquery.com/jquery-1.11.1.min',
            jqueryui: 'https://code.jquery.com/ui/1.10.4/jquery-ui.min',
            bootstrap: 'https://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min',
            jsyaml: 'https://nodeca.github.io/js-yaml/js/js-yaml',
            marked: 'lib/marked',
            tocify: 'https://cdn.rawgit.com/gfranko/jquery.tocify.js/master/src/javascripts/jquery.tocify.min',
            fileSaver: 'https://cdn.jsdelivr.net/filesaver.js/0.1/FileSaver.min',
            mustache: 'https://cdn.jsdelivr.net/mustache.js/0.8.1/mustache.min',
            citeproc: 'lib/citeproc',
            xmldom: 'lib/xmldom',
            xmle4x: 'lib/xmle4x',
            linkify: 'https://soapbox.github.io/jQuery-linkify/dist/jquery.linkify.min'
        },
        shim: {
            bootstrap: { deps: ['jquery'] },
            powertip: { deps: ['jquery'] },
            linkify: { deps: ['jquery'] },
            tocify: { deps: ['jquery', 'jqueryui'] },
            citeproc: { deps: ['xmldom'] }
        }
    }
)

require(['jquery', 'jsyaml', 'marked', 'mustache', 'citations', 'config', 'fileSaver', 'tocify' ], function ($, yaml, marked, mustache, citations, config) {

    var getDocumentIDByName = function (doc) {
        return doc.replace(/(\.| )/g, '_');
    }

    function fixTOCIdentifiers() {

        var source = $("html");
        source.find(".tocify-item a").each(function () {
            var tthis = $(this);
            tthis.attr("href", '#' + tthis.parent().data("unique"))
        })
        source.find("div[data-unique]").each(function () {
            var tthis = $(this);
            tthis.attr("id", tthis.data("unique"))
        })
    }

    function saveAsPrintableHtml() {

        var source = $("html");
        var blob = new Blob(['<html>' + source.html() + '</html>'], {type: "text/html;charset=utf-8"});
        saveAs(blob, "printable.html");
    }

    var $head = $('head');
    $head.append('<title>' + config.title + '</title>')
    $head.append('<meta name="keywords" content="' + config.keywords + '"/>')
    $head.append('<meta name="author" content="' + config.author + '"/>')
    $head.append('<meta name="subject" content="' + config.subject + '"/>')
    $head.append('<meta name="organisation" content="' + config.organisation.name + '"/>')
    $head.append('<meta charset="' + config.charset + '"/>')
    $head.attr('lang', config.language);


    Object.keys(config.structure).forEach(function (section) {
        config.structure[section].forEach(function (doc) {
            $.ajax({
                url: config.source_dir + '/' + doc,
                dataType: 'text',
                async: false,
                success: function (result) {
                    var doc_id = getDocumentIDByName(doc);
                    var html = $(mustache.render(marked(result), config));
                    var container = $('<div id="' + doc_id + '" class="content_md ' + section + '"></div>').append(html);
                    $('#content').append(container);
                },
                error: function (e) {
                    console.log("failed to load " + doc, e);
                }
            });
        })
    })

    console.log('word-count: ' + $(".main").text().split(/\s+/).length)

    var level_1 = level_2 = level_3 = level_4 = level_5 = figcaption = tablecaption = 0;
    $(".main").find("h1,h2,h3,h4,h5,figcaption,table>caption").each(function (index) {
        var tag = this.tagName.toLowerCase();
        var $this = $(this);
        $this.html(function (index, content) {

            if (tag == 'h1') {
                content = '<span class="numbering level_1">' + ++level_1 + '</span>\n' + content;
                level_2 = level_3 = level_4 = level_5 = figcaption = tablecaption = 0;
            }
            if (tag == 'h2') {
                content = '<span class="numbering level_2">' + level_1 + "." + ++level_2 + '</span>\n' + content;
                level_3 = level_4 = level_5 = 0;
            }
            if (tag == 'h3') {
                content = '<span class="numbering level_3">' + level_1 + "." + level_2 + "." + ++level_3 + '</span>\n' + content;
                level_4 = level_5 = 0;
            }
            if (tag == 'h4') {
                content = '<span class="numbering level_4">' + level_1 + "." + level_2 + "." + level_3 + "." + ++level_4 + '</span>\n' + content;
                level_5 = 0;
            }
            if (tag == 'h5') {
                content = '<span class="numbering level_5">' + level_1 + "." + level_2 + "." + level_3 + "." + level_4 + "." + ++level_5 + '</span>\n' + content;
            }

            if (tag == 'figcaption') {
                content = '<span class="figure_caption">Figure ' + level_1 + "." + ++figcaption + '</span>' + content;
            }

            if (tag == 'caption') {
                content = '<span class="figure_caption">Table ' + level_1 + "." + ++tablecaption + '</span>' + content;
            }
            return content;
        })
    })
    $("#toc_md").tocify({ context: "#content", theme: "bootstrap3", scrollHistory: false, ignoreSelector: "#acknowledgements_md>,#dedication_md>,#declarations_md>,#toc_md h1,.cover h1"});
    $("table").addClass("table table-bordered table-hover table-condensed");
    $("p:empty").remove();
    fixTOCIdentifiers();
//    saveAsPrintableHtml();
});