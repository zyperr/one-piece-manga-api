import { openPageToGetImgs, readFolder, pagination } from "./src/utils.js"
import { readJson, addToJson, getChapterById } from "./src/manageJson.js"
import chaptersSchema from "./src/schema/Chapters.js"
import { validate } from "jsonschema"
import { readFile, writeFile } from "fs/promises"
import express from "express"
import { launch } from "puppeteer"
import { fileURLToPath } from "url";
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { query, validationResult } from "express-validator";
const domain = "https://onepiece.fandom.com/wiki/Chapters_and_Volumes/Volumes";

const app = express();
const port = 8080;
const dirname = fileURLToPath(new URL('.', import.meta.url));
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/imgs')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Image type not allowed'))
        }
        if (!file.originalname.match(/Volume \d+/)) {
            return cb(new Error('Name of the image must contain Volume + numbers'))
        }
        cb(null, true)
    }
})
//static
app.use('/static', express.static(`${dirname}/public`));
//settings
app.set('port', process.env.PORT || port);
app.set('json spaces', 2);
//middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json());








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
                //TODO : FIX THIS TO HANDLE PROPERLY UNDEFINED TYPES for pages and volTitle <--- DONE!
                if (el.title.match(/Chapter \d+/) && pages && volTitle) {
                    console.log(`Mapping chapter ${index}`)
                    if (pages.textContent && volTitle.textContent) {
                        return {
                            Text: el.textContent,
                            Chapter: el.title,
                            Volume: el.closest("tr").parentElement.firstChild.textContent.replace(/\n/g, ""),
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

//TODO: CREAR JSON Y AGREGAR DATOS AUTOMATICAMENTE <--- DONE!!!

// Creates the pagination function to get a certain number of pages
// Maximun perPage 10



//getChapters(); //<--- Obtain all volumes and theirs data such as cover images,title and others
//Use this to get screenshots of all volumes (If needed run again to get all volumes correctly)
//openPageToGetImgs(domain);




app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.get("/api/chapters", [query("page").optional().toInt().default(1), query("perPage").optional().toInt().default(10), query("volume").optional().isString().matches(/[V-v]olume_\d+/).withMessage("Name of the volume must contain Volume + numbers e.g. Volume_1").default("")], async (req, res) => {
    let page = req.query.page;
    let perPage = req.query.perPage
    let volume = req.query.volume
    const { data, totalItems, pages, dataPerPage, currentPage } = await readJson(page, perPage, pagination,volume).finally(() => console.log("finished")); //<--- read json file and organize it in pages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const items = {
        chapters: data,
        totalItems,
        pages,
        dataPerPage,
        currentPage
    }
    if (items.dataPerPage == 0) {
        res.status(404).json({
            error: "No items found"
        })
    }
    res.json(items)

})


app.get("/api/chapters/:id", async (req, res) => {
    const id = req.params.id;
    const chapter = await getChapterById(id);
    if (!chapter) {
        res.status(404).json({
            error: "chapter not found",
            id: `${id} not found`
        })
    }else if(id == null){
        res.status(404).json({
            error: "Id must not be null or undefined"
        })
    }
    res.json(chapter);
})

app.post("/api/chapters", upload.single("Cover"), async (req, res) => {
    const result = validate(req.body, chaptersSchema);
    if (!result.valid) {
        return res.status(400).json({
            error: result.errors[0].message
        })
    }
    const chapter = req.body
    chapter["id"] = uuidv4()
    chapter["Cover"] = req.file.path.replace(/\\/g, "/")
    chapter["Cover"] = chapter["Cover"].replace("public", "/static")
    chapter["TotalPagesPerVolume"] = parseInt(chapter["TotalPagesPerVolume"])
    const data = await readFile('./data.json', 'utf-8');
    const dataParse = JSON.parse(data);
    dataParse.Chapters.push(chapter)
    const newData = JSON.stringify(dataParse, null, 2);
    await writeFile('data.json', newData, 'utf-8');
    res.json(chapter)
    res.status(201).end();
})

app.listen(app.get('port'), () => {
    console.log(`Example app listening on port http://localhost:${app.get('port')}`)
})

