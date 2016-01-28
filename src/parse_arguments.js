export default function parseArguments(args, flags) {
  let optionalR = /^\[(.*?)\]/;
  let requiredR = /^\<(.*?)\>/;
  let result = [];
  let allowMoreRequired = true;
  args.forEach(part => {
      part = part.trim();
      if (allowMoreRequired && requiredR.test(part)) {
          var match = part.match(requiredR);
          if (match && match.length >= 1) {
              let arg = {
                  name: match[1],
                  required: true,
                  optional: false
              };
              result.push(arg);
          }
      } else if(optionalR.test(part)) {
          allowMoreRequired = false;
          var match = part.match(optionalR);
          if (match && match.length >= 1) {
              let arg = {
                  name: match[1],
                  required: false,
                  optional: true 
              };
              result.push(arg);
          }
      } else {
          throw SyntaxError([
              `${flags} does not conform to option specification`,
              ` see docs. Either invalid type or invalid`,
              ` argument position.`
          ].join(''));
      }
  });

  return result;
}
