import crawlRouter from './Crawl.js'
function route(app){
    app.use('/crawl', crawlRouter)
}
export default route