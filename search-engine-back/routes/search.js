'use strict'

const express = require('express');
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

var keywords = require("../../data/keywords.json");
var named_entities = require("../../data/splited_entities.json");

router.post('/', async function (req, res) {
    var query = req.body.query;
    var query_words = query.trim().split(" ");
    var removing_query_words = [];

    var size = 100;

    var field_type = '';

    var singers_weight = 1;
    var title_weight = 1;
    var lyricist_weight = 1;
    var year_weight = 1;
    var composer_weight = 1;
    var album_weight = 1;
    var source_weight = 1;
    var target_weight = 1;
    var range = 0;
    var sorting = 0;
    var sort_method=[];

    field_type = 'cross_fields';
    query_words.forEach(word => {
    word = word.replace('ගේ', '');
    word = word.replace('යන්ගේ', '');
    if (named_entities.singers_splits.includes(word)) {
        singers_weight = singers_weight + 1;
    }
    if (named_entities.lyricist_splits.includes(word)) {
        lyricist_weight = lyricist_weight + 1;
    }
    if (named_entities.composer_splits.includes(word)) {
        composer_weight = composer_weight + 1;
    }
    if (named_entities.title_splits.includes(word)) {
        title_weight = title_weight + 1;
    }
    if (named_entities.album_splits.includes(word)) {
        album_weight = album_weight + 1;
    }
    if (named_entities.source_domain_splits.includes(word)) {
        source_weight = source_weight + 1;
    }
    if (named_entities.target_domain_splits.includes(word)) {
        target_weight = target_weight + 1;
    }

    if (keywords.singers.includes(word)) {
        singers_weight = singers_weight + 1;
        removing_query_words.push(word);
    }
    if (keywords.composer.includes(word)) {
        composer_weight = composer_weight + 1;
        removing_query_words.push(word);
    }
    if (keywords.album.includes(word)) {
        album_weight = album_weight + 1;
        removing_query_words.push(word);
    }
    if (keywords.lyricist.includes(word)) {
        lyricist_weight = lyricist_weight + 1;
        removing_query_words.push(word);
    }
    if (keywords.year.includes(word)) {
        year_weight = year_weight + 1;
        removing_query_words.push(word);
    }

    if (keywords.metaphor.includes(word)) {
        removing_query_words.push(word);
    }

    if (keywords.songs.includes(word)) {
        removing_query_words.push(word);
    }

    if (!isNaN(word)) {
        range = parseInt(word);
        removing_query_words.push(word);
    }
    });

    if (range == 0 && sorting > 0) {
        console.log(true)
        size = 10;
        sort_method = [{ viewCount: { order: "desc" } }];
    } else if (range > 0 || sorting > 0) {
        size = range;
        sort_method = [{ viewCount: { order: "desc" } }];
    }

    var max = Math.max(singers_weight, title_weight, lyricist_weight, composer_weight, album_weight, year_weight)
    console.log(max, source_weight, target_weight)
    if (source_weight>= max || targert_weight>= max){
        console.log(false)
        var es_query = {
                nested: {
                    path: "metaphors",
                    query: {
                    fuzzy: {
                            "metaphors.metaphor": {
                                "value": query.trim(),
                                "fuzziness": "1"
                            }
                        }
                    },
                    inner_hits: {
                        name : "matching_metaphors",
                        size: 10,
                        _source: ["metaphors.metaphor","metaphors.interpretation","metaphors.source_domain","metaphors.target_domain"]
                    }
                    
                }
            }
        var es_includes = ["singers", "title", "lyricist","lyrics", "composer", "album", "year"]
    }else{
        var es_query = {
                multi_match: {
                    query: query.trim(),
                    fields: [`singers^${singers_weight}`, `title^${title_weight}`, `lyricist^${lyricist_weight}`,
                    `composer^${composer_weight}`, `album^${album_weight}`, `year^${year_weight}`, `metaphors.source_domain^${source_weight}`,
                    `metaphors.target_domain^${targert_weight}`],
                    operator: "or",
                    type: field_type
                }
            }
        var es_includes = ["singers", "title", "lyricist","lyrics", "composer", "album", "year", "metaphors.metaphor", "metaphors.interpretation","metaphors.source_domain", "metaphors.target_domain"]
    }

    removing_query_words.forEach(word => {
        query = query.replace(word, '');
    });

    var index= 'sinhala_metaphors'
    var result = await client.search({
        index,
        body: {
            _source: {
                includes: es_includes
            },
        query: es_query,
            aggs: {
                "year_filter": {
                    terms: {
                        field: "year.keyword",
                        size: 10
                    }
                },
                "lyricist_filter": {
                    terms: {
                        field: "lyricist.keyword",
                        size: 10
                    }
                },
                "album_filter": {
                    terms: {
                        field: "album.keyword",
                        size: 10
                    }
                }
            }
        }
       })
       
        result.body.hits.hits.forEach(song => {
            var lis = []
            if (song.inner_hits){
                var inner_hit = song.inner_hits.matching_metaphors.hits.hits[0]._source 
                lis.push(inner_hit)
                song._source.metaphors = lis;
                delete song.inner_hits;
            }        
        });
    // console.log(result)
    res.send({
        hits: result.body.hits.hits,
        aggs: result.body.aggregations
    });
});

module.exports = router;