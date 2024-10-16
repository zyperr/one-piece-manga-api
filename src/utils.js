import path from "path";
import { readdir } from "fs/promises";

const folderPath = "./public/imgs";


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
        itemPerPage: perPage,
        totalItems: data.length,
        currentPage: page
    }
}



export {
    readFolder,
    pagination,
    getChaptersInfo
}