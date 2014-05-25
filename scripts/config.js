define(['jquery', 'jsyaml'], function ($, yaml) {

    function getYAML(path) {
        var default_config
        $.ajax({
            url: path,
            dataType: 'text',
            async: false,
            success: function (result) {
                default_config = yaml.safeLoad(result);
            },
            error: function (e) {
                console.log("failed to load " + path, e);
            }
        });
        return default_config;
    }


    var config = getYAML("structure.yml");
    var default_config = getYAML("https://raw.githubusercontent.com/masih/benevis/master/default-structure.yml");
    console.log(config);
    console.log(default_config);
    var cconfig = $.extend({}, default_config, config);
    console.log(cconfig);

    return cconfig;
});