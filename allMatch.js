const request = require('request')
const cheerio = require('cheerio')

const scorecardObj = require('./scorecard')
function getAllMatchLinks(uri) {

    request(uri, function (err, response, html) {

        if (err) {
            console.error(err);
        } else {
            extractAllLink(html)
        }
    })
}

function extractAllLink(html) {

    let $ = cheerio.load(html)

    let scoreCardArr = $('a[data-hover="Scorecard"]')

    for (let i = 0; i < scoreCardArr.length; i++) {

        let link = $(scoreCardArr[i]).attr("href")
        let fullLink = "https://www.espncricinfo.com/" + link

        //console.log( i+1);
        scorecardObj.ps(fullLink)
    }
}

module.exports = {
    getAllMatch : getAllMatchLinks
}