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
    res.render('index.ejs', { title: 'Home',layout:'mainlayout.ejs' });
})

//about
app.get('/about', (req, res) => {
    res.render('about.ejs', { title: 'About' ,layout:'mainlayouts.ejs' });
})

//post
app.get('/post', (req, res) => {
    res.render('post.ejs', { title: 'Post' ,layout:'mainlayouts.ejs' });
})

//contact
app.get('/contact', (req, res) => {
    res.render('contact.ejs', { title: 'contact' ,layout:'mainlayouts.ejs' });
})

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
})