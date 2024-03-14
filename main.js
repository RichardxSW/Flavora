const express = require('express');
const app = express();
const port = 3000;
const expressLayouts = require('express-ejs-layouts');

//ejs
app.set('view engine', 'ejs');

//layout
app.use(expressLayouts);


//static express
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index.ejs', {layout:'mainlayout.ejs' });
})

//pinned
app.get('/pinned', (req, res) => {
    res.render('pinned.ejs', {layout:'mainlayout.ejs' });
})

//recent
app.get('/recent', (req, res) => {
    res.render('recent.ejs', {layout:'mainlayout.ejs' });
})

//detail
app.get('/detail', (req, res) => {
    res.render('detail.ejs', {layout:'mainlayout.ejs' });
})

//contact
app.get('/contact', (req, res) => {
    res.render('contact.ejs', { title: 'contact' ,layout:'mainlayouts.ejs' });
})

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
})