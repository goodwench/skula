var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Page Model
 * ==========
 */

var Page = new keystone.List('Page', {
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }
});

Page.add({
    name: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
    },
    content: { type: Types.Html, wysiwyg: true },
    image: { type: Types.CloudinaryImage }
});

Page.defaultColumns = 'title, slug, locale';
Page.register();
