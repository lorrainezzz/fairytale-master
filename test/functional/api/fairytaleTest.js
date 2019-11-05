const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;


const Fairytale = require("../../../models/fairytale");

const mongoose = require("mongoose");

const _ = require("lodash");
let server;
let mongod;
let db, validID;
describe("Fairytale", () => {
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
            validID = fairytale._id;

        } catch (error) {
            console.log(error);
        }
    });
    describe("Fairy tale",()=>{
            describe("GET /fairytale", () => {
                it("should GET all fairy tales", done => {
                    request(server)
                        .get("/fairytale")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            try {
                                expect(res.body).to.be.a("array");
                                expect(res.body.length).to.equal(2);
                                let result = _.map(res.body, fairytale => {
                                    return {
                                        name: fairytale.name,
                                        author: fairytale.author,

                                    };
                                });
                                expect(result).to.deep.include({
                                    name : "Lamp",
                                    author : "Dollar"
                                });
                                expect(result).to.deep.include({
                                    name : "Book",
                                    author : "Lay"
                                });
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                });
            });
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
        });
});