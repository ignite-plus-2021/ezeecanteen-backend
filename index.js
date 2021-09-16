const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');

const mysql = require('mysql2');
const { STATUS_CODES } = require('http');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root!123',
    database: 'ezeecanteen'
});
const db1 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root!123',
    database: 'menu'
});
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.get('/', function (request, response) {
//     response.sendFile(path.join(__dirname + '/login'));

// });

app.get("/accounts", (req, res) => {

    db1.query("SELECT * FROM account_details ", (err, result) => {
        console.log(result);
        res.send(result);
    });
})
app.get('/lastid', (req, res) => {

    db.query("SELECT MAX(id) FROM signup ", (err, result) => {
        console.log(result);
        res.send(result);
    });
})
app.post('/carddetails', (req, res) => {
    const cardName = req.body.cname;
    const cardNo = req.body.cNo;
    const expiryDate = req.body.expiry;
    const cvcNumber = req.body.Nocvc;
    const UId = req.body.uid;
    db1.query("INSERT INTO account_details (name,cardNumber,expiry,cvc,userId) VALUES (?,?,?,?,?)", [cardName, cardNo, expiryDate, cvcNumber, UId], (err, result) => {
        console.log("card details send");
    });
})

app.post('/login', (req, res) => {

    var email = req.body.email;
    const password = req.body.password;
    const guess = password;




    if (password && email) {

        // if (password!=="undefined")
        db.query('SELECT * FROM signup WHERE email = ?', [email], function (err, hashrec, req) {
            if (hashrec.length > 0) {
                if (email && password) {
                    db.query('SELECT password FROM signup WHERE email = ?', [email, password], function (err, hash, req) {
                        var resultArrayh = Object.values(JSON.parse(JSON.stringify(hash)))
                        bcrypt.compare(guess, resultArrayh[0].password, function (err, resh) {


                            console.log(resh, hash, password, resultArrayh)
                            console.log(resultArrayh[0].password)
                            db.query('SELECT * FROM signup WHERE email = ? AND password = ? ', [email, resultArrayh[0].password], function (err, results, req) {
                                console.log(results)
                                if (results.length > 0 && resh) {

                                    db.query('SELECT usertype,fullname from signup WHERE email = ? and password=? ', [email, resultArrayh[0].password], (err, ust) => {

                                        var resultArray = Object.values(JSON.parse(JSON.stringify(ust)))

                                        res.status(200).json({
                                            status: 'success',
                                            data: resultArray
                                        })
                                    });


                                }

                                else {
                                    res.send({ message: 'Incorrect Email and/or Password!' });
                                    res.end();
                                }

                                // res.end();
                            });
                        }
                        )
                    })
                }
            }
            else {
                res.send({ message: 'Incorrect Email and/or Password!' });
                res.end();
            }

        })
    }
    else {
        res.send({ message: 'Please enter Email id and Password!' });
        res.end();
    }
}
)
// });
// });
// });
app.post("/loginuser", (requ, resu) => {
    const email = requ.body.email;
    db.query("select fullname, email from signup where email=?", [email], (err, resu1) => {
        resu.send(resu1)
    })
})
app.post("/api/insert", (req1, res1) => {


    const fullname = req1.body.fullname;
    const email = req1.body.email;
    const password = req1.body.password;
    const usertype = req1.body.usertype;
    bcrypt.hash(password, 10, function (err, hash) {
        console.log(fullname, email, hash);
        if (fullname == "" || email == "" || password == "" || usertype == "") {
            res1.send({ message: "Enter Fullname, Email id and Password and select Usertype to Sign up !!!" })
        }
        db.query("SELECT email from ezeecanteen.signup where email=?", [email], (err, res11) => {
            if (err) throw err;
            if (res11.length == 0) {

                db.query("INSERT INTO ezeecanteen.signup (usertype,fullname,email,password) VALUES (?,?,?,?)", [usertype, fullname, email, hash], function () {
                    // db.query('SELECT fullname FROM signup WHERE email=?', [email]);
                    // req1.session.fullname = fullname;
                    // req1.session.loggedin = true;
                    // res1.send(fullname);
                })
            }
            else if (res11.length > 0) {
                res1.send({ message: "Email id already exists!!!" })
            }

            res1.end();
        })
    })
});

app.get("/api/get1", (req, res) => {
    const email = req.query.email;
    console.log(email);

    //const sqlSelect="SELECT fullname FROM signup where email=?;";
    db.query("SELECT fullname FROM signup where email=?", [email], (err, result) => {
        if (result.length > 0) {
            const fullName = result[0].fullname
            res.send(fullName);
        }
    })
});

app.get("/api/fetch", (req, res) => {
    const sqlSelect = "SELECT * FROM orders;";
    db1.query(sqlSelect, (err, result) => {
        console.log(result);
        res.send(result);
    });
});
// app.get("/id", (req, res) => {
//     const email = req.body.email
//     console.log(email)
//     db.query("SELECT * FROM signup", (err, result) => {
//         console.log(result);
//         res.send(result);
//     });
// })
app.get("/api/get/breakfast", (req, res) => {

    const sqlSelect = "SELECT * FROM menu.breakfast_ss ";
    db1.query(sqlSelect, (err, result) => {
        console.log(result);
        res.send(result);
    });

});
app.get("/api/get/lunch", (req, res) => {

    const sqlSelect = "SELECT * FROM menu.lunch ";
    db1.query(sqlSelect, (err, result) => {
        console.log(result);
        res.send(result);
    });

});
app.get("/api/get/snacks", (req, res) => {

    const sqlSelect = "SELECT * FROM menu.snacks ";
    db1.query(sqlSelect, (err, result) => {
        console.log(result);
        res.send(result);
    });

});
app.post("/api/fetch1", (req, res) => {
    const ord = req.body.orderno
    const sqlSelect = "SELECT * FROM orders where orderNo=? and orderStatus='Completed'";
    db1.query(sqlSelect, [ord], (err, result) => {

        if (result.length > 0) {
            res.send({ message: "completed" })

        }
        else {
            res.send()
        }


    })

});
app.post("/placeorder", (req, res) => {
    const iname = req.body.name;
    const quantity = req.body.qty;
    const date = req.body.OrderDate;
    const time = req.body.Ordertime;
    const uname = req.body.uname;
    const order = req.body.ordno;
    const tt = req.body.timet;
    db1.query("INSERT INTO orders (itemName,itemQty,orderTime,orderDate,username,orderNo,timetest) VALUES (?,?,?,?,?,?,?)", [iname, quantity, time, date, uname, order, tt], (err, result) => {
        console.log("send to db");
    });
    /*db.query("UPDATE orders SET orderNo=concat(10,id) WHERE username=uname;",(err,result)=>{
        console.log("DOne");
    })*/

});

app.get("/count", (req, res) => {
    const sqlSelect = "SELECT orderNo FROM orders WHERE id=(SELECT MAX(id) FROM orders);";
    db1.query(sqlSelect, (err, result) => {
        console.log(result);
        res.send(result);
    });
});

app.post("/orderstatus", (req, res) => {
    const orderStatus = req.body.Ostatus;
    const orderid = req.body.Oid;
    const ordNo = req.body.oNo;
    db1.query("UPDATE orders SET orderStatus=(?) WHERE id=(?) and orderNo=(?)", [orderStatus, orderid, ordNo], (err, result) => {
        console.log("send to db");
    });

});
app.get("/api/get", (req, res) => {
    const sqlSelect = "SELECT * FROM breakfast_ss;";
    db1.query(sqlSelect, (err, result) => {
        // console.log(result);
        res.send(result);
    });

});


// app.get('/BrowseFood', (req, res) => {
//     if (req.session.loggedin) {
//         res.send('Welcome, ' + req.session.fullname + '!');
//         res.end();
//     } else {
//         res.send('Please login to view browse food page!');
//     }
//     res.end();
// });
app.get("/id", (req, res) => {
    const email = req.body.email
    console.log("Email")
    console.log(email)
    db.query("SELECT * FROM signup ", (err, result) => {
        console.log(result);
        res.send(result);
    });
})
app.post("/api/forgot", (req1, res1) => {

    const email = req1.body.email;
    const password = req1.body.password;

    //console.log("Forgot password")
    console.log(email, password);
    bcrypt.hash(password, 10, function (err, hash) {
        console.log(hash)
        if (email == "" || password == "") {
            res1.send({ message: "Enter  Email id and Password to Reset Password !!!" })
        }


        db.query("SELECT email from signup where email=?", [email], (err, res11,) => {
            console.log(res11)
            //if (err) throw err;  
            if (res11.length == 0) {
                res1.send({ message: "Email id does not exists!!!" })
            }
            else if (res11.length > 0) {
                db.query("UPDATE signup SET password=? WHERE email=?", [hash, email])
            }
        })

        res1.end();
    })


});
app.listen(3001, () => {
    console.log("running on port 3001");
});
