/* eslint-disable no-param-reassign, no-else-return */
const urlParse = require('url-parse');
const entries = require('object.entries');

module.exports = limitSimilar;
function limitSimilar(urls, num) {
  const countSimilar = urls.map(url => url.url).reduce((similar, url) => {
    const path = urlParse(url).pathname;
    const parts = path.trim().split('/').filter(part => part.trim());
    // Skip top level urls, e.g. /about
    if (parts.length > 1) {
      // Insert the anything-thats-not-slash regex into
      // the last part of the url
      const abstractPath = `${path.replace(/\/[^/]+[^$]?$/, '/[^/]+[^$]?')}$`;
      if (abstractPath in similar) {
        similar[abstractPath] += 1;
      } else {
        similar[abstractPath] = 1;
      }
    }
    return similar;
  }, {});

  const gtNum = entries(countSimilar).filter(entry => entry[1] > num).reduce(
    (prev, entry) =>
      Object.assign({}, prev, {
        [entry[0]]: entry[1],
      }),
    {}
  );

  const repeatedPaths = Object.keys(gtNum);

  const filteredCount = {};
  const filteredUrls = urls.filter(url => {
    const pathname = urlParse(url.url).pathname;
    for (const path of repeatedPaths) {
      if (pathname.match(new RegExp(path))) {
        if (path in filteredCount) {
          if (filteredCount[path] < num) {
            filteredCount[path] += 1;
            return true;
          } else {
            return false;
          }
        } else {
          filteredCount[path] = 1;
        }
      }
    }
    return true;
  });

  return filteredUrls;
}
