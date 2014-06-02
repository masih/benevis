define(['jquery', 'jsyaml'], function ($, yaml) {

    function getYAML(path) {
        var config_json
        $.ajax({
            url: path,
            dataType: 'text',
            async: false,
            success: function (result) {
                config_json = yaml.safeLoad(result);
            },
            error: function (e) {
                console.log("failed to load " + path, e);
            }
        });
        return config_json;
    }

    function getDefaultConfiguration() {
        var default_config_path = "https://api.github.com/repos/masih/benevis/contents/default-structure.yml";
        var response;
        $.ajax({
            type: 'GET',
            url: default_config_path,
            async: false,
            headers: {
                "Accept": "application/vnd.github.v3.raw"
            }
        }).done(function (data) {
            response = data;
        }).fail(function (error) {
            console.log('failed to load the default configuration', error);
        });

        return yaml.safeLoad(response);
    }

    var config = getYAML("structure.yml");

    var default_config = getDefaultConfiguration();
    return $.extend({}, default_config, config);
});