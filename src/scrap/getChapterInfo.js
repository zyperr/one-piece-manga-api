import { launch } from "puppeteer";

async function getChaptersInfo(domain) {
    try {
        console.log("Launching browser")
        let timea = 10000 * (1110 - 999)
        const browser = await launch({
            headless: true,
            protocolTimeout: timea,
        });
        console.log("New page")
        const page = await browser.newPage();
        console.log("Setting navigation timeout")
        page.setDefaultNavigationTimeout(timea);
        console.log("Going to domain")


        console.log("Evaluating page")

        let i = 999;

        while (i <= 1110) {
            await page.goto(`${domain}/wiki/Chapter_${i}`);

            const summaryChapter = await page.evaluate(() => {
                return document.querySelector("#Short_Summary")?.parentElement?.nextElementSibling?.textContent
            })
            const coverPageInfo = await page.evaluate(() => {
                return document.querySelector("#Cover_Page")?.parentElement.nextElementSibling?.textContent
            })
            const coverImage = await page.evaluate(() => {
                return document.querySelector(".image")?.childNodes[1]?.src
            })


            console.log("reading json")
            const dataJson = await readFile('./data.json', 'utf-8');
            console.log("Parsing json")
            const dataParse = JSON.parse(dataJson);
            console.log("Pushing data to parsed json")
            dataParse.Chapters.forEach((chapter) => {
                if (chapter.Chapter == i) {
                    chapter.Summary = summaryChapter
                    chapter.CoverPageInfo = coverPageInfo
                    chapter.Cover = coverImage
                }

            })
            console.log("Converting json to string")
            const newData = JSON.stringify(dataParse, null, 2);
            console.log("Writing json")
            try {
                await writeFile('data.json', newData, 'utf-8');
            } catch (e) {
                console.log(e)
            }
            console.log("Going back to list of chapters")
            i++;
        }
        console.log("Closing browser")
        await browser.close();
    } catch (e) {
        console.log(e)
    }
}

export { getChaptersInfo }