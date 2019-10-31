const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const chaiHttp = require('chai-http');

const app = require('../app');
const mysql = require('mysql');
const db = require('../lib/db');

const baseRouter = require('../routes/base');

chai.use(chaiHttp);
chai.should();

describe("Tag Router Tests: ", () => {
    describe("(post) /:name", () => {
        let testCount = 0;
        let executeQueryCount = 0;

        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });

            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    switch (testCount) {
                        case 0:
                            switch (executeQueryCount) {
                                case 0:
                                    resolve({insertId: 1});
                                    break;
                                default:
                                    resolve({});
                                    break;
                            }
                            break;
                        case 1:
                            switch (executeQueryCount) {
                                case 0:
                                    resolve({insertId: 0});
                                    break;
                                case 1:
                                    resolve([{id: 1}]);
                                    break;
                                default:
                                    resolve({});
                                    break;
                            }
                            break;
                    }
                    executeQueryCount++;
                });
            });

            sinon.stub(baseRouter, "get_authorization_token").callsFake(() =>
                "Bearer auth_token");

            sinon.stub(baseRouter, "check_token_existence").callsFake(() => {
                return new Promise((resolve) => {
                    resolve(1);
                });
            });
        });

        beforeEach(() => {
            executeQueryCount = 0;
        });

        it("update existing tag and create interaction", (done) => {
            chai.request(app)
                .post('/api/tags/custom.tag')
                .send({interaction: "ButtonClick", value: "test"})
                .end((err, res) => {
                    res.should.have.status(201);
                    assert.equal(res.body.tag.name, "custom.tag");
                    assert.equal(res.body.tag.value, "test");
                    assert.equal(res.body.interaction, "ButtonClick");
                    done();
                });
        });

        it("insert tag and create interaction", (done) => {
            chai.request(app)
                .post('/api/tags/custom.tag')
                .send({interaction: "ButtonClick", value: "test"})
                .end((err, res) => {
                    res.should.have.status(201);
                    assert.equal(res.body.tag.name, "custom.tag");
                    assert.equal(res.body.tag.value, "test");
                    assert.equal(res.body.interaction, "ButtonClick");
                    done();
                });
        });

        afterEach(() => {
            testCount++;
        });

        after(() => {
            baseRouter.get_authorization_token.restore();
            baseRouter.check_token_existence.restore();
            db.executeQuery.restore();
            mysql.createConnection.restore();
        });
    });
    
    //testing all tags
        describe("(get) /", () => {
        let executeQueryCount = 0;

        before(() => {
            sinon.stub(mysql, "createConnection").callsFake(() => {
                return {};
            });

            sinon.stub(db, "executeQuery").callsFake(() => {
                return new Promise((resolve) => {
                    
                    switch (executeQueryCount) {
                        case 0:
                            resolve([{token_id: 12, name: "Test", created: "SomeDate"}]);
                        case 1:
                            resolve([]);
                    }
                });
            });
            
            sinon.stub(baseRouter, "get_authorization_token").callsFake(() =>
                "Bearer auth_token");

            sinon.stub(baseRouter, "check_token_existence").callsFake(() => {
                return new Promise((resolve) => {
                    resolve(1);
                });
            });
        });

        it("returns a list of all tags", (done) => {
            chai.request(app)
                .get('/api/tags')
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.equal(res.body[0].name, "Test");
                    assert.equal(res.body[0].token_id, 12);
                    assert.equal(res.body[0].created, "SomeDate");
                    done();
                });
        });
            
        it("no tags found", done => {
            chai.request(app)
                .get('/api/tags')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        afterEach(() => {
            executeQueryCount++;
        });

        after(() => {
            baseRouter.get_authorization_token.restore();
            baseRouter.check_token_existence.restore();
            db.executeQuery.restore();
            mysql.createConnection.restore();
        });
    });
});
