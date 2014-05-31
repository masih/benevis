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


    var config = getYAML("structure.yml");
    var default_config = getYAML("https://masih.github.io/benevis/default-structure.yml");
    var extended_config = $.extend({}, default_config, config);
    return extended_config;
});