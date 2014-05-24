require.config(
    {
        paths: {
            jquery: 'lib/jquery.min',
            jqueryui: 'lib/jquery-ui-1.10.4.custom.min',
            bootstrap: 'lib/bootstrap.min',
            jsyaml: 'lib/js-yaml.min',
            marked: 'lib/marked',
            tocify: 'lib/jquery.tocify.min',
            fileSaver: 'lib/FileSaver',
            mustache: 'lib/mustache',
            citeproc: 'lib/citeproc',
            xmldom: 'lib/xmldom',
            xmle4x: 'lib/xmle4x',
            linkify: 'lib/jquery.linkify-1.0-min'
        },
        shim: {
            bootstrap: { deps: ['jquery'] },
            jqueryui: { deps: ['jquery'] },
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

    var saveAsPrintableHtml = function () {

        var source = $("html");
        source.find(".tocify-item a").each(function () {
            var tthis = $(this);
            tthis.attr("href", '#' + tthis.parent().data("unique"))
        })
        source.find("div[data-unique]").each(function () {
            var tthis = $(this);
            tthis.attr("id", tthis.data("unique"))
        })
        var blob = new Blob(['<html>' + source.html() + '</html>'], {type: "text/html;charset=utf-8"});
        saveAs(blob, "printable.html");
    }

    $('head').append('<title>' + config.title + '</title>')
    $('head').append('<meta name="keywords" content="' + config.keywords + '"/>')
    $('head').append('<meta name="author" content="' + config.author + '"/>')
    $('head').append('<meta name="subject" content="' + config.subject + '"/>')
    $('head').append('<meta name="organisation" content="' + config.organisation.name + '"/>')


    Object.keys(config.content).forEach(function (section) {
        config.content[section].forEach(function (doc) {
            $.ajax({
                url: 'md/' + doc,
                dataType: 'text',
                async: false,
                success: function (result) {
                    var doc_id = getDocumentIDByName(doc);
                    var html = $(mustache.render(marked(result), config));
                    var container = $('<div id="' + doc_id + '" class="content_md ' + section + '"></div>').append(html);
                    $('#content').append(container);
                },
                error: function (e) {
                    console.log("failed to load " + doc);
                }
            });
        })
    })

    console.log($(".content").text().split(/\s+/).length)

    var level_1 = level_2 = level_3 = level_4 = level_5 = 0;
    $(".content").find("h1,h2,h3,h4,h5").each(function (index) {
        var tag = this.tagName.toLowerCase();
        var $this = $(this);
        $this.html(function (index, content) {

            if (tag == 'h1') {
                content = '<span class="numbering level_1">' + ++level_1 + '</span>\n' + content;
                level_2 = level_3 = level_4 = level_5 = 0;
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
            return content;
        })
    })

    $("#toc_md").tocify({ context: "#content", theme: "bootstrap3", scrollHistory: false, ignoreSelector: "#acknowledgements_md>,#dedication_md>,#declarations_md>,#toc_md h1,.cover h1"});
    $("table").addClass("table table-bordered table-hover table-condensed");

//    saveAsPrintableHtml();
});