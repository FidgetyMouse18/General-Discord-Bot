## 📝 Table of Contents

- [About](#about)
- [Usage](#usage)
- [Getting Started](#getting_started)

## 🧐 About <a name = "about"></a>

General purpose discord bot I use in my personal servers. It has capabilities of playing back youtube videos and playlists, an assortment of fun features including fetching memes and a stock check from an old scraper of mine that has been since recycled.


## 🎈 Usage <a name = "usage"></a>

At current commands are as follows:

**Get Help:**
> !help

**Play Video:**
> !play youtube url or search

**Skip Video:**
> !skip

**Pause Video:**
> !pause

**Resume Video:**
> !resume

**Leave Voice:**
> !leave

**Create Avatar:**
> !avatar

**Flip Coin:**
> !coin

**Fetch Reddit Meme:**
> !meme

**Fetch HypeDC Stock:**
> !reporthypedc hypedc_url


## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
Node 16 or greater and Python 3.9 or greater must be installed prior.

Node Packages need to be installed beforehand using rather npm or yarn. 

NPM:
```
npm install
```

Yarn:
```
yarn
```

Python also needs to be installed and libraries install as follows.
```
pip install bs4
```
```
pip install xlsxwriter
```

### Installing

To install, simply compile the TypeScript code to JavaScript and run.

Compile TypeScript

```
tsc
```
To run simply execute index.js in the dist folder
```
node /dist/index.js
```
Alternatively you can use a system file on Linux such as [DiscordBot.service](DiscordBot.service)