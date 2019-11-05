const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;


const Admin = require("../../../models/admin");

const mongoose = require("mongoose");

const _ = require("lodash");
let server;
let mongod;
let db, validID;
describe("Admin", () => {
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
            validID = admin._id;

        } catch (error) {
            console.log(error);
        }
    });
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
    describe("GET /admin/:id", () => {
        describe("when the id is valid", () => {
            it("should return the matching admin", done => {
                request(server)
                    .get(`/admin/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("name", "A001");
                        expect(res.body[0]).to.have.property("pwd", "123");
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
                    validID = res.body.data._id;
                });
        });
        after(() => {
            request(server)
                .get(`/admin/${validID}`)
                .expect(200)
                .then(res => {
                    expect(res.body.data).to.have.property("name", "Kelly");
                    expect(res.body.data).to.have.property("pwd", "789");
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