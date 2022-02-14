// const url = "https://www.espncricinfo.com//series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard"


const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')


function processScoreCard(url) {
    request(url, cb)
}

function cb(err, response, html) {

    if (err)
        console.error(err);
    else
        extractMatchDetails(html)
}

function extractMatchDetails(html) {

    let $ = cheerio.load(html)

    let descString = $('.header-info .description ');
    let descStringarr = descString.text().split(',')
    let result = $('.match-info.match-info-MATCH.match-info-MATCH-half-width .status-text').text()


    let venue = descStringarr[1].trim()
    let date = descStringarr[2].trim()

    console.log(venue);
    console.log(date);
    console.log(result);

    console.log("````````````````````````````````````");

    let innings = $('.card.content-block.match-scorecard-table .Collapsible')

    let htmlString = ''

    for (let i = 0; i < innings.length; i++) {
        htmlString += $(innings[i]).html();

        let teamName = $(innings[i]).find('h5').text()
        teamName = teamName.split('INNINGS')[0].trim()

        let opponentIdx = i == 0 ? 1 : 0;
        opponentName = $(innings[opponentIdx]).find('h5').text()
        opponentName = opponentName.split('INNINGS')[0].trim()

        //console.log(teamName, opponentName);

        let cInning = $(innings[i])

        let allRows = cInning.find('.table.batsman tbody tr')

        for (let j = 0; j < allRows.length; j++) {
            let allCols = $(allRows[j]).find('td')
            let isWorthy = $(allCols[0]).hasClass('batsman-cell')

            if (isWorthy) {

                let playerName = $(allCols[0]).text().trim()
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let STR = $(allCols[7]).text().trim();

                console.log(`${playerName} | ${runs} | ${balls} | ${fours} | ${sixes} | ${STR}`);

                processPlayer(teamName, opponentName, playerName, runs, balls, fours, sixes, STR, venue, date, result)

            }

        }
        console.log("``````````````````````````````````````````````````");
        //console.log(allRows.text());
    }
    //console.log(htmlString);
}

function processPlayer(teamName, opponentName, playerName, runs, balls, fours, sixes, STR, venue, date, result) {

    let teamPath = path.join(__dirname, "IPL", teamName)
    dirCreator(teamPath)

    let filePath = path.join(teamPath, playerName + ".xlsx")

    let content = excelReader(filePath, playerName)

    let playerObj = {
        teamName, opponentName, playerName, runs, balls, fours, sixes, STR, venue, date, result
    }
    content.push(playerObj)

    excelWriter(filePath, playerName, content)
}

function dirCreator(filePath) {

    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}

function excelWriter(fileName, sheetName, jsonData) {
    let newWB = xlsx.utils.book_new();
    // Creating a new WorkBook
    let newWS = xlsx.utils.json_to_sheet(jsonData);
    // Json is converted to sheet format (rows and cols)
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, fileName);
}

function excelReader(fileName, sheetName) {
    if (fs.existsSync(fileName) == false) {
        return [];
    }
    let wb = xlsx.readFile(fileName);

    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans
}

module.exports = {
    ps: processScoreCard
}