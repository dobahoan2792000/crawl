import Post from '../models/post.js'
import { crawlCategories, crawlURLNews, getDate, wait, get30days } from "../../utils/crawl.js";

const crawl30 = async(req,res) => {
    try {
        const categories = await crawlCategories("https://dantri.com.vn/");
        console.log(categories);
        for (const category of categories) {
          if (
            category != null &&
            !category.includes("video-page") &&
            !category.includes("javascript")
          ) {
            let getNews = await crawlURLNews(category);
            for (const news of getNews) {
              console.log("DATE1");
              console.log(news.url)
              let date = await getDate(news.url);
              console.log(date, "---Hello");
              console.log("DATE2");
              const post = new Post({
                title: news.title,
                url: news.url,
                dateNews: date,
              });
              post.save();
              await wait(10000);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
}

export { crawl30 }