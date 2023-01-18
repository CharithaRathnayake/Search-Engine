'use strict'
// const prettifiedData = require('../../songs_prettify.json')
const prettifiedData = require('../data/sinhala_metaphors.json')

var fs = require('fs');

var singers_splits = [];
var lyricists_splits = [];
var composers_splits = [];
var albums_splits = [];
var source_domain_splits = [];
var target_domain_splits = [];
var titles_splits = [];

function collect_named_entities() {
    prettifiedData.forEach(song => {
        var singers = song.singers;
        if (singers) {
            singers.forEach(singer => {
                var splits = singer.trim().split(' ');
                splits.forEach(split => {
                    if (!singers_splits.includes(split.trim())) {
                        singers_splits.push(split.trim());
                    }
                });
            });
        }
        var lyricist = song.lyricist;
        if (lyricist) {
            var splits = lyricist.trim().split(' ');
            splits.forEach(split => {
                if (!lyricist_splits.includes(split.trim())) {
                    lyricist_splits.push(split.trim());
                }
            });
        }
        var composer = song.composer;
        if (composer) {
            var splits = composer.trim().split(' ');
            splits.forEach(split => {
                if (!composer_splits.includes(split.trim())) {
                    composer_splits.push(split.trim());
                }
            });
        }
        var album = song.album;
        if (album) {
            var splits = album.trim().split(' ');
            splits.forEach(split => {
                if (!album_splits.includes(split.trim())) {
                    album_splits.push(split.trim());
                }
            });
        }
        var metaphors = song.metaphors;
        if (metaphors) {
            metaphors.forEach(metaphor => {
                var source_domain = metaphor.source_domain
                var splits = source_domain.trim().split(' ');
                splits.forEach(split => {
                    if (!source_domain_splits.includes(split.trim())) {
                        source_domain_splits.push(split.trim());
                    }
                });
            });
        }
        var metaphors = song.metaphors;
        if (metaphors) {
            metaphors.forEach(metaphor => {
                var target_domain = metaphor.target_domain
                var splits = target_domain.trim().split(' ');
                splits.forEach(split => {
                    if (!target_domain_splits.includes(split.trim())) {
                        target_domain_splits.push(split.trim());
                    }
                });
            });
        }
        var title = song.title;
        if (title) {
            var splits = title.trim().split(' ');
            splits.forEach(split => {
                if (!title_splits.includes(split.trim())) {
                    title_splits.push(split.trim());
                }
            });
        }
    });

    var entities = {
        singers_splits,
        lyricist_splits,
        composer_splits,
        album_splits,
        source_domain_splits,
        target_domain_splits,
        title_splits
    }
    var jsonentities = JSON.stringify(entities);
    var fs = require('fs');
    fs.writeFile('../data/splited_entities.json', jsonentities, 'utf8', (error) => {console.log(error)});
}

collect_named_entities();