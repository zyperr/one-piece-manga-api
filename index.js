import {pagination} from "./src/utils.js"
import { readJson,getChapterById } from "./src/manageJson.js"
import chaptersSchema from "./src/schema/Chapters.js"
import { validate } from "jsonschema"
import { readFile, writeFile } from "fs/promises"
import express from "express"
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


app.get("/", (req, res) => {
    res.send({
        message: "Welcome to One Piece API",
        description:"A One piece API that provides you all the current chapter and volumes to 109 with the amount of pages,title,cover,volume title and other information.",
        urls:[
            {
                url:`http://localhost:${port}/api/chapters`,
                description:"Get all chapters",
                method:"Get"
            },
            {
                url:`http://localhost:${port}/api/chapters/:id`,
                description:"Get a specific chapter",
                method:"Get"
            },
            {
                url:`http://localhost:${port}/api/chapters`,
                description:"Create a new chapter",
                method:"Post"
            }
        ]
    })
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

