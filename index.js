const puppeteer = require('puppeteer');
var fs = require('fs');
const merge = require('easy-pdf-merge');

let browser = '';
let page = '';

let init = async () => {
    browser = await puppeteer.launch({
        headless: true
    });

    page = await browser.newPage();

    console.log("opening page");

    await page.goto('https://codeforces.com/contest/1263', {waitUntil: 'networkidle0'});

    const data = await page.$$eval('#pageContent > div.datatable > div:nth-child(6) > table', tds => tds.map(td => {
        return td.innerHTML;
    }))

    let dat = await page.$$('#pageContent > div.datatable > div:nth-child(6) > table > tbody > tr > td > div > div > a');

    console.log(dat.length);
    console.log(data.length);

    const propertyJsHandles = await Promise.all(
        dat.map(handle => handle.getProperty('href'))
    );
    const hrefs2 = await Promise.all(
        propertyJsHandles.map(handle => handle.jsonValue())
    );

    var pdfs = [];
    for (let i=0;i<hrefs2.length; ++i){
        await page.goto(hrefs2[i] , {waitUntil: 'networkidle0'});
        console.log('Went to ', i)
        const pdf = await page.pdf({path: 'problem' + i + '.pdf', format: 'A4'});
        // const pdf = await page.pdf({format: 'A4'});
        pdfs.push('problem' + i + '.pdf');
    }
    merge(pdfs, 'ProblemOutput.pdf', (err) => {
        if (err)console.log(err);
        else {
            for (let i=0;i<hrefs2.length; ++i){
                fs.unlink('problem' + i + '.pdf', (err) => {
                    if (err) console.log(err);
                    else console.log('problem' + i + '.pdf', "deletion success");
                });
            } 
            console.log("Success");
        }
    })

    console.log(hrefs2)

    await browser.close()
    return;
}

init().then(() => {}).catch((error) => console.log(error));