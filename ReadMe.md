
# API - One Piece - manga

A One piece API that provides you all the current chapter and volumes to 109 with the amount of pages,title,cover,volume title and other.




## Appendix

The information is extracted from <a href="https://onepiece.fandom.com/wiki/Chapters_and_Volumes/Volumes">One Piece wiki</a> by scrapping it with puppeter and it stores on a json file.Besides, the api it's built with express.js and node.js.

## Run Locally

Clone the project

```bash
  git clone https://github.com/zyperr/one-piece-manga-api.git
```

Go to the project directory

```bash
  cd one-piece-manga-api
```

Install dependencies

```bash
  npm install
```
or if you're using yarn
```bash
  yarn install
```
Start the server

```bash
  npm run dev
```
or
```bash
  yarn run dev
```


## API Reference
### little thing you'll need to know.
cover of the volumes are represent by the following way /static/imgs/Volume 109.png basically you must add the current url of your local host or where the api is located I mean the server. e.g. http://localhost:8080/static/imgs/Volume%201.png, http://{url}/static/imgs/Volume%201.png so as a result you'll able to show the images
#### Get all items

```http
  GET /api/chapters
```
### query Parameters
| Parameter | Type     | Description                | optional |min |max |default |pattern |
| :-------- | :------- | :------------------------- |:-------- |:-------- |:-------- |:-------- |:-------- |
| `page` | `integer` | select a page | `true` | `1` |`111` |`1` |`-` |
| `perPage` | `integer` | select the amount of elements per page| `true` |`1` |`10` |`10` |`-` |
| `volume` | `string` | select a specific volume | `true` |`-` |`-` |`-` |`v/Volume_{number}` |


#### Get volume

```http
  GET /api/chapters/:id
```
### path Parameters
| Parameter | Type     | Description                       | optional |
| :-------- | :------- | :-------------------------------- | :------- |
| `id`      | `string` | **Required**. Id of item to fetch | `false` |

### Post volume

 **Endpoint**: /api/chapters 
 </br>
 **Content-Type**: multipart/form-data

#### Body 
```javascript
   {
       "Text": { type: 'string' },
        "Chapter": { type: 'string', pattern: /Chapter \d+/, description: "Must start with Chapter and end with a number.It's case sensitive so make sure you write down Chapter instead of chapter" },
        "Volume": { type: 'string', pattern: /Volume \d+/, description: "Must start with Volume and end with a number. It's case sensitive so make sure you write down Volume instead of volume" },
        "CoverCharacters": { type: 'array', items: { type: 'string' } },
        "TotalPagesPerVolume": { type: 'string'},
        "VolumeTitle": { type: 'string' },
        "Cover": { type: 'file' },
        "id": { type: 'string',description:"It generates automatically so don't worry it's not required" }
    }
```
#### Request example
```http
    HTTP/1.1 201 Created
````

```json
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
````