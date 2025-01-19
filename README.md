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
