const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer

const User = require("../../../models/user")
const mongoose = require("mongoose")

const _ = require("lodash")
let server
let mongod
let db, validID

describe("User",()=> {
  before(async () => {
    try {
      mongod = new MongoMemoryServer({
        instance: {
          port: 27017,
          dbPath: "./test/database",
          dbName: "fairytaledatabase" // by default generate random dbName
        }
      })
      // Async Trick - this ensures the database is created before
      // we try to connect to it or start the server
      await mongod.getConnectionString()

      mongoose.connect("mongodb://localhost:27017/fairytaledatabase", {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      server = require("../../../bin/www")
      db = mongoose.connection
    } catch (error) {
      console.log(error)
    }
  })

  beforeEach(async () => {
    try {
      await User.deleteMany({})
      let user = new User()
      user.name = "Ada"
      user.pwd = "asdfgh"
      await user.save()
      user = new User()
      user.name = "Bella"
      user.pwd = "zxcvbn"
      await user.save()
      user = await User.findOne({name: "Ada"})
      validID = user._id

    } catch (error) {
      console.log(error)
    }
  })
  describe("GET /user", () => {
    it("should GET all users", done => {
      request(server)
        .get("/user")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            expect(res.body).to.be.a("array")
            expect(res.body.length).to.equal(2)
            let result = _.map(res.body, user => {
              return {
                name: user.name,
                pwd: user.pwd
              }
            })
            expect(result).to.deep.include({
              name: "Ada",
              pwd: "asd"
            })
            expect(result).to.deep.include({
              name: "Bella",
              pwd: "zxc"
            })
            done()
          } catch (e) {
            done(e)
          }
        })
    })
  })
  describe("GET /user/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching user", done => {
        request(server)
          .get(`/user/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("name", "Ada")
            expect(res.body[0]).to.have.property("pwd", "asd")
            done(err)
          })
      })
    })
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
  })
  describe("POST /user/register", () => {
    it("should return username can not be empty message", () => {
      const user = {
        name: "",
        pwd: "qwe",
      }

      return request(server)
        .post("/user/register")
        .send(user)
        .then(res => {
          expect(res.body.message).equals("Name or password cannot be empty")
        })
    })
    it("should return password can not be empty message", () => {
      const user = {
        name: "Cathy",
        pwd: ""
      }

      return request(server)
        .post("/user/register")
        .send(user)
        .then(res => {
          expect(res.body.message).equals("Name or password cannot be empty")
        })
    })
    it("should return name is existed message", () => {
      const user = {
        name: "Ada",
        pwd: "asd"
      }

      return request(server)
        .post("/user/register")
        .send(user)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("Username is existed")
        })
    })
    it("should return confirmation message and update mongodb", () => {
      const user = {
        name: "Ding",
        pwd: "asd123"
      }

      return request(server)
        .post("/user/register")
        .send(user)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("Registered Successfully!!")
          validID1 = res.body.data._id
        })
    })
    after(() => {
      return request(server)
        .get(`/user/${validID}`)
        .expect(200)
        .then(res => {
          expect(res.body[0]).to.have.property("name", "Ada")
          expect(res.body[0]).to.have.property("pwd", "asd")
        })
    })
  })
  describe("POST /user/login", () => {
    it("should return username or password can not be empty message", () => {
      const user = {
        name: "",
        pwd: "asd",
      }

      return request(server)
        .post("/user/login")
        .send(user)
        .then(res => {
          expect(res.body.message).equals("Username or password cannot be empty")
        })
    })

    it("should return username is not exist message", () => {
      const user = {
        name: "Eve",
        pwd: "zxcvbn",
      }

      return request(server)
        .post("/user/login")
        .send(user)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("Username is not exist!!")
        })
    })
    it("should return wrong password message", () => {
      const user = {
        name: "Ada",
        pwd: "456",
      }

      return request(server)
        .post("/user/login")
        .send(user)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("Password is wrong!!")
        })
    })
    it("should return confirmation message and update mongodb", () => {
      const user = {
        name: "Ada",
        pwd: "asd",
      }

      return request(server)
        .post("/user/login")
        .send(user)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("Login successfully")
        })
    })
  })

})