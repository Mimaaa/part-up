/**
 * Sanitize a HTML text
 *
 * @class sanitize
 * @memberof Partup.client
 */

Partup.client.sanitize = function(text) {
    return $('<div/>').text(text).html();
};

Partup.client.sanitizeOutputHTML = function(value) {
    // https://github.com/Alex-D/Trumbowyg/issues/203#issuecomment-157725913
    if (!value) return '';
    var returnValue = value.replace(/<strong><br><\/strong>/g, '<br>')
        .replace(/<p><br><\/p>/g, '<br>')
        .replace(/<strong><\/strong>/g, '')
        // .replace(/<p><\/p>/g, '')
        .replace(/ ?face=[\d\D]* ?/g, '')
        .replace(/ ?font-family:[\d\D]*; ?/g, '')
        .replace(/ ?font-family:[\d\D]*; ?/g, '')
        .replace(/ ?font-size:[\d\D]*; ?/g, '')
        .replace(/ ?font-weight:[\d\D]*; ?/g, '')
        .replace(/ ?line-height:[\d\D]*; ?/g, '')
        .replace(/ ?background-color:[\d\D]*; ?/g, '')
        .replace(/ ?color:[\d\D]*; ?/g, '')
        .replace(/ ?id="null" ?/g, '')
        .replace(/ ?text-align: left; ?/g, '')
        .replace(/href=?/g, 'target="_blank" rel="noopener" rel="noreferrer" href=')
        .replace(/ style=""/g, '')
        .replace(/<>/g, '')
        .replace(/<br>/g, '')
        .replace(/<br\/>/g, '')
        .replace(/<br \/>/g, '');

    return returnValue;
};
