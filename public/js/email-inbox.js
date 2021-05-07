$(function () {

    $('.mail-box input[type="checkbox"]').on('ifChecked ifUnchecked', function(event){
        if (event.type == 'ifUnchecked') {
            $(this).parent().parent().removeClass('active');
            $('.checkall').parent().removeClass
        } else {
            $(this).parent().parent().addClass('active');
        }
    });
    $('.checkall').on('ifChecked ifUnchecked', function (event) {
        if (event.type == 'ifChecked') {
            $('input[type="checkbox"]:not(".switch"):not(".checkall")').iCheck('check');
        } else {
            $('input[type="checkbox"]:not(".switch"):not(".checkall")').iCheck('uncheck');
        }
    });
});
