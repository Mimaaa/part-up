import partupAutolinker from '../helpers/autolink';
import * as Autolinker from '../helpers/Autolinkjs';
import marked from 'marked';

Partup.client.strings = {

    /**
     * Slugify helper
     *
     * @memberof Partup.client
     * @param {String} stringToSlugify
     */
    slugify: function (stringToSlugify) {

        if (typeof stringToSlugify !== 'string') {
            return stringToSlugify;
        }

        return stringToSlugify
            .replace('.', '-')              // Replace . with -
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '')             // Trim - from end of text
            .toLowerCase();                 // ensure lower case characters
    },

    /**
     * Emoji helper
     *
     * turns text into emojis using emoji.js
     * See: https://github.com/iamcal/js-emoji
     * @memberof Partup.client
     * @param {String} stringToEmoji
     */
    emojify: function (stringToEmoji) {

        var emoji = require('./emoji');

        if (typeof stringToEmoji !== 'string') {
            return stringToEmoji;
        }

        return emoji.replace_colons(emoji.replace_emoticons(stringToEmoji));
    },

    tagsStringToArray: function (tagString) {
        if (!tagString) return [];
        return tagsArray = tagString.replace(/\s/g, '').split(',').map(function (tag) {
            return mout.string.slugify(tag);
        });
    },

    newlineToBreak: function (string) {
        return string.replace(/(?:\r\n|\r|\n)/g, '<br />');
    },

    locationToDescription: function (location) {
        var components = [];
        if (location.city) components.push(location.city);
        if (location.country) components.push(location.country);
        return components.join(', ');
    },

    partupSlugToId: function (slug) {
        return slug.split('-').pop();
    },

    shortenLeft: function (string, maxCharacters) {
        if (!string) return '';
        if (string.length <= maxCharacters) return string;
        var removeCount = string.length - maxCharacters;
        return '...' + string.substr(removeCount);
    },

    shortenRight: function (string, maxCharacters) {
        if (!string) return '';
        if (string.length <= maxCharacters) return string;
        return string.substr(0, maxCharacters - 1) + '...';
    },

    shortenLeftRight: function (string, middle, maxCharacters) {
        var strings = this.splitCaseInsensitive(string, middle);
        var leftInputString = strings[0] || '';
        var rightInputString = strings[1] || '';

        if ((leftInputString.length + rightInputString.length) <= maxCharacters) return strings;

        var leftString = this.shortenLeft(leftInputString, Math.round(maxCharacters / 2));
        var rightString = this.shortenRight(rightInputString, Math.round(maxCharacters / 2));
        return [leftString, rightString];
    },

    splitCaseInsensitive: function (string, split) {
        var splitString = new RegExp(split, 'i');
        var strings = string.split(splitString);
        return strings;
    },
    renderToMarkdownWithEmoji(rawNewValue, _extraCssClass) {
        let renderer = new marked.Renderer();
        marked.setOptions({
            renderer: renderer,
            highlight: function (code) {
                return require('highlight.js').highlightAuto(code).value;
            }
        });
        let extraCssClass = '';
        if (_extraCssClass) {
            extraCssClass = _extraCssClass
        }

        renderer.paragraph = function (text) {
            return '<p class="pu-paragraph ' + extraCssClass + '">' + text + '</p>';
        };

        renderer.link = function (href, title, text) {

            let isExternal = function (url) {
                return !(location.href.replace("http://", "")
                    .replace("https://", "").split("/")[0] === url
                    .replace("http://", "")
                    .replace("https://", "").split("/")[0]);
            };

            return (isExternal(href))
                ? `<a href="${href}" target="_blank" rel="noopener" rel="noreferrer" title="${title}">${text}</a>`
                : `<a href="${href}" title="${title}">${text}</a>`;
        };

        renderer.list = function(body, ordered) {
            var tag = ordered ? 'ol' : 'ul';
            return `<${tag} class="pu-list-comment">${body}</${tag}>` + '\n';
        };

        return Partup.helpers.mentions.decode(
            partupAutolinker(
                marked(
                    this.emojify(rawNewValue)
                )
            )
        );
    }

};

strings = Partup.client.strings;

export default strings;
