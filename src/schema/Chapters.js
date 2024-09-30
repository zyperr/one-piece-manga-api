
const chaptersSchema = {
    type: 'object',
    properties: {

        "Text": { type: 'string' },
        "Chapter": { type: 'string', pattern: /Chapter \d+/, description: "Must start with Chapter and end with a number.It's case sensitive so make sure you write down Chapter instead of chapter" },
        "Volume": { type: 'string', pattern: /Volume \d+/, description: "Must start with Volume and end with a number. It's case sensitive so make sure you write down Volume instead of volume" },
        "CoverCharacters": { type: 'array', items: { type: 'string' } },
        "TotalPagesPerVolume": { type: 'string'},
        "VolumeTitle": { type: 'string' },
        "Cover": { type: 'string' },
        "id": { type: 'string',description:"It generates automatically so don't worry it's not required" }
    },
    "examples": [
        {
            "Text": "Romance Dawn - The Dawn of the Adventure",
            "Chapter": "Chapter 1",
            "Volume": "Volume 1",
            "CoverCharacters": [
                "Monkey D. Luffy",
                "Roronoa Zoro",
                "Nami"
            ],
            "TotalPagesPerVolume": 216,
            "VolumeTitle": "Romance Dawn",
            "Cover": "/static/imgs/Volume 1.png",
            "id": "3b9017d4-215a-4903-81fd-7900cb9ebbce"
        }
    ],

    required: ['Text', 'Chapter', 'Volume', 'CoverCharacters', 'TotalPagesPerVolume', 'VolumeTitle']
}

export default chaptersSchema