
const chaptersSchema = {
    type: 'object',
    properties: {

        "Text": { type: 'string' },
        "Chapter": { type: 'integer', description: "Must be an integer greater than 1",minimun: 1 },
        "Volume": { type: 'integer', description: "Must be an integer greater than 1",minimum:1 },
        "CoverCharacters": { type: 'array', items: { type: 'string' } },
        "TotalPagesPerVolume": { type: 'string'},
        "VolumeTitle": { type: 'string' },
        "Cover": { type: 'string' },
        "id": { type: 'string',description:"It generates automatically so don't worry it's not required" }
    },
    "examples": [
        {
            "Text": "Romance Dawn - The Dawn of the Adventure",
            "Chapter": 1,
            "Volume": 1,
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