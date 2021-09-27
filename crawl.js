import cheerio from "cheerio";
import { gotScraping } from "got-scraping";
import fs from "fs";
import HeaderGenerator from "header-generator";
// import got from 'got';
import path from "path";
let data = [];
// gotScraping.defaults.options.timeout.request = 90000
// gotScraping.defaults.options.http2 = false

const formatCategoryLink = (urlCategory) => {
  if (urlCategory.includes("https://dantri.com.vn")) return urlCategory;
  else if (urlCategory.includes("/") && urlCategory.includes(".htm")) {
    return `https://dantri.com.vn${urlCategory}`;
  } else if (urlCategory.includes("/") && !urlCategory.includes(".htm"))
    return `https://dantri.com.vn${urlCategory}.htm`;
  else return null;
};
const formatURLNews = (url, urlCategory) => {
  return `https://dantri.com.vn${urlCategory}${url}`;
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
    // gotScraping.get('https://apify.com')
    // .then( ({ body }) => console.log(body))

    const $ = cheerio.load(res.body);
    const news = $(".dropdown a")
      .map((i, t) => t.attribs.href)
      .get();
    return news;
  } catch (err) {
    console.log(err, "Error get categories");
  }
};
const crawlURLNews = async (urlCategory) => {
  try {
    const res = await gotScraping({
      url: `${formatCategoryLink(urlCategory)}`,
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
    },
    );
    const jsData = res.body;
    const $ = cheerio.load(jsData);
    const urlsNews = $(".news-item__title a")
      .map((i, url) => ({
        title: $(url).text(),
        link: formatURLNews(url.attribs.href, urlCategory),
      }))
      .get();
    return urlsNews;
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
    },
    );
    const jsData = res.body;
    const $ = cheerio.load(jsData);
    const date = $(".dt-news__time").text();
    return date;
  } catch (err) {
    console.log(err, "Error get date");
  }
};

const crawl = async () => {
  try {
    const categories = await crawlCategories("https://dantri.com.vn/");
    console.log(categories);
    categories.forEach(async (p) => {
      if (p != null && !p.includes("video-page") && !p.includes("javascript")) {
        let getNews = await crawlURLNews(p);
        getNews.forEach(async (b, i) => {
          let date = await getDate(b.link);
          data.push({ ...b, date });
          fs.writeFileSync("data.json", JSON.stringify(data));
        });
        // console.log(getDate(getNews.link))
        // let finalNews = {...getNews,date : getDate(getNews.link)}
      }
      // getNews.forEach(a => {
      //     console.log(a)
      //     console.log(getDate(a.link))
      // })
    });
  } catch (err) {
    console.log("Hello");
  }
};

crawl();
