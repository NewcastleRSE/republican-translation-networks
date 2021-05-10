Some useful GitHub terms:
1. Commit


To add a new page:
1. Open pages/template.md and copy text.
2. Create a new file in the pages directory and call this your page's title (e.g. 'about'). This will be a markdown file so use the file type '.md' (e.g. 'about.md'). In this file paste the contents of template.md. The content between the 2 '---' lines won't show on the page, but tells GitHub pages what your page is called and what layout to use. You can leave the layout line as it is. Add your page title to replace the text 'insert page title here'.
3. Add any page content, deleting the placeholder text from the template. Save the file by commiting (add instructions here)

Once you are ready to make your page available to site visitors, add it to the navigation menu:
4. Open _data/navigation.yml.
5. You will see some existing pages, with each page having a title and url, and marked using a dash. In this file it is vital that the spacing stays as it is so make sure to take notice of any spaces! Copy one of the pages and paste wherever in the list you would like to add your page. Change the page title to your new page's title. You have created a page within the 'pages' directory, so you will include this in the url. Change it to '/pages/' followed by your page's title. Don't forget to include the .md filetype. Commit the file.
