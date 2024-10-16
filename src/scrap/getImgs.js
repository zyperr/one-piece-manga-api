import { launch } from "puppeteer";
import {readdir} from "fs/promises"
import path from "path";

let maxVolumes = 109;
let countVolumes = 0;
async function openPageToGetImgs(domain,) {
    const browser = await launch({
        headless: false,
        slowMo: 400,
        protocolTimeout: 600000
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);

    console.log(`Attempting to go to ${domain}`)
    await page.goto(domain);
    while (countVolumes <= maxVolumes) {
        console.log(`Attempting to obtain element for volume ${countVolumes}`)
        try {
            console.log(`Attempting to obtain element ${countVolumes}`)
            const element = await obtainElementImg(page, countVolumes)
            if (!element) {
                console.log(`ERROR: Could not obtain element for volume ${countVolumes}`)
            } else if (element !== null && element !== undefined) {
                const { href, alt } = element;
                await takeScreenshot(page, href, alt)
            } else {
                console.log(`ERROR: null or undefined element for volume ${countVolumes}`)
            }
            await page.goBack();
        } catch (err) {
            console.log(err)
            console.log(`Attempting to go back to ${domain}`)
            await page.goto(domain)
        }
        countVolumes++;
    }

    console.log(`Closing browser`)
    await browser.close();
}

async function obtainElementImg(page, volume) {
    try {
        await page.waitForSelector(`p > a img[alt="Volume ${volume}"]`, { timeout: 60000 });

        const imageUrl = await page.evaluate((volume) => {
            console.log(volume)
            const imgs = document.querySelector(`p > a img[alt="Volume ${volume}"]`)

            if (!imgs) {
                console.log(`ERROR: Could not find image element for volume ${volume}`)
                return null
            }

            return {
                href: imgs.parentElement.href,
                alt: imgs.alt,
            }
        }, volume)

        if (!imageUrl) {
            console.log(`ERROR: Could not obtain element for volume ${volume}`)
            return null
        } else {
            console.log(`Element obtained for volume ${volume}`)
            return imageUrl
        }

    } catch (err) {
        if (err instanceof TimeoutError) {
            console.log("Timed out")
        } else {
            throw err
        }
    }

}


async function takeScreenshot(page, href, alt) {
    try {
        console.log(`Attempting to take screenshot of ${alt}`)
        console.log(`Going to ${href}`)
        await page.goto(href)
        console.log(`Waiting for image to be loaded`)
        await page.waitForSelector('body img');
        console.log(`Saving screenshot at ./imgs/${alt}.png`)
        const screenShot = await page.screenshot({ path: `./imgs/${alt}.png`, type: 'png', fullPage: true, captureBeyondViewport: false })
        console.log(`Screenshot taken for ${alt}`)
    } catch (err) {
        if (err instanceof TimeoutError) {
            console.log("Timed out")
        } else {
            throw err
        }
    }

}

async function addImages(){
    const folder = "./public/imgs"
    const files = await readdir(folder)

    const items = await readFile('./data.json', 'utf-8');
    const itemsParse = JSON.parse(items);
    for (const el of itemsParse.Chapters) {
        for (const file of files) {
            const fileNumber = parseInt(file.split(" ")[1].replace(".png", ""))
            if (el.Volume == fileNumber) {
                const pathToImage = path.join(folder, file).replace(/\\/g, "/").replace("public", "/static")
                el.Cover = pathToImage
            }
        }
    }
    await writeFile('data.json', JSON.stringify({ Chapters: itemsParse.Chapters }, null, 2), "utf-8");
}

export {
    openPageToGetImgs,
    addImages
}