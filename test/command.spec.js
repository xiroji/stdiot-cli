import Command from "../src/command.js";
import chai from 'chai';

chai.should();

describe("Command", () => {

    it("should exist", () => {
        Command.should.exist;
    });

    describe(".constructor", () => {

        it("should exist", () => {
            (new Command()).should.respondTo('parse');
        });

        it("should set the correct command", function() {
            (new Command("rm <file>", "remove a file"))
                .props.command.should.equal('rm');
        });

        it("should set a required argument <file>", function() {
            let c = new Command("rm <file>", "remove a file");
            c.should.have.deep.property('props.arguments[0].name', 'file')
            c.should.have.deep.property('props.arguments[0].required', true);
            c.should.have.deep.property('props.arguments[0].optional', false);
        });

        it("should set a required argument [file]", function() {
            let c = new Command("config [file]", "remove a file");
            c.should.have.deep.property('props.arguments[0].name', 'file')
            c.should.have.deep.property('props.arguments[0].required', false);
            c.should.have.deep.property('props.arguments[0].optional', true);
        });
    });

    describe(".addOption", function() {

        it("should respondTo", () => {
            (new Command()).should.respondTo('addOption');
        });

        it("should not have any options by default", function() {
            (new Command("rm <file>", "remove a file"))
                .getOptions().should.have.length(0);
        });

        it("should set an option", function() {
            (new Command("rm <file>", "remove a file"))
                .addOption("-v, --verbose")
                .getOptions().should.have.length(1);
        });

        it("should set all options", function() {
            (new Command("rm <file>", "remove a file"))
                .addOption("-v, --verbose")
                .addOption("-f, --force")
                .getOptions().should.have.length(2);
        });
    });

    describe(".setAction", () => {

        it("should respondTo", () => {
            (new Command()).should.respondTo('setAction');
        });
    });

    describe(".getAction", () => {

        it("should respondTo", () => {
            (new Command()).should.respondTo('getAction');
        });
    });
});
