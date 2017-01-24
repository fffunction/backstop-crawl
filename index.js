#!/usr/bin/env node

var SimpleCrawler = require('simplecrawler');
var jsonfile = require('jsonfile');
var Ora = require('ora');

var crawl = SimpleCrawler(process.argv[2]);
var spinner = Ora('Crawling...');
var urls = [];

var backstopConf = {
    viewports: [
        {
            name: 'Screen',
            width: 1440,
            height: 900
        },
    ],
    scenarios: [],
    paths: {
        bitmaps_reference: 'backstop_data/bitmaps_reference',
        bitmaps_test: 'backstop_data/bitmaps_test',
        casper_scripts: 'backstop_data/casper_scripts',
        html_report: 'backstop_data/html_report',
        ci_report: 'backstop_data/ci_report'
    },
    casperFlags: [],
    engine: 'phantomjs',
    report: ['browser'],
    debug: false
};

crawl.addFetchCondition(function(queueItem, referrerQueueItem) {
    return !queueItem.path.match(/\.pdf|.js|.css|.png|.jpg|.jpeg|.gif|.json|.xml|.txt$/i);
});

crawl.on('fetchstart', function (queueItem) {
    spinner.text = queueItem.path;
});

crawl.on('fetchcomplete', function(queueItem) {
    if (queueItem.stateData.contentType.indexOf('text/html;') > -1) {
        urls.push({
            label: queueItem.path,
            url: queueItem.url,
            selectors: [
                'document',
            ],
            'hideSelectors': [
                'iframe',
            ],
        });
    }
});

crawl.on('complete', function () {
    backstopConf.scenarios = urls;
    jsonfile.writeFile('./backstop.json', backstopConf, { spaces: 2 }, function(err) {
        if (err) {
            spinner.text = err;
            spinner.fail();
        } else {
            spinner.text = 'backstop.js generated';
            spinner.succeed();
        }
    });
});

spinner.start();
crawl.maxDepth=3;
crawl.start();
