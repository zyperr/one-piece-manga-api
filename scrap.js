import { launch } from "puppeteer"
//import { addToJson } from "./src/manageJson";
//import {addImages,openPageToGetImgs} from "./src/scrap/getImgs.js"
//import {getChaptersInfo} from "./src/scrap/getChapterInfo.js"
async function getChapters() {
    try {
        console.log("Launching browser")
        const browser = await launch({
            headless: false,
            protocolTimeout: 600000,
        });
        console.log("New page")
        const page = await browser.newPage();
        console.log("Setting navigation timeout")
        page.setDefaultNavigationTimeout(120000);
        console.log("Going to domain")
        await page.goto(domain);

        console.log("Evaluating page")
        const chapter = await page.evaluate(() => {
            console.log("Getting all links")
            const element = document.querySelectorAll("table tbody tr ul li > a");

            console.log("Filtering out nulls")
            const dataNoNulls = [...element].filter((el) => el != null && el.textContent != null && el.title != null)
            console.log("Filtering out non japanese chapters")
            const dataNormile = dataNoNulls.filter((el) => el.textContent != "?" && el.title != "wikipedia:Help:Japanese")
            console.log("Mapping data")
            const data = dataNormile.map((el, index) => {
                const pages = el.closest("tbody")?.childNodes[6]?.childNodes[7]
                const volTitle = el.closest("tbody")?.childNodes[6]?.childNodes[3]
                const vol = el.closest("tr").parentElement.firstChild.textContent.replace(/\n/g, "")
                //TODO : FIX THIS TO HANDLE PROPERLY UNDEFINED TYPES for pages and volTitle <--- DONE!
                if (el.title.match(/Chapter \d+/) && pages && volTitle) {
                    console.log(`Mapping chapter ${index}`)
                    if (pages.textContent && volTitle.textContent) {
                        return {
                            Text: el.textContent,
                            Chapter: parseInt(el.title.split(" ")[1]),
                            Volume: parseInt(vol.split(" ")[1]),
                            CoverCharacters: el.closest("tr").childNodes[3].childNodes[3].textContent.split("\n"),
                            TotalPagesPerVolume: parseInt(pages.textContent.replace(/\n/, "")),
                            VolumeTitle: volTitle.textContent.replace(/\n/, "")
                        }
                    }
                } else {
                    console.log(`Non chapter ${index}`)
                    return {
                        id: null,
                        Text: null,
                        Chapter: null,
                        Volume: null,
                        CoverCharacters: null,
                        VolumeTitle: "No provided",
                        TotalPagesPerVolume: 0
                    }
                }
            })
            console.log("Returning data")


            return {
                data,
            }
        })
        // console.log(chapter.data)
        console.log("Writing to json")
        await addToJson(chapter.data, readFolder);
        console.log("Closing browser")
        await browser.close();
        console.log("All Done here!")
    } catch (err) {
        console.error("Error happened", err)
    }
}

getChapters()