# $ backstop-crawl
[![Stories in Ready](https://badge.waffle.io/fffunction/backstop-crawl.svg?label=ready&title=Ready)](http://waffle.io/fffunction/backstop-crawl) [![Build Status](https://travis-ci.org/fffunction/backstop-crawl.svg?branch=master)](https://travis-ci.org/fffunction/backstop-crawl) [![Coverage Status](https://coveralls.io/repos/github/fffunction/backstop-crawl/badge.svg?branch=master)](https://coveralls.io/github/fffunction/backstop-crawl?branch=master)

> `backstop-crawl` is a tool for automatically generating the `backstop.json` required for [`backstop`](https://github.com/garris/BackstopJS) by crawling a website.

![](http://i.imgur.com/yv57RDo.gif)

## Install

```
$ npm install --global backstop-crawl
```

## Usage

```
❯ backstop-crawl

  Crawl a site to generate a backstopjs config

  Usage
    $ backstop-crawl <url>

  Options
    --outfile, -o        Save the backstop config to this file
    --debug              Logs out errors produced while crawling
    --ignore-robots      Ignore the sites robots.txt
    --ignore-ssl-errors  Treat any certificate as valid (e.g. self-signed
                          or expired)
    --allow-subdomains   Allow crawling links found to subdomains of the
                          current domain
    --limit-similar[=3]  Limits the number of similar URLs to a set number
                         Defaults to 3
                          e.g /blog/1, /blog/2, /blog/3
    --reference-url      Allows a reference URL to be used in testing
    --template           Specify the template file to use
                           Defaults to backstop.template.json

  Examples
    $ backstop-crawl http://localhost
    $ backstop-crawl http://localhost --reference-url='https://mycoolsite.com'

```

## `backstop.template.json`
You can customize the contents of the generated `backstop.json` file by creating a `backstop.template.json` file. In addition to standard items in [`backstop.json`](https://github.com/garris/BackstopJS#working-with-your-config-file) the `backstop.template.json` needs a `defaultScenario` key. This will be used when generating the `scenarios` for crawled URLs.

For example:
```json
{
  "scenarios": [],
  "defaultScenario": {
  	"label": "Default",
  	"url": "",
  	"referenceUrl": "",
  	"hideSelectors": [],
  	"selectors": [
  	"document"
  	],
  	"readyEvent": null,
  	"delay": 1500,
  	"misMatchThreshold": 0.1
  }
}
```

After generating your `backstop.json`, you can modify scenarios and copy them into `scenarios` in your template. The next time you run `backstop crawl`, these scenarios will override generated scenarios with a matching label.

Ex. One of your pages takes a little more time to load, so you need to increase the delay. Rather than increasing the delay in the `defaultScenario` (which would impact all tests) you can override just that one case by copying it into `scenarios` in your template and modifying the value for `delay`.

## License

MIT © fffunction [fffunction.co](https://fffunction.co)
