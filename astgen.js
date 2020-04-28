const fs = require("fs");
var readline = require("readline");
const filename = "parseFile.js";

var node = {
  program: [],
};

var matchVariable = /(var\s+||let\s+||const\s+)\w+\s+\=\s+(\w+|\[\])((\s*?(\+||\-||\*||\/)\s*\w+)?)+/gm;
var inputOutput = readline.createInterface({
  input: fs.createReadStream(filename),
});

class Node {
  constructor(root, left, right) {
    this.root = root;
    this.left = left;
    this.right = right;
  }

  print() {
    console.log(this.root);
    console.log(this.left);
    console.log(this.right);
  }
}

class LinkedList {
  checkExpression(str) {
    var validExpression = true;
    if (
      str.startsWith("let") ||
      str.startsWith("const") ||
      str.startsWith("var")
    ) {
      validExpression = true;
    }

    return str;
  }

  generateTree(str) {
    let values = this.checkExpression(str);
    if (values) {
      this.addNode(values);
    }
  }

  addNode(str) {
    let acceptedTypes = ["const", "var", "let"];

    let datatype = "",
      lval = "",
      rval = "",
      remaining = "",
      i = 0;

    datatype = acceptedTypes.find((el) => el === str.split(" ")[0]);
    if (datatype) {
      remaining = str.substr(datatype.length);
    } else {
      remaining = str;
      datatype = "";
    }

    if (remaining.includes("=")) {
      while (remaining.charAt(i) !== "=") {
        lval += remaining.charAt(i);
        i++;
      }
    } else {
      while (remaining.charAt(i) !== " ") {
        lval += remaining.charAt(i);
        i++;
      }
    }
    i++;

    while (i < remaining.length) {
      rval += remaining.charAt(i);

      i++;
    }

    node.program.push({ declaration: new Node(datatype, lval, rval) });
  }
}



let functionend = true;

function checkForExpressions(data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i] === ";") {
      data = data.replace(data[i], ",");
    }
  }

  data.split(",").map((line) => {
    if (
      line.includes("()=>") ||
      line.includes("function") ||
      line.includes("import")
    ) {
      functionend = false;
    }

    if (line.includes("}")) {
      line = "";

      functionend = true;
    }

    if (line.includes("//") || line.includes("/**")) {
      let i = 0;
      let j;

      for (; i < line.length; i++) {
        if (line[i] === "/") {
          for (j = i + 1; j < line.length; j++) {
            functionend = false;
          }
        }
      }
    }

    if (functionend) {
        new LinkedList().generateTree(line.trim());
    }
  });
}
inputOutput.on("line", function (data) {
  checkForExpressions(data);
});

inputOutput.on("close", function () {
  fs.writeFile("ast.json", JSON.stringify(node), function (err) {
    if (err) throw err;
  });
});
