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

const formatCategoryLink = (urlCategory, date) => {
  if (urlCategory.includes("https://dantri.com.vn")) return urlCategory;
  else if (urlCategory.includes("/") && urlCategory.includes(".htm")) {
    urlCategory = urlCategory.replace('.htm', '')
    return `https://dantri.com.vn${urlCategory}${date ? '/' + date : ''}` + '.htm';
  }
  else return null;
};
const formatURLNews = (url, urlCategory) => {
  return `https://dantri.com.vn${urlCategory}${url}`;
};
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
    console.log(res.body)
    const html = parse(res.body)
    const news = html
      .querySelectorAll(".dropdown ~ a")
      .map(t => t.attributes.href)
      .filter((t) => !t.includes("javascript:"))
      .concat(html.querySelectorAll("#site-dropdown__content a")
      .map((t) => t.attributes.href));
    return news
  } catch (err) {
    console.log(err, "Error get categories");
  }
};
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
      console.log(html)
      let news = html
      .querySelectorAll(".news-item__title > a")
      .map((url) => ({
        title: url.text,
        url: formatURLNews(url.attributes.href, urlCategory),
      }))
      // console.log(html
      //   .querySelectorAll(".news-item__title"),'Hello 2')
      urlNews = [...urlNews,...news]
      
      // let d = $(".news-item__title a")
      // .map((i, url) => ({
      //   title: $(url).text(),
      //   url: formatURLNews(url.attribs.href, urlCategory),
      // }))
      // .get()
      await wait(1000)
    }
    return urlNews;
  } catch (err) {
    console.log(err, "Error get url link1 1 site");
  }
};

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
    const date = html.querySelector(".dt-news__time").text;
    return date;
  } catch (err) {
    console.log(err, "Error get date");
  }
};
export { crawlCategories, crawlURLNews, getDate, wait, get30days };
