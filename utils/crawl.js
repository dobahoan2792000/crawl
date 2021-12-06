import { gotScraping } from 'got-scraping'
import moment from 'moment'
import pkg from 'node-html-parser'
import cheerio from 'cheerio'
const { parse } = pkg
import fs from 'fs'
// import got from 'got';
function wait (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}
const filter1 = ['i6=1812343','i11=1814493','i8=1812351','i10=1814492','i9=1812352','i7=1812350','i13=1820662','i12=1816475']
const filter2 = ['i14=1820663','i15=1821816']
const filter3 = ['i16=1821814','i17=1821810','i18=1821809']
// format ve dung link category can fetch
const formatCategoryLink = (urlCategory, fil1,fil2,fil3) => {
  return `http://capelli.store.nhanh.vn${urlCategory}?${fil1}&${fil2}&${fil3}`
}
// format ve dang url link bai viet dung
// const formatURLNews = (url, urlCategory) => {
//   return `https://dantri.com.vn${url}`
// }
// lay 30 ngay tinh tu ngay hien tai tro ve
// const get30days = () => {
//   var date = new Date()
//   var alldays = []
//   while (alldays.length < 30) {
//     var d = moment(date).format('D-M-YYYY')
//     alldays.push(d)
//     date.setDate(date.getDate() - 1)
//   }
//   return alldays
// }
// const getToday = () => {
//   var date = new Date()
//   var dateFormat = moment(date).format('D-M-YYYY')
//   return dateFormat
// }
// cao categories
const crawlCategories = async (url) => {
  try {
    const res = await gotScraping({
      url: `${url}`
     
    })
    const html = await parse(res.body)
    
    const categories = html
      .querySelectorAll('.sub-menu li > a')
      .map(t => t.attributes.href)
    return categories
  } catch (err) {
    console.log(err, 'Error get categories')
  }
}
const getImage = async (html) => {
  
  return imgSrc
}
const crawlChoosMe = async () => {
  let productList = []
  const categories = await crawlCategories("http://capelli.store.nhanh.vn/")
  for(const category of categories){
    for(const fil1 of filter1){
      for(const fil2 of filter2){
        for(const fil3 of filter3){
          console.log(formatCategoryLink(category,fil1,fil2,fil3))
          const res = await gotScraping({
            url: formatCategoryLink(category,fil1,fil2,fil3)
          })
          const $ = await cheerio.load(res.body)
          const products = $('.product-list .product-item-col').each(function (index,element){
            const img = $(element).find('img').attr('data-src')
            const name = $(element).find('.product-title').text()
            const price = $(element).find('.product-price .product-price-current').text().trim()
            const priceSale = $(element).find('.product-price .product-price-old') ? $(element).find('.product-price .product-price-old').text() : ''
            const sale = $(element).find('.boxTagIcon .tagProItem') ? $(element).find('.boxTagIcon .tagProItem').text().trim() : ''
            productList.push({
              image: img,
              name: name.replace('\n',''),
              price: priceSale,
              priceSale: price,
              sale: sale.replace('\n',''),
              fil1: fil1,
              fil2: fil2,
              fil3: fil3,
              urlCategory: formatCategoryLink(category,fil1,fil2,fil3)
            })
          })
        }
      }
    }
  }
  
  return productList

}
const data= await crawlChoosMe()
console.log(data)
fs.writeFileSync('data.json', JSON.stringify(data), (err) => {
  console.log(err)
})
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
// export { crawlCategories, crawlURLNews, getData, wait, get30days }


// getData('https://dantri.com.vn/xa-hoi/hon-70-ngay-dem-ha-noi-chong-giac-covid19-20211005084647585.htm')