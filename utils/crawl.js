import { gotScraping } from "got-scraping";
import moment from "moment";
import pkg from 'node-html-parser'
const { parse } = pkg
// import got from 'got';
function wait(ms) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}
// format ve dung link category can fetch
const formatCategoryLink = (urlCategory, date) => {
  if (urlCategory.includes("https://dantri.com.vn")) return urlCategory;
  else if (urlCategory.includes("/") && urlCategory.includes(".htm")) {
    urlCategory = urlCategory.replace('.htm', '')
    return `https://dantri.com.vn${urlCategory}${date ? '/' + date : ''}` + '.htm';
  }
  else return null;
};
// format ve dang url link bai viet dung
const formatURLNews = (url, urlCategory) => {
  return `https://dantri.com.vn${url}`;
};
// lay 30 ngay tinh tu ngay hien tai tro ve
const get30days = () => {
  var date = new Date();
  var all_days = [];
  while (all_days.length < 30) {
    var d = moment(date).format("D-M-YYYY");
    all_days.push(d);
    date.setDate(date.getDate() - 1);
  }
  return all_days;
};
// cao categories
const crawlCategories = async (url) => {
  try {
    const res = await gotScraping({
      url: `${url}`,
      headerGeneratorOptions: {
        browsers: [
          {
            name: "chrome",
            minVersion: 87,
            maxVersion: 89,
          },
        ],
        devices: ["desktop"],
        locales: ["de-DE", "en-US"],
        operatingSystems: ["windows", "linux"],
      },
    });
    const html = parse(res.body)
    const categories = html
      .querySelectorAll(".dropdown > a")
      .map(t => t.attributes.href)
      .filter((t) => !t.includes("javascript:"))
      .concat(html.querySelectorAll("#site-dropdown__content a")
      .map((t) => t.attributes.href));
    return categories
  } catch (err) {
    console.log(err, "Error get categories");
  }
};
// cao cac link bai viet trong categories
const crawlURLNews = async (urlCategory) => {
  try {
    console.log(urlCategory)
    var urlNews = []
    let aMonth = get30days()
    for(const date of aMonth)
    {
      const res = await gotScraping({
        url: `${formatCategoryLink(urlCategory,date)}`,
        headerGeneratorOptions: {
          browsers: [
            {
              name: "chrome",
              minVersion: 87,
              maxVersion: 89,
            },
          ],
          devices: ["desktop"],
          locales: ["de-DE", "en-US"],
          operatingSystems: ["windows", "linux"],
        },
      });
      const html = parse(res.body)

      let news = html
      .querySelectorAll(".news-item__title")
      .map(p => {
        let link = (p.structuredText + "</a>").trim()
        let parseLink = parse(link)
        return ({
          title: parseLink.childNodes[0].text,
          url: formatURLNews(parseLink.childNodes[0].attributes.href)
        })
      })
      // .map((url) => ({
      //   title: url.text,
      //   url: formatURLNews(url.attributes.href, urlCategory),
      // }))
      urlNews = urlNews.concat(news)
      await wait(1000)
    }
    return urlNews;
  } catch (err) {
    console.log(err, "Error get url link1 1 site");
  }
};
// crawl date trong bai viet
const getDate = async (urlNews) => {
  try {
    const res = await gotScraping({
      url: `${urlNews}`,
      headerGeneratorOptions: {
        browsers: [
          {
            name: "chrome",
            minVersion: 87,
            maxVersion: 89,
          },
        ],
        devices: ["desktop"],
        locales: ["de-DE", "en-US"],
        operatingSystems: ["windows", "linux"],
      },
    });
    const html = parse(res.body);
    let date = html.querySelector(".dt-news__time")?.text;
    if(!date){
      date = html.querySelectorAll(".e-magazine__meta .e-magazine__meta-item")[1].text
    }

    return date;
  } catch (err) {
    console.log(err, "Error get date");
  }
};
export { crawlCategories, crawlURLNews, getDate, wait, get30days };

