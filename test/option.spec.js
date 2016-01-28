import Option from "../src/option.js";
import chai from 'chai';

chai.should();

describe("Option", () => {

    it("should exist", () => {
        Option.should.exist;
    });

    describe("#ShortOptionMatcher", () => {
    
        it("should not match a long arg", () => {
            Option.ShortOptionMatcher.test("--force").should.be.false;
        });

        it("should match a short arg", () => {
            Option.ShortOptionMatcher.test("-f").should.be.true;
        });
    });

    describe("#LongOptionMatcher", () => {
    
        it("should not match a short arg", () => {
            Option.LongOptionMatcher.test("-f").should.be.false;
        });

        it("should match a long arg", () => {
            Option.LongOptionMatcher.test("--force").should.be.true;
        });
    });

    describe(".parse", () => {

        it("should exist", () => {
            (new Option()).parse.should.exist;
        });

        it("should fail on invalid syntax", () => {
            (() => {
                new Option("-p")
            }).should.throw(SyntaxError);
        });

        it("should define the correct short flag for -p", () => {
            (new Option("-p, --no-parse"))
                .should.have.deep.property('props.flag.short', '-p');
        });

        it("should set isBool to true for --parse", () => {
            (new Option("-p, --parse"))
                .should.have.deep.property('props.isBool', true);
        });

        it("should set isBool to true for --no-parse", () => {
            (new Option("-p, --no-parse"))
                .should.have.deep.property('props.isBool', true);
        });

        it("should define the correct long flag for --no-parse", () => {
            (new Option("-p, --no-parse"))
                .should.have.deep.property('props.flag.long', '--no-parse');
        });

        it("should define the required param name", () => {
            (new Option("-p, --parse <file>"))
                .should.have.deep.property('props.arguments[0].name', 'file');
        });

        it("should define all the required param names", () => {
            let result = new Option("-p, --parse <file> <file2>");
            result.should.have.deep.property('props.arguments[0].name', 'file');
            result.should.have.deep.property('props.arguments[1].name', 'file2');
        });

        it("should throw SyntaxError when required arg is after optional", () => {
            (() => {
                new Option("-p, --parse [file] <file2>");
            }).should.throw(SyntaxError);
        });
    });
});
