# Downlaod Defenders!

William Lane Craig teaches a systematic theology class in his local church called _[Defenders](https://www.reasonablefaith.org/podcasts/defenders-podcast-series-3)_. I went through series 1 years ago and it changed my life. You'd be better off going through Defenders than getting a typical seminary degree in this day and age!

Recently I wanted to go through series 3 but I wanted all the data stored **locally**, including the YouTube videos. This script does just that. It uses [Puppeteer](https://pptr.dev/) (a headless browser) to navigate the site, aggregate links to the mp3, YouTube, and PDF files, and downloads them all, organized into folders for each section.

It turns out there are missing files, or at least files not published to the web. The good thing is there is at least an mp3 for every episode. So you can hear everything and watch / read _almost_ everything. I sent a message to [Reasonable Faith](https://www.reasonablefaith.org/) (Dr. Craig's ministry) indicating which YouTube episodes were missing and which happen to be available on their YouTube channel. I posted those results in [this Google sheet](https://docs.google.com/spreadsheets/d/1NCLpk6K6ozirjHFBqVyZP1-JzRuMUPC2aLi0b1W4szo/edit#gid=0).

## How To Use

- Install Node.js on your computer locally
- `cd` into this repo's directory
- run `npm install`
- From your terminal run `npm start` or `node main.js`

It can take quite some time to download as there are a _lot_ of episodes and most have a YouTube video. Make sure you're computer doesn't sleep during the process or you'll have to start over. However, when running the script again, it's smart to not re-download files that are already there. And in the case of a file that was partially downloaded because it didn't complete due to your computer sleeping, the file size will be 0 and this script will re-download those files.

The CLI output is colorful and informative. You'll see download progress in real time:
<img width="758" alt="Screen Shot 2022-07-29 at 2 49 31 PM" src="https://user-images.githubusercontent.com/11034792/182666346-a108658f-9c78-4057-b5d7-73937e438f7c.png">

## Check For Missing Files

As I mentioned earlier, not all episodes have a PDF (transcript) or YouTube video posted on the website. If you want to see which files are missing, there is a script you can run. There are 2 ways to run this script.

### Check For All Missing Files

To check for all missing files, simply run `node findMissingEpisodes.js`. Data will log to the console indicating which files are missing for which episode.

### Check For Specific Missing Files

There are 3 types of files associated with each episode:

- `mp3` - audio only.
- `mp4` - YouTube video.
- `pdf` - written transcript.

For example, to check which episodes are missing YouTube videos, run `node findMissingEpisodes.js mp4`. You can do the same for each type of file extension mentioned above.

This was a fun project to build. It taught me a good deal about using Puppeteer (and it's issues!) and I'm excited to dive into season 3 of Defenders :)
