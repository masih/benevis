define(['jquery', 'config', 'citeproc', 'linkify'], function ($, config) {

    var citations = {};


    function loadByAlias(alias) {

        $.ajax({
            url: 'https://api.zotero.org/users/' + config.citation.zotero_id + '/items?tag=alias:' + alias.join(' || alias:') + '&format=csljson&limit=100',
            beforeSend: function (request) {
                request.setRequestHeader("Zotero-API-Version", "2");
            },
            dataType: 'json',
            async: false,
            success: function (result) {

                result.items.forEach(function (item, index) {

                    citations[alias[index]] = item;
                    citations[alias[index]].id = alias[index]
                })
            },
            error: function (e) {
                console.log("failed to contact zotero.org to fetch citation:" + alias, e);
            }
        });
    }

    var system = {
        retrieveLocale: function (lang) {
            var locale;
            $.ajax({
                url: 'https://raw.githubusercontent.com/citation-style-language/locales/master/locales-' + config.citation.locale + '.xml',
                dataType: 'text',
                async: false,
                success: function (result) {
                    locale = result;
                },
                error: function (e) {
                    console.log("failed to load " + this.url, e);
                }
            });
            return locale
        },

        retrieveItem: function (id) {
            return citations[id] == undefined ? null : citations[id];
        }

    };

    var csl;
    $.ajax({
        url: 'https://raw.githubusercontent.com/citation-style-language/styles/master/' + config.citation.style + '.csl',
        dataType: 'text',
        async: false,
        success: function (result) {
            console.log("loaded " + this.url);
            csl = result;
        },
        error: function (e) {
            console.log("failed to load " + this.url, e);
        }
    });

    var processor = new CSL.Engine(system, csl, config.citation.locale);
    var itemIDs = [];
    var response;
    $.ajax({
        url: 'https://api.zotero.org/users/' + config.citation.zotero_id + '/tags?q=alias',
        dataType: 'text',
        async: false,
        success: function (result) {
            response = result;
        },
        error: function (e) {
            console.log("failed to load " + this.url, e);
        }
    });
    var xmlDoc = $.parseXML(response);
    var $xml = $(xmlDoc);
    var $title = $xml.find("feed>entry>title");
    var ffs = [];
    for (var i = 0; i < $title.length; i++) {
        var title = $title[i].innerHTML;
        if ((token = /alias:(.+)/.exec(title))) {
            var alias = token[1];
            itemIDs.push(alias);
        }
    }
    loadByAlias(itemIDs)
    processor.updateItems(itemIDs);

    return {
        database: citations,
        processor: processor,
        cite: function (cite_object) {
            return this.processor.appendCitationCluster(cite_object, true)[0][1];
        },
        renderBibliography: function () {

            var bibliography = this.processor.makeBibliography();
            var bib_body = $(bibliography[0].bibstart + bibliography[0].bibend);
            bibliography[1].forEach(function (entry_html, index) {

                var entry = $(entry_html);
                entry.linkify();
                entry.attr("id", 'cite_' + bibliography[0].entry_ids[index])
                bib_body.append(entry);
            });

            return bib_body.html();

        },
        getItem: function (id) {
            return system.retrieveItem(id);
        },
        getItemBib: function (id) {
            this.processor.setOutputFormat('text');
            var select = this.processor.makeBibliography({
                "select": [
                    {
                        "field": "id",
                        "value": id
                    }
                ]
            });
            this.processor.setOutputFormat('html');
            return select[1][0];
        }
    }
});