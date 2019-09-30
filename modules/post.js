const db = require('./database');
const md5 = require('md5');

async function Process(req, res){
    var urlArr = req.originalUrl.replace(/^(\/)/, '').split('/');
    var retArr = {};
    var POST = req._body ? req.body : false;
    const action = urlArr[0];

    console.log(action, POST);

    if(action === 'signin') {
        var account = await db.getRow(`SELECT * FROM users WHERE email = '${POST.email.toLowerCase()}'`);
        console.log('signin', account);
        if (account && account.pass == md5(POST.pass)) {
            delete account.pass;
            retArr.user = account;
            retArr.auth = true;
        } else {
            console.log( account.pass,  md5(POST.pass))
            retArr.error = "Email or Password incorrect";
        }
    }

    if(action === 'signup') {
        var email = await db.select({
            table: 'users',
            where: `email = '${POST.email.toLowerCase()}'`
        });

        if(email){
            console.log('email exsists');
            retArr.error = "Email is already exsists, please sign in.";
        } else {
            POST.pass = md5(POST.pass);
            POST.email = POST.email.toLowerCase();
            var insert = await db.insert('users', POST);
            delete insert.pass;
            retArr.user = insert;
            retArr.auth = true;
        }
    }


    // return data
    console.log(retArr);
    res.send(JSON.stringify(retArr));
}

module.exports.process = Process;