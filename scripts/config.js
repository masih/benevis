define(['jquery', 'jsyaml'], function ($, yaml) {

    var config_yml = "structure.yml";
    var config;

    $.ajax({
        url: config_yml,
        dataType: 'text',
        async: false,
        success: function (result) {
            config = yaml.safeLoad(result);
        },
        error: function (e) {
            console.log("failed to load configuration " + config_yml, e);
        }
    });

    return config;
});