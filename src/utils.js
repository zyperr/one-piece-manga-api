import { launch } from "puppeteer";
import path from "path";
import { readdir } from "fs/promises";

const folderPath = "./public/imgs";
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



async function readFolder() {
    const files = await readdir(folderPath);
    const f = files.map(async (file) => {
        const filePath = path.join(folderPath, file);
        return {
            filePath: filePath,
            ext: path.extname(filePath),
            name: path.basename(filePath).replace(path.extname(filePath), ''),
        }
    })
    return f
}

function pagination(data, page = 1, perPage = 10) {
    if (perPage > 10) {
        throw new Error("Maximun perPage is 10")
    } else if (page > data.length || page < 1) {
        throw new Error("Page not found")
    }
    const start = (page - 1) * perPage // 1 -1 * 10 = 0
    const end = page * perPage // 1 * 10 = 10
    const elements = data.slice(start, end)
    const pages = Math.ceil(data.length / perPage)
    return {
        elements,
        pages,
        itemPerPage:perPage,
        totalItems: data.length,
        currentPage:page
    }
}



export {
    openPageToGetImgs,
    readFolder,
    pagination
}