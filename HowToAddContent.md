# Adding and Editing Content

Useful sites:
* Markdown cheatsheet: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code
* GitHub Pages documentation: https://pages.github.com/
* GitHub documentation if you want to learn more about version control for code: https://docs.github.com/en 


In the instructions below I refer to creating, editing and 'commiting' files. You can learn more about version control for code if you want, but for now I will explain how to work using the GitHub website as this will allow you to add new content and pages to the website without having to download anything.
1. Go to the repository page (a repository is like a folder on your PC): https://github.com/NewcastleRSE/republican-translation-networks
2. You can see folders and files under the `Code` tab. Below the files and folders is the 'README.md' file which is where developers conventionally put key information. I've added links to some useful documents there. 
3. Open the file you want to edit by clicking on the filename and then clicking on the pencil icon top right. Note the rubbish bin icon beside it will delete the file completely. Alternatively, create a new file by going to the folder you want to create a file in and clicking the dropdown menu `Add file`, top right of the screen. Then click `Create new file`. 
4. Once you have finished editing, scroll down the page until you can see a box titled `Commit changes`. Click the green `Commit changes` button.


To add a new page:
1. Open `pages/template.md` and copy text.
2. Create a new file in the pages directory and call this your page's title (e.g. `about`). This will be a markdown file so use the file type `.md` (e.g. `about.md`). In this file paste the contents of template.md. The content between the 2 `---` lines won't show on the page, but tells GitHub pages what your page is called and what layout to use. You can leave the layout line as it is. Add your page title to replace the text `insert page title here`.
3. Add any page content, deleting the placeholder text from the template. Save the file by commiting.

Once you are ready to make your page available to site visitors, add it to the navigation menu:
4. Open `_data/navigation.yml`.
5. You will see some existing pages, with each page having a title and url, and marked using a dash. In this file it is vital that the spacing stays as it is so make sure to take notice of any spaces! Copy one of the pages and paste wherever in the list you would like to add your page. Change the page title to your new page's title. You have created a page within the `pages` directory, so you will include this in the url. Change it to `/pages/` followed by your page's title. Instead of the markdown filetype (`.md`), use .html.

To add an image:
1. Save your image in the assets directory.
2. There is an example of adding a picture in the template.md file. You need to include a description of the image within square brackets and then a path to the image in brackets The path will begin with two full stops as this tells the compiler to take a step up through the directory structure before it looks for the assets directory. So your code will look something like this:
```![Describe the picture for screen readers](../assets/filename.filetype)``` e.g. for the `flower.jpg` file: ```![Flowers on a table](../assets/flower.jpg)```.

To add a link to an external website:
1. An example link is in the `template.md` file. You can include the text you want to hyperlink in square brackets followed by the URL in normal brackets. Note, there is no space between the brackets, e.g. ``` Click [here](https://goodsite.com) for a good site.```
