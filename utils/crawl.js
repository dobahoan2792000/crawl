import { gotScraping } from 'got-scraping'
import moment from 'moment'
import pkg from 'node-html-parser'
const { parse } = pkg
// import got from 'got';
function wait (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}
// format ve dung link category can fetch
const formatCategoryLink = (urlCategory, date) => {
  if (urlCategory.includes('https://dantri.com.vn')) return urlCategory
  else if (urlCategory.includes('/') && urlCategory.includes('.htm')) {
    urlCategory = urlCategory.replace('.htm', '')
    return `https://dantri.com.vn${urlCategory}${date ? '/' + date : ''}` + '.htm'
  } else return null
}
// format ve dang url link bai viet dung
const formatURLNews = (url, urlCategory) => {
  return `https://dantri.com.vn${url}`
}
// lay 30 ngay tinh tu ngay hien tai tro ve
const get30days = () => {
  var date = new Date()
  var alldays = []
  while (alldays.length < 30) {
    var d = moment(date).format('D-M-YYYY')
    alldays.push(d)
    date.setDate(date.getDate() - 1)
  }
  return alldays
}
const getToday = () => {
  var date = new Date()
  var dateFormat = moment(date).format('D-M-YYYY')
  return dateFormat
}
// cao categories
const crawlCategories = async (url) => {
  try {
    const res = await gotScraping({
      url: `${url}`,
      headerGeneratorOptions: {
        browsers: [
          {
            name: 'chrome',
            minVersion: 87,
            maxVersion: 89
          }
        ],
        devices: ['desktop'],
        locales: ['de-DE', 'en-US'],
        operatingSystems: ['windows', 'linux']
      }
    })
    const html = parse(res.body)
    const categories = html
      .querySelectorAll('.dropdown > a')
      .map(t => t.attributes.href)
      .filter((t) => !t.includes('javascript:'))
      .concat(html.querySelectorAll('#site-dropdown__content a')
        .map((t) => t.attributes.href))
    return categories
  } catch (err) {
    console.log(err, 'Error get categories')
  }
}
const crawlLastest = async (url) => {
  try {
    const res = await gotScraping({
      url: `${url}`,
      headerGeneratorOptions: {
        browsers: [
          {
            name: 'chrome',
            minVersion: 87,
            maxVersion: 89
          }
        ],
        devices: ['desktop'],
        locales: ['de-DE', 'en-US'],
        operatingSystems: ['windows', 'linux']
      }
    })
    const html = parse(res.body)
    const news = await html
      .querySelectorAll('.col--highlight-news .news-item__title > a')
      .map(t => t.attributes.href)
    return news
  } catch (err) {
    console.log(err, 'Error get categories')
  }
}
// cao cac link bai viet trong categories
const crawlURLNews = async (urlCategory) => {
  try {
    console.log(urlCategory)
    // var urlNews = []
    // const aMonth = get30days()
    // for (const date of aMonth) {

    //   // .map((url) => ({
    //   //   title: url.text,
    //   //   url: formatURLNews(url.attributes.href, urlCategory),
    //   // }))
    //   urlNews = urlNews.concat(news)
    //   await wait(1000)
    // }
    const res = await gotScraping({
      url: `${urlCategory}`,
      headerGeneratorOptions: {
        browsers: [
          {
            name: 'chrome',
            minVersion: 87,
            maxVersion: 89
          }
        ],
        devices: ['desktop'],
        locales: ['de-DE', 'en-US'],
        operatingSystems: ['windows', 'linux']
      }
    })
    const html = parse(res.body)

    const news = html
      .querySelectorAll('.news-item__title > a')
      .map(p => {
        // const link = (p.structuredText + '</a>').trim()
        // const parseLink = parse(link)

        return ({
          title: p.text,
          url: formatURLNews(p.attributes.href)
        })
      })
    return news
  } catch (err) {
    console.log(err, 'Error get url link1 1 site')
  }
}
// crawl date trong bai viet
const getDate = (html) => {
  let date = html.querySelector('.dt-news__time')?.text
  if (!date) {
    date = html.querySelectorAll('.e-magazine__meta .e-magazine__meta-item')[1]?.text
  }
  return date
}
const getImages = (html) => {
  let images = html.querySelectorAll('.image > img').map(p => p.attributes.src)
  // console.log(html.querySelectorAll('.image > img'))
  return images

}
const getContent = (html) => {
  let content = html.querySelectorAll('.dt-news__content > p').filter(p => !p.attributes.style).map(p => p.text).join(' ')
  return content
}
const getDesc = (html) => {
  let desc = html.querySelector('.dt-news__sapo > h2') ? html.querySelector('.dt-news__sapo > h2').text : ''
}
const getData = async (urlNews) => {
  try {
    const res = await gotScraping({
      url: `${urlNews}`,
      headerGeneratorOptions: {
        browsers: [
          {
            name: 'chrome',
            minVersion: 87,
            maxVersion: 89
          }
        ],
        devices: ['desktop'],
        locales: ['de-DE', 'en-US'],
        operatingSystems: ['windows', 'linux']
      }
    })
    const html = parse(res.body)
    console.log(getContent(html))
    return {
      date: getDate(html),
      images: getImages(html),
      content: getContent(html),
      description : getDesc(html)
    }
  } catch (err) {
    console.log(err, 'Error get date', urlNews)
  }
}
export { crawlCategories, crawlURLNews, getData, wait, get30days }


getData('https://dantri.com.vn/xa-hoi/hon-70-ngay-dem-ha-noi-chong-giac-covid19-20211005084647585.htm')