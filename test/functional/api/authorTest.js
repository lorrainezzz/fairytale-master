const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;


const Author = require("../../../models/author");

const mongoose = require("mongoose");

const _ = require("lodash");
let server;
let mongod;
let db, validID;

describe("Author", () => {

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
            await Author.deleteMany({});
            let author = new Author();
            author.name = "Ben";
            await author.save();
            author = new Author();
            author.name = "Karry";
            await author.save();
            author = await Author.findOne({name: "Ben"});
            validID = author._id;


        } catch (error) {
            console.log(error);
        }
    });
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
    // describe("DELETE /author/:id", () => {
    //     describe("when the id is valid", () => {
    //         it("should return confirmation message and update database", () => {
    //             request(server)
    //                 .delete(`author/${validID}`)
    //                 .set("Accept", "application/json")
    //                 .expect("Content-Type", /json/)
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body.message).equals("Author Deleted!")
    //                 })
    //         })
    //     })
    //     describe("when the id is invalid", () => {
    //         it("should return the NOT found message", () => {
    //             request(server)
    //                 .delete("/author/aerfa356")
    //                 .set("Accept", "application/json")
    //                 .expect("Content-Type", /json/)
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body.message).equals("Author NOT Found!")
    //                 })
    //         })
    //     })
    // })
});