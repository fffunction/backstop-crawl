const simplecrawler = require('simplecrawler');
const ora = require('ora');
const cliTruncate = require('cli-truncate');
const jsonfile = require('jsonfile');

const backstopConf = require('./default-config');

const SPINNER_WIDTH = 2;
const urls = [];

module.exports = function crawl (url, flags) {
    const crawler = simplecrawler(url);
    const spinner = ora('Crawling...');

    if (flags.ignoreRobots) {
        crawler.respectRobotsTxt = false;
    }

    // Skip this small blacklist of extensions
    crawler.addFetchCondition(
        queueItem => !queueItem.path.match(/\.pdf|.js|.css|.png|.jpg|.jpeg|.gif|.json|.xml|.txt$/i)
    );

    // Update spinner with current path
    crawler.on('fetchstart', (queueItem) => {
        const cols = Math.max(process.stdout.columns - SPINNER_WIDTH, 1);
        spinner.text = cliTruncate(queueItem.path, cols);
    });

    // If the document was html then add it to the list
    // This might not be necessary since we're filtering the
    // extensions above, and a local server may not be returning
    // the correct mimetypes/headers
    crawler.on('fetchcomplete', (queueItem) => {
        if (queueItem.stateData.contentType.indexOf('text/html;') > -1) {
            urls.push({
                label: queueItem.path,
                url: queueItem.url,
                selectors: [
                    'document',
                ],
                hideSelectors: [
                    'iframe',
                ],
            });
        }
    });

    // Done. Output the file
    crawler.on('complete', () => {
        backstopConf.scenarios = urls;
        jsonfile.writeFile('./backstop.json', backstopConf, { spaces: 2 }, (err) => {
            if (err) {
                spinner.text = err;
                spinner.fail();
            } else {
                spinner.text = 'backstop.js generated';
                spinner.succeed();
            }
        });
    });

    // Ready. Set. Go.
    spinner.start();
    crawler.start();
};
