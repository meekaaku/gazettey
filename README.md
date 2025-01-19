# Gazettey 

Full text search and AI summarise of Maldivian gazette. 



##  Cloning the project


```bash
# clone the repo
git clone https://github.com/meekaaku/gazzetey.git

# Rename .env.sample to .env and fill in the values
mv .env.sample .env

# Install dependencies
npm install

# Download pdfs from urls.txt
wget -P <path to documents> -i urls.txt
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.


## How it works roughly

1. After install, download the  pdf files from urls.txt and save to DOCUMENTS_FOLDER. /admin path is for admin tasks. 

2. Extract first page of pdf as image and save to image folder.  Then upload these to a CDN for faster loading. 

3. Extract pdf text and save to db.

4. Build typesense index 

4. When user searches, use typesense to get search result, show the first page of pdf image that was extracted 

5. When AI summarise requested, chunk the text and use Claude to summarise. Save the summary to db so next time you dont need to call Claude. 


## TODO

1. AI summary streaming

2. Chat with the the database



