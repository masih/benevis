define(['jquery', 'config', 'citeproc', 'linkify'], function ($, config) {

    var citations = {};


    function getCiteKeyFromNote(note) {

        var matches = /^citekey: *(.+) *$/gm.exec(note);
        return matches[1];
    }

    function fetch(start) {
        $.ajax({
            url: 'https://api.zotero.org/users/' + config.citation.zotero_id + '/items?format=csljson&limit=99&start=' + start,
            beforeSend: function (request) {
                request.setRequestHeader("Zotero-API-Version", "2");
            },
            dataType: 'json',
            async: false,
            success: function (result) {

                result.items.forEach(function (item, index) {

                    var citekey = getCiteKeyFromNote(item.note);

                    if (citekey != null) {
                        citations[citekey] = item;
                        citations[citekey].id = citekey;
                    } else {
                        console.log("no citekey was found for " + item);
                        citations[item.id] = item;
                    }
                })
            },
            error: function (e) {
                console.log("failed to contact zotero.org to fetch citation:" + alias, e);
            }
        });
    }

    function loadZoteroLibrary() {

        var response;
        $.ajax({
            url: 'https://api.zotero.org/users/' + config.citation.zotero_id + '/items?format=keys',
            dataType: 'text',
            async: false,
            success: function (result) {
                response = result.trim().split('\n');
            },
            error: function (e) {
                console.log("failed to load " + this.url, e);
            }
        });

        var to_be_fetched = response.length;
        var fetch_count = 0;
        while (to_be_fetched > 0) {

            fetch(fetch_count * 99);
            fetch_count++;
            to_be_fetched -= 99;
        }
    }

    var system = {
        retrieveLocale: function (lang) {
            var locale;
            $.ajax({
                url: 'https://cdn.rawgit.com/citation-style-language/locales/master/locales-' + lang + '.xml',
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
            if (citations[id] == undefined) {
                console.log("failed to find citation with key " + id);
                return null;
            } else {
                return citations[id];
            }
        }
    };

    var csl;
    $.ajax({
        url: 'https://cdn.rawgit.com/citation-style-language/styles/master/' + config.citation.style + '.csl',
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
    loadZoteroLibrary();
    var citekeys = Object.keys(citations);
    processor.updateItems(citekeys);

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