import CommandSet from "../src/command_set";
import chai from 'chai';

let should = chai.should();

describe("CommandSet", () => {

    it("should exist", () => {
        CommandSet.should.exist;
    });

    describe(".setName", () => {

        it("should set the name", () => {
            (new CommandSet()).setName('app')
                .should.have.deep.property('props.name', 'app');
        });
    });

    describe(".getName", () => {

        it("should get the name", () => {
            (new CommandSet()).setName('app')
                .getName().should.equal('app');
        });
    });

    describe(".addOption", () => {

        it("should set an option", () => {
            (new CommandSet())
                .addOption("-v, --verbose")
                .props.options.should.have.length(1);
        });

        it("should set multiple options", () => {
            (new CommandSet())
                .addOption("-v, --verbose")
                .addOption("-f, --force")
                .props.options.should.have.length(2);
        });
    });

    describe(".command", () => {

        it("should set a command", () => {
            let cli = new CommandSet();
            cli.addCommand("config <file>");
            cli.props.commands.should.have.length(1);
        });

        it("should set multiple options", () => {
            let cli = new CommandSet();
            cli.addCommand("config <file>")
            cli.addCommand("restart <when>")
            cli.props.commands.should.have.length(2);
        });
    });

    describe(".start", () => {

        it("should call help if no args provided", (done) => {
            let cli = new CommandSet();
            cli.help = () => { done() };
            cli.start([]);
        });

        it("should call help when -h provided", (done) => {
            let cli = new CommandSet();
            cli.help = () => { done() };
            cli.start(['-h']);
        });

        it("should call help when --help provided", (done) => {
            let cli = new CommandSet();
            cli.help = () => { done() };
            cli.start(['--help']);
        });
    });

    describe(".searchCommands", function() {

        it("should return true on a valid command", () => {
            let cli = new CommandSet();
            cli.addCommand("parse", "parse a config file")
            cli.searchCommands("parse").getName().should.equal("parse");
        });

        it("should return false on an valid command", () => {
            let cli = new CommandSet();
            cli.addCommand("parse", "parse a config file")
            should.not.exist(cli.searchCommands("invalid-command"));
        });
    });

    describe(".isCommand", function() {

        it("should return true on a valid command", () => {
            let cli = new CommandSet();
            cli.addCommand("parse", "parse a config file")
            cli.isCommand("parse").should.be.true;
        });

        it("should return false on an valid command", () => {
            let cli = new CommandSet();
            cli.addCommand("parse", "parse a config file")
            cli.isCommand("invalid-command").should.be.false;
        });
    });

    describe(".parseArgs", () => {

        describe("On bad argument", () => {

            it("should throw a syntax on short option", () => {
                let cli = new CommandSet();
                cli.addOption('-r, --no-remote', 'Print verbose information');
                (() => {
                    cli.parseArgs(['-f']);
                }).should.throw(SyntaxError)
            });

            it("should throw a syntax on long option", () => {
                let cli = new CommandSet();
                cli.addOption('-r, --no-remote', 'Print verbose information');
                (() => {
                    cli.parseArgs(['--force']);
                }).should.throw(SyntaxError)
            });
        });

        it("should parse boolean option and set option to true", () => {
            let cli = new CommandSet();
            cli.addOption('-v, --verbose', 'Print verbose information');
            cli.parseArgs(['-v']);
            cli.getParsed().verbose.getValue().should.be.true;
        });

        it("should parse --no- boolean option and set option to false", () => {
            let cli = new CommandSet();
            cli.addOption('-r, --no-remote', 'Print verbose information');
            cli.parseArgs(['-r']);
            cli.getParsed().remote.getValue().should.be.false;
        });

        it("should collect required value", () => {
            let cli = new CommandSet();
            cli.addOption('-c, --config <file>', 'Select config file');
            cli.parseArgs(['--config', '/home/user/file1.txt']);
            cli.getParsed().config.getValue().file.should.equal('/home/user/file1.txt');
        });

        it("should collect optional value", () => {
            let cli = new CommandSet();
            cli.addOption('-c, --config <file> [otherFile]', 'Select config file');
            cli.parseArgs(['--config', '/home/user/file1.txt',
                '/home/user/file2.txt']);
            cli.getParsed().config.getValue().otherFile.should.equal('/home/user/file2.txt');
        });

        it("should collect optional without reading excess", () => {
            let cli = new CommandSet();
            cli.addOption('-c, --config <file> [otherFile]', 'Select config file');
            cli.addOption('-r, --read', 'Select config file');
            cli.parseArgs(['--config', '/home/user/file1.txt',
                '/home/user/file2.txt', '-r']);
            cli.getParsed().config.getValue().file.should.equal('/home/user/file1.txt');
            cli.getParsed().config.getValue().otherFile.should.equal('/home/user/file2.txt');
            cli.getParsed().read.getValue().should.be.true;
        });

        it("should not collect optional when not provided", () => {
            let cli = new CommandSet();
            cli.addOption('-c, --config <file> [otherFile]', 'Select config file');
            cli.addOption('-r, --read', 'Select config file');
            cli.parseArgs(['--config', '/home/user/file1.txt', '-r']);
            Object.keys(cli.getParsed().config.getValue()).length.should.equal(1);
            cli.getParsed().read.getValue().should.be.true;

        });

        it("should throw syntax error if could be either cmd or optional arg",
            () => {

            let cli = new CommandSet();
            cli.addOption('-c, --createFile <file> [otherFile]',
                'create config file');
            cli.addCommand('process', 'Process a file');
            (() => {
                cli.parseArgs(['-c', 'file1', 'process']);
            }).should.throw(SyntaxError)
        });

        it("should not throw SyntaxError if both cmd or optional arg but -- used",
            () => {

                let cli = new CommandSet();
                cli.addOption('-c, --createFile <file> [otherFile]',
                    'create config file');
                cli.addCommand('process', 'Process a file');
                (() => {
                    cli.parseArgs(['-c', 'file1', '--', 'process']);
                }).should.not.throw(SyntaxError)
            });

        it("should parse after -- if valid next arg is command",
            () => {

                let cli = new CommandSet();
                cli.addOption('-c, --createFile <file> [otherFile]',
                    'create config file');
                cli.addCommand('process', 'Process a file')
                    .addOption('-t, --type [fileType]', "File type to expect")
                cli.parseArgs(['-c', 'file1', '--', 'process', '-t', 'json']);
                cli.getParsed().createFile.getValue().file.should.equal('file1');
                cli.getParsed().type.getValue().fileType.should.equal('json');
            });
    });
});
