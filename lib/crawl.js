'use strict';

const dirname = require('path').dirname;
const simplecrawler = require('simplecrawler');
const ora = require('ora');
const cliTruncate = require('cli-truncate');
const chalk = require('chalk');
const mkpath = require('mkpath');
const jsonfile = require('jsonfile');
const cheerio = require('cheerio');
const path = require('path');
const limitSimilar = require('./limit-similar');
const fs = require('fs');
let defaultConf = {};

const rootPath = process.cwd();

/**
 * Check for backstop-crawl.js for a customizable config
 */
if (fs.existsSync( rootPath + '/backstop-crawl.js' )) {
    defaultConf = require(rootPath + '/backstop-crawl.js');
    /**
     * Otherwise fallback to the default config
     */
} else {
    defaultConf = require('./default-config');
}

/**
 * Stash the default scenario from the config then delete it
 * as defaultScenario isn't a valid key for backstop.json
 */
const defaultScenario = defaultConf.defaultScenario;
delete defaultConf[defaultScenario];

const EXT_BLACKLIST = /\.pdf|\.js|\.css|\.png|\.jpg|\.jpeg|\.gif|\.json|\.xml|\.txt$/i;
const SPINNER_WIDTH = 2;
let urls = [];

module.exports = crawl;
function crawl(url, referenceURL, flags) {
    const crawler = simplecrawler(url);
    const spinner = ora('Crawling...');
    let outfile = './backstop.json';

    crawler.discoverResources = function(buffer) {
        const $ = cheerio.load(buffer.toString("utf8"));

        return $("a[href]").map(function () {
            const href = $(this).attr("href");
            return href;
        }).get();
    };

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
        errors.forEach(error => {
            crawler.on(error, err => {
                spinner.text = err;
                spinner.stopAndPersist(chalk.red('✖'));
            });
        });
    }

    if (flags.allowSubdomains) {
        crawler.scanSubdomains = true;
    }

    // Skip this small blacklist of extensions
    crawler.addFetchCondition(
        queueItem => !queueItem.path.match(EXT_BLACKLIST)
    );

    // Update spinner with current path
    crawler.on('fetchstart', queueItem => {
        const cols = Math.max(process.stdout.columns - SPINNER_WIDTH, 1);
        spinner.text = cliTruncate(queueItem.path, cols);
    });

    // If the document was html then add it to the list
    // This might not be necessary since we're filtering the
    // extensions above, and a local server may not be returning
    // the correct mimetypes/headers
    crawler.on('fetchcomplete', queueItem => {
        if (queueItem.stateData.contentType.indexOf('text/html') > -1) {
            let currentScenario = {...defaultScenario};
            currentScenario.label = queueItem.path;
            currentScenario.url = queueItem.url.replace(url, referenceURL);
            currentScenario.referenceUrl = queueItem.url;
            urls.push(currentScenario);
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
        mkpath(path, mkpathErr => {
            if (mkpathErr) {
                spinner.text = mkpathErr;
                spinner.fail();
            } else {
                jsonfile.writeFile(
                    outfile,
                    defaultConf,
                    { spaces: 2 },
                    jsonfileErr => {
                        if (jsonfileErr) {
                            spinner.text = jsonfileErr;
                            spinner.fail();
                        } else {
                            spinner.text = 'backstop.js generated';
                            spinner.succeed();
                        }
                    }
                );
            }
        });
    });

    // Ready. Set. Go.
    spinner.start();
    crawler.start();
}
