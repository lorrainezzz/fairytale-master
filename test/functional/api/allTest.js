const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;

const User = require("../../../models/user");
const Author = require("../../../models/author");
const Admin = require("../../../models/admin");
const Fairytale = require("../../../models/fairytale");

const mongoose = require("mongoose");

const _ = require("lodash");
let server;
let mongod;
let db, validID,validID1,validID2,validID3;

describe("AllTest",()=>{
    before(async () => {
        try {
            mongod = new MongoMemoryServer({
                instance: {
                    port: 27017,
                    dbPath: "./test/database",
                    dbName: "fairytaledatabase" // by default generate random dbName
                }
            });
            // Async Trick - this ensures the database is created before
            // we try to connect to it or start the server
            await mongod.getConnectionString();

            mongoose.connect("mongodb://localhost:27017/fairytaledatabase", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            server = require("../../../bin/www");
            db = mongoose.connection;
        } catch (error) {
            console.log(error);
        }
    });

    beforeEach(async () => {
        try {
            await User.deleteMany({});
            let user = new User();
            user.name = "Ada";
            user.pwd = "asd";
            await user.save();
            user = new User();
            user.name = "Bella";
            user.pwd = "zxc";
            await user.save();
            user = await User.findOne({name: "Ada"});
            validID = user._id;

            await Admin.deleteMany({});
            let admin = new Admin();
            admin.name = "A001";
            admin.pwd = "123";
            await admin.save();
            admin = new Admin();
            admin.name = "A002";
            admin.pwd = "456";
            await admin.save();
            admin = await Admin.findOne({name: "A001"});
            validID1 = admin._id;

            await Fairytale.deleteMany({});
            let fairytale = new Fairytale();
            fairytale.name = "Lamp";
            fairytale.author = "Dollar";
            await fairytale.save();
            fairytale = new Fairytale();
            fairytale.name = "Book";
            fairytale.author = "Lay";
            await fairytale.save();
            fairytale = await Fairytale.findOne({name: "Lamp"});
            validID2 = fairytale._id;

            await Author.deleteMany({});
            let author = new Author();
            author.name = "Ben";
            await author.save();
            author = new Author();
            author.name = "Karry";
            await author.save();
            author = await Author.findOne({name: "Ben"});
            validID3 = author._id;


        } catch (error) {
            console.log(error);
        }
    });

    describe("User",()=> {
        describe("GET /user", () => {
            it("should GET all users", done => {
                request(server)
                    .get("/user")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        try {
                            expect(res.body).to.be.a("array");
                            expect(res.body.length).to.equal(2);
                            let result = _.map(res.body, user => {
                                return {
                                    name: user.name,
                                    pwd: user.pwd
                                };
                            });
                            expect(result).to.deep.include({
                                name: "Ada",
                                pwd: "asd"
                            });
                            expect(result).to.deep.include({
                                name: "Bella",
                                pwd: "zxc"
                            });
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
        });
        describe("GET /user/:id", () => {
            describe("when the id is valid", () => {
                it("should return the matching user", done => {
                    request(server)
                        .get(`/user/${validID1}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("name", "Ada");
                            expect(res.body[0]).to.have.property("pwd", "asd");
                            done(err);
                        });
                });
            });
            // describe("when the id is invalid", () => {
            //     it("should return the NOT found message", done => {
            //         request(server)
            //             .get("/user/gf")
            //             .set("Accept", "application/json")
            //             .expect("Content-Type", /json/)
            //             .expect(200)
            //             .end((err, res) => {
            //                 expect(res.body.message).equals("User NOT Found!");
            //                 done(err);
            //             });
            //     });
            // });
        });
        describe("POST /user/register", () => {
            it("should return username can not be empty message", () => {
                const user = {
                    name: "",
                    pwd: "qwe",
                };

                return request(server)
                    .post("/user/register")
                    .send(user)
                    .then(res => {
                        expect(res.body.message).equals("Name or password cannot be empty");
                    });
            });
            it("should return password can not be empty message", () => {
                const user = {
                    name: "Cathy",
                    pwd: ""
                };

                return request(server)
                    .post("/user/register")
                    .send(user)
                    .then(res => {
                        expect(res.body.message).equals("Name or password cannot be empty");
                    });
            });
            it("should return name is existed message", () => {
                const user = {
                    name: "Ada",
                    pwd: "asd"
                };

                return request(server)
                    .post("/user/register")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Username is existed");
                    });
            });
            it("should return confirmation message and update mongodb", () => {
                const user = {
                    name: "Ding",
                    pwd: "asd123"
                };

                return request(server)
                    .post("/user/register")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Registered Successfully!!");
                        validID1 = res.body.data._id;
                    });
            });
            after(() => {
                return request(server)
                    .get(`/user/${validID1}`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0]).to.have.property("name", "Ada");
                        expect(res.body[0]).to.have.property("pwd", "asd");
                    });
            });
        });
        describe("POST /user/login", () => {
            it("should return username or password can not be empty message", () => {
                const user = {
                    name: "",
                    pwd: "asd",
                };

                return request(server)
                    .post("/user/login")
                    .send(user)
                    .then(res => {
                        expect(res.body.message).equals("Username or password cannot be empty");
                    });
            });

            it("should return username is not exist message", () => {
                const user = {
                    name: "Eve",
                    pwd: "zxcvbn",
                };

                return request(server)
                    .post("/user/login")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Username is not exist!!");
                    });
            });
            it("should return wrong password message", () => {
                const user = {
                    name: "Ada",
                    pwd: "456",
                };

                return request(server)
                    .post("/user/login")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Password is wrong!!");
                    });
            });
            it("should return confirmation message and update mongodb", () => {
                const user = {
                    name: "Ada",
                    pwd: "asd",
                };

                return request(server)
                    .post("/user/login")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Login successfully");
                    });
            });
        });

     });
    describe("Admin", () => {
        describe("GET /admin", () => {
            it("should GET all the admins", done => {
                request(server)
                    .get("/admin")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        try {
                            expect(res.body).to.be.a("array");
                            expect(res.body.length).to.equal(2);
                            let result = _.map(res.body, admin => {
                                return {
                                    name: admin.name,
                                    pwd: admin.pwd
                                };
                            });
                            expect(result).to.deep.include({
                                name: "A001",
                                pwd: "123"
                            });
                            expect(result).to.deep.include({
                                name: "A002",
                                pwd: "456"
                            });
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
        });
        describe.only("GET /admin/:id", () => {
            describe.only("when the id is valid", () => {
                it("should return the matching admin", done => {
                    request(server)
                        .get(`/admin/${validID1}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body.data).to.have.property("name", "A001");
                            expect(res.body.data).to.have.property("pwd", "123");
                            done(err);
                        });
                });
            });
            describe("when the id is invalid", () => {
                it("should return the NOT found message", done => {
                    request(server)
                        .get("/admin/0098")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, req) => {
                            expect(req.body.message).equals("Admin NOT Found!");
                            done(err);
                        });
                });
            });
        });
        describe("POST /admin/register", () => {
            it("should return name can not be empty message", () => {
                const admin = {
                    name: "",
                    pwd: "789"
                };

                return request(server)
                    .post("/admin/register")
                    .send(admin)
                    .then(res => {
                        expect(res.body.message).equals("Name cannot be empty");
                    });
            });
            it("should return password can not be empty message", () => {
                const admin = {
                    name: "Kelly",
                    password: ""
                };

                return request(server)
                    .post("/admin/register")
                    .send(admin)
                    .then(res => {
                        expect(res.body.message).equals("Password cannot be empty");
                    });
            });

            it("should return name occupied message", () => {
                const admin = {
                    name: "A001",
                    pwd: "123"
                };

                return request(server)
                    .post("/admin/register")
                    .send(admin)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Name is existed");
                    });
            });
            it("should return confirmation message and update mongodb", () => {
                const admin = {
                    name: "Kelly",
                    pwd: "789"
                };

                return request(server)
                    .post("/admin/register")
                    .send(admin)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Registered Successfully!!");
                        validID1 = res.body.data._id;
                    });
            });
            after(() => {
                return request(server)
                    .get(`/admin/${validID1}`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0]).to.have.property("name", "Kelly");
                        expect(res.body[0]).to.have.property("pwd", "789");
                    });
            });
        });
    //     describe("POST /admin/login", () => {
    //         it("should return name or password can not be empty message", () => {
    //             const admin = {
    //                 name: "",
    //                 pwd: "1122"
    //             };
    //
    //             return request(server)
    //                 .post("/admin/login")
    //                 .send(admin)
    //                 .then(res => {
    //                     expect(res.body.message).equals("Name or password cannot be empty");
    //                 });
    //         });
    //
    //         it("should return name is not exist message", () => {
    //             const admin = {
    //                 name: "Frank",
    //                 pwd: "1122",
    //             };
    //
    //             return request(server)
    //                 .post("/admin/login")
    //                 .send(admin)
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body.message).equals("Name is not existed");
    //                 });
    //         });
    //         it("should return wrong password message", () => {
    //             const admin = {
    //                 name: "A001",
    //                 pwd: "asdfgh",
    //             };
    //
    //             return request(server)
    //                 .post("/admin/login")
    //                 .send(admin)
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body.message).equals("Password is wrong!!");
    //                 });
    //         });
    //         it("should return confirmation message and update mongodb", () => {
    //             const admin = {
    //                 name: "A001",
    //                 pwd: "123",
    //             };
    //
    //             return request(server)
    //                 .post("/admin/login")
    //                 .send(admin)
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body.message).equals("Login successfully");
    //                 });
    //         });
    //     });
    });
    //
    // describe("Fairy tale",()=>{
    //     describe("GET /fairytale", () => {
    //         it("should GET all fairy tales", done => {
    //             request(server)
    //                 .get("/fairytale")
    //                 .set("Accept", "application/json")
    //                 .expect("Content-Type", /json/)
    //                 .expect(200)
    //                 .end((err, res) => {
    //                     try {
    //                         expect(res.body).to.be.a("array");
    //                         expect(res.body.length).to.equal(2);
    //                         let result = _.map(res.body, fairytale => {
    //                             return {
    //                                 name: fairytale.name,
    //                                 author: fairytale.author,
    //
    //                             };
    //                         });
    //                         expect(result).to.deep.include({
    //                             name : "Lamp",
    //                             author : "Dollar"
    //                         });
    //                         expect(result).to.deep.include({
    //                             name : "Book",
    //                             author : "Lay"
    //                         });
    //                         done();
    //                     } catch (e) {
    //                         done(e);
    //                     }
    //                 });
    //         });
    //     });
    //     describe("GET /fairytale/:id", () => {
    //         describe("when the id is valid", () => {
    //             it("should return the matching fairytale", done => {
    //                 request(server)
    //                     .get(`/fairytale/${validID}`)
    //                     .set("Accept", "application/json")
    //                     .expect("Content-Type", /json/)
    //                     .expect(200)
    //                     .end((err, res) => {
    //                         expect(res.body[0]).to.have.property("name", "Book");
    //                         expect(res.body[0]).to.have.property("author", "Lay");
    //                         done(err)
    //                     })
    //             })
    //         });
    //         describe("when the id is invalid", () => {
    //             it("should return the NOT found message", done => {
    //                 request(server)
    //                     .get("/fairytale/1er202")
    //                     .set("Accept", "application/json")
    //                     .expect("Content-Type", /json/)
    //                     .expect(200)
    //                     .end((err, res) => {
    //                         expect(res.body.message).equals("Fairy tale NOT Found!")
    //                         done(err)
    //                     })
    //             })
    //         })
    //     });
    //     describe("POST /fairytale", () => {
    //         it("should return name or author cannot be empty message", () => {
    //             const fairytale = {
    //                 name: "",
    //                 author: "Beth"
    //             };
    //
    //             return request(server)
    //                 .post("/fairytale")
    //                 .send(fairytale)
    //                 .then(res => {
    //                     expect(res.body.message).equals("Fairy tale name or author cannot be empty");
    //                 });
    //         });
    //         it("should return fairy tale has already existed message", () => {
    //             const fairytale = {
    //                 name: "Book",
    //                 author: "Lay"
    //             };
    //
    //             return request(server)
    //                 .post("/fairytale")
    //                 .send(fairytale)
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body.message).equals("The fairytale is already exist");
    //                 });
    //         });
    //         it("should return confirmation message and update mongodb", () => {
    //             const fairytale = {
    //                 name: "Water",
    //                 author: "Ella"
    //             };
    //
    //             request(server)
    //                 .post("/fairytale")
    //                 .send(fairytale)
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body.message).equals("Fairytale Added Successfully!");
    //                     validID = res.body.data._id;
    //                 });
    //         });
    //         after(() => {
    //             request(server)
    //                 .get(`/fairytale/${validID}`)
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body[0]).to.have.property("name", "Water");
    //                     expect(res.body[0]).to.have.property("author", "Ella");
    //                 });
    //         });
    //     });
    //     describe("DELETE /fairytale/:id", () => {
    //         describe("when the id is valid", () => {
    //             it("should return confirmation message and update database", () => {
    //                 request(server)
    //                     .delete(`fairytale/${validID}`)
    //                     .set("Accept", "application/json")
    //                     .expect("Content-Type", /json/)
    //                     .expect(200)
    //                     .then(res => {
    //                         expect(res.body.message).equals("Fairy tale Deleted!")
    //                     })
    //             })
    //         })
    //         describe("when the id is invalid", () => {
    //             it("should return the NOT found message", () => {
    //                 request(server)
    //                     .delete("/fairytale/1er0202")
    //                     .set("Accept", "application/json")
    //                     .expect("Content-Type", /json/)
    //                     .expect(200)
    //                     .then(res => {
    //                         expect(res.body.message).equals("Fairy tale NOT FOUND!")
    //                     })
    //             })
    //         })
    //     })
    // });
    //
    describe("Author", () => {
        describe("GET /author", () => {
            it("should GET all the authors", done => {
                request(server)
                    .get("/author")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        try {
                            expect(res.body).to.be.a("array");
                            expect(res.body.length).to.equal(2);
                            let result = _.map(res.body, author => {
                                return {
                                    name: author.name
                                }
                            });
                            expect(result).to.deep.include({
                                name: "Ben"
                            });
                            expect(result).to.deep.include({
                                name: "Karry"
                            });
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
        });
        describe("GET /author/:id", () => {
            describe("when the id is valid", () => {
                it("should return the matching author", done => {
                    request(server)
                        .get(`/author/${validID}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("name", "Ben");
                            done(err);
                        });
                });
            });
            // describe("when the id is invalid", () => {
            //     it("should return the NOT found message", done => {
            //         request(server)
            //             .get("/author/0098")
            //             .set("Accept", "application/json")
            //             .expect("Content-Type", /json/)
            //             .expect(200)
            //             .end((err, req) => {
            //                 expect(req.body.message).equals("Author NOT Found!");
            //                 done(err);
            //             });
            //     });
            // });
        });
        describe("POST /author", () => {
            it("should return can not be empty message", () => {
                const author = {
                    name: ""
                }
                return request(server)
                    .post("/author")
                    .send(author)
                    .then(res => {
                        expect(res.body.message).equals("Name cannot be empty")
                    })
            })
            it("should return author already existed message", () => {
                const author = {
                    name: "Ben"
                }

                return request(server)
                    .post("/author")
                    .send(author)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Name is existed")
                    })
            });
            it("should return confirmation message and update mongodb", () => {
                const author = {
                    name: "Haley"
                }

                request(server)
                    .post("/author")
                    .send(author)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Author Added Successfully!");
                        validID = res.body.data._id
                    })
            });
            after(() => {
                request(server)
                    .get(`/author/${validID}`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0]).to.have.property("name", "Haley")
                    })
            })
        });
        describe("DELETE /author/:id", () => {
            describe("when the id is valid", () => {
                it("should return confirmation message and update database", () => {
                    request(server)
                        .delete(`author/${validID}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .then(res => {
                            expect(res.body.message).equals("Author Deleted!")
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return the NOT found message", () => {
                    request(server)
                        .delete("/author/aerfa356")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .then(res => {
                            expect(res.body.message).equals("Author NOT Found!")
                        })
                })
            })
        })
    });
});











