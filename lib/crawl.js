'use strict';

const dirname = require('path').dirname;
const simplecrawler = require('simplecrawler');
const ora = require('ora');
const cliTruncate = require('cli-truncate');
const chalk = require('chalk');
const mkpath = require('mkpath');
const jsonfile = require('jsonfile');
const defaultConf = require('./default-config');
const limitSimilar = require('./limit-similar');

const EXT_BLACKLIST = /\.pdf|\.js|\.css|\.png|\.jpg|\.jpeg|\.gif|\.json|\.xml|\.txt$/i;
const SPINNER_WIDTH = 2;
let urls = [];

module.exports = function crawl (url, flags) {
    const crawler = simplecrawler(url);
    const spinner = ora('Crawling...');
    let outfile = './backstop.json';

    if (flags.ignoreRobots) {
        crawler.respectRobotsTxt = false;
    }

    if (flags.ignoreSslErrors) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        crawler.ignoreInvalidSSL = true;
    }

    if (flags.outfile) {
        outfile = flags.outfile;
    }

    if (flags.debug) {
        const errors = [
            'queueerror',
            'robotstxterror',
            'cookieerror',
            'fetchdataerror',
            'fetcherror',
            'gziperror',
        ];
        errors.forEach((error) => {
            crawler.on(error, (err) => {
                spinner.text = err;
                spinner.stopAndPersist(chalk.red('✖'));
            });
        });
    }

    if (flags.allowSubdomains) {
        crawler.scanSubdomains = true;
    }


    // Skip this small blacklist of extensions
    crawler.addFetchCondition(queueItem => !queueItem.path.match(EXT_BLACKLIST));

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
        if (queueItem.stateData.contentType.indexOf('text/html') > -1) {
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

        if (flags.limitSimilar) {
            spinner.stopAndPersist({
                symbol: '>',
                text: `Limiting similar urls to ${flags.limitSimilar} of each`,
            });
            urls = limitSimilar(urls, flags.limitSimilar);
        }
        defaultConf.scenarios = urls;
        const path = dirname(outfile);
        mkpath(path, (mkpathErr) => {
            if (mkpathErr) {
                spinner.text = mkpathErr;
                spinner.fail();
            } else {
                jsonfile.writeFile(outfile, defaultConf, { spaces: 2 }, (jsonfileErr) => {
                    if (jsonfileErr) {
                        spinner.text = jsonfileErr;
                        spinner.fail();
                    } else {
                        spinner.text = 'backstop.js generated';
                        spinner.succeed();
                    }
                });
            }
        });
    });

    // Ready. Set. Go.
    spinner.start();
    crawler.start();
};
