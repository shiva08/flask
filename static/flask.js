$(document).ready(function() {
    $('#summary-spinner').hide();
    $(document).ajaxStart(function(){
        $('#summary-spinner').show();
    });
    $(document).ajaxStop(function(){
        $('#summary-spinner').hide();
    });

    var scroll_offset = 100;
    var removeLight = function() {
        var sourceTag = $('.page-source')[0];
        sourceTag.innerHTML = sourceTag.innerHTML.replace(
            /<span class="highlight">(&lt;\/?\s*[a-zA-Z0-9]+?\s*?.*?&gt;)<\/span>/gim,
            "$1");
    };
    $('body').on('click', '.tag-name', function(event) {
        event.preventDefault();
        removeLight();
        var tagName = $(this)[0].innerHTML;
        var sourceTag = $('.page-source')[0];
        var pattern = new RegExp('&lt;\/{0,1}\\s*' + tagName + '(\\s+?.*?)*?&gt;', 'gim');
        sourceTag.innerHTML = sourceTag.innerHTML.replace(
            pattern,
            '<span class="highlight">$&</span>');
        $('html, body').animate({
            scrollTop: $(".highlight").offset().top - scroll_offset
        }, 200);
    });
    
    var summarize = function(response) {
        if (!response || !response.summary || !response.source) {
            $('.error').show();
            return;
        }
        $('.error').hide();
        $('.summary').remove();
        $('.source').remove();
        var summary_container = $('<div class="container source"></div>');
        var summary_header = $('<div class="header"><h4>Summary of the page<h4></div>');
        var header_row = $('<div class="row">' +
                            '<div class="col-sm-4 text-center">' +
                              '<h5>Tag</h5>' +
                            '</div>' +
                            '<div class="col-sm-4 text-center">' +
                              '<h5>Count</h5>' +
                            '</div>' +
                          '</div>');
        summary_container.append(summary_header);
        summary_container.append(header_row);
        _.each(_.pairs(response.summary), function(tag) {
            var name = tag[0];
            var count = tag[1];
            var tagSummary = $('<div class="row">' +
                                  '<div class="col-sm-4 text-center">' +
                                         '<a href class="tag-name">' + name + '</a>' +
                                  '</div>' +
                                  '<div class="col-sm-4 text-center">' +
                                         '<span>' + count + '</span>' +
                                  '</div>' +
                                 '</div>');
            summary_container.append(tagSummary);
        });
        $('body').append(summary_container);
        var source_container = $('<div class="container source"></div>');
        var source_header = $('<div class="header"><h4> Page Source </h4></div>');
        source_container.append(source_header);
        var source = $('<pre class="page-source-container">' +
                          '<code class="page-source">' +
                          '</code>' +
    '                   </pre>');
        source_container.append(source);
        $('body').append(source_container);
        $('.page-source').text(response.source);
    };
    
    $('.form').submit(function(event) {
        event.preventDefault();
        $.ajax({
            url: '/summary',
            data: $('form').serialize(),
            type: 'POST',
            success: function(response) {
                summarize(response);
            },
            error: function(error) {
                console.log(error);
                $('.error').show();
            }
        });
    });

});
