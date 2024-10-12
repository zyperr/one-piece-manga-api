import { json } from 'express';
import { writeFile, readFile } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

async function readJson(page, perPage, pagination, perVolume) {
    try {
        const data = await readFile('./data.json', 'utf-8');
        const dataParse = JSON.parse(data);
        const dataJson = pagination(dataParse.Chapters, page, perPage)
        if (perVolume != undefined) {
            const filtered = dataParse.Chapters.filter((item) => {
                let Volume = perVolume.replace("_", " ")
                return item.Volume == Volume
            })
            return {
                data: filtered,
                totalItems: filtered.length,
                pages: 1,
                dataPerPage: filtered.length,
                currentPage: 1
            }
        } else {
            return {
                data: dataJson.elements,
                totalItems: dataJson.totalItems,
                pages: dataJson.pages,
                dataPerPage: dataJson.itemPerPage,
                currentPage: dataJson.currentPage
            }
        }
    } catch (err) {
        console.log(err)
    }
}


async function addToJson(data, readFolder) {
    if (!data) {
        throw new Error("addToJson: data is null or undefined");
    }
    try {
        const jsonData = data.filter((item) => item !== null && item.Text !== null && item.Volume !== null && item.Chapter !== null);
        const files = await readFolder();
        for (const file of files) {
            for (const el of jsonData) {

                if ((await file).name == el.Volume) {
                    el.Cover = (await file).filePath
                    el.id = uuidv4()
                }
            }
        }
        await writeFile('data.json', JSON.stringify({ Chapters: jsonData }, null, 2), "utf-8");
        console.log("Data Json created");
    } catch (err) {
        console.error("addToJson: Error happened", err);
    }
}


async function getChapterById(id) {
    const item = await readFile('./data.json', 'utf-8');
    const itemParse = JSON.parse(item);
    const itemJson = itemParse.Chapters.find((item) => item.id == id);
    return itemJson
}

async function addID(){
    const item = await readFile('./data.json', 'utf-8');
    const itemParse = JSON.parse(item);
    for (const el of itemParse.Chapters) {
        el.id = uuidv4()
    }
    await writeFile('data.json', JSON.stringify({ Chapters: itemParse.Chapters }, null, 2), "utf-8");
    console.log("Data Json created");
}

export {
    readJson,
    addToJson,
    getChapterById,
    addID
}