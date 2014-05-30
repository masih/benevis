# Enhancements
- [ ] Add the ability to change style in structure.yml
- [ ] Add hook to enable/disable javascript section numbering from structure.yml 
- [ ] Load scripts using github [API](https://developer.github.com/v3/): 
    - [ ] fetch from [REST API](https://api.github.com/repos/masih/benevis/contents/scripts/main.js) using header `Accept:application/vnd.github.v3.raw`
    - [ ] use requirejs [load API](http://requirejs.org/docs/plugins.html#apiload) to load the scripts, the config file and the css

- [ ] Add the ability to save files on github using [API libraries](https://developer.github.com/libraries/)
- [ ] Add support for url-based JSON citation database
- [ ] Add support for different citation database formats

- [ ] add support for multiple citation
- [ ] add support for citation narrow-down
- [x] make cite entries into links
- [x] make urls inside entries into links
- [ ] fix citations added after bibliography token is processed
- [ ] add menu bar items for printable html and pdf generation
- [ ] add support for critic, see [Multimarkdown critic][mmd_cheetsheet]
- [ ] improve README.md
- [ ] make Abstract page number in TOC to show as roman

[mmd_cheetsheet]:https://rawgit.com/fletcher/human-markdown-reference/master/index.html
