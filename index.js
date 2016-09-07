var SimpleCrawler = require('simplecrawler');
var jsonfile = require('jsonfile');

var crawl = SimpleCrawler(process.argv[2]);
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

crawl.on('fetchcomplete', function(queueItem) {
    var url = queueItem.url;
    if (url.match(/\/$/)) {
        urls.push({
            label: queueItem.path,
            url: url,
            selectors: [
                'document',
            ],
        });
    }
});

crawl.on('complete', function () {
    backstopConf.scenarios = urls;
    jsonfile.writeFile('./backstop.json', backstopConf, { spaces: 2 }, function(err) {
        if (err) console.log(err);
        else console.log('Config generated');
    });
});

crawl.start();
