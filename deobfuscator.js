const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const vm = require('vm');
const crypto = require('crypto'); // Import the crypto module for vm context
const request = require('request');
const express = require('express');
const { write } = require("fs");
const { readFileSync, writeFile } = require("fs");
const { argv } = require("process");

process.removeAllListeners('warning');


const app = express();
app.use(express.json());




function encrypt(version_number, blob_array) {

  return new Promise((resolve, reject) => {



  const options = {
    url: `https://newassets.hcaptcha.com/c/${version_number}/hsw.js`,
    headers: {
        'sec-ch-ua-platform': '"Windows"',
        'Referer': '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0'
    }
  }



  request(options, function(error, response, body) {
  var source = body;
  var originalScript = "";
  var proxiedFuncion = null;
  var secondFunctionActualName = null;
  var call_for_enc = null;
  var longArrayFunction = null;
  var shuffle_function = null;
  var last_function = null;

  const getMainScriptVisitor = {
    // ↓ find the main function that is executed for encrypting the blob ↓
    FunctionDeclaration(path) {
      path.traverse({
        ReturnStatement(innerPath) {
          if (
            innerPath.node.argument &&
            innerPath.node.argument.type === "BinaryExpression" &&
            innerPath.node.argument.operator === "+" &&
            innerPath.node.argument.left &&
            innerPath.node.argument.right &&
            innerPath.node.argument.left.type === "CallExpression" &&
            innerPath.node.argument.right.type === "CallExpression"
          ) {
            originalScript += generate(path.node).code + "\n";
            originalScript += path.node.id.name + "(new Uint8Array([]))";
            last_function = innerPath.node.argument.left.callee.name;
            call_for_enc = path.node.id.name;
          }
        },
      });


      
    },
    
  };


  const getSecondFunctionNameVisitor = {
    // ↓ find the function that is proxied ↓
    VariableDeclaration(path) {
      if (path.node.kind == "var") {
        path.node.declarations.forEach(declaration => {
          if (declaration.id.name == proxiedFuncion && declaration.init && declaration.init.type) {
            if (declaration.init.type == "Identifier") {
              secondFunctionActualName = declaration.init.name;
              originalScript = "var "+ proxiedFuncion + " = " + secondFunctionActualName + "\n" + originalScript
            }
          }
        });
      }
      
    }
    
  };

  const FunctionFindVisitor = {
    // ↓ find the function that is proxied ↓
    FunctionDeclaration(path) {
      if (path.node.id.name == secondFunctionActualName) {
        originalScript = generate(path.node).code + "\n"+ originalScript + "\n"
        
      }
      if (path.node.id.name == last_function) {
        originalScript = generate(path.node).code + "\n"+ originalScript + "\n"
      }
    }
  }

  const getShuffleFunction = {
    // ↓ find shuffle function (thats needed for shuffling the obfuscation strings) ↓
    ExpressionStatement(path) {
        if (path.node.expression
            && path.node.expression.expressions
            && path.node.expression.expressions[0].operator == "!"
            && path.node.expression.expressions[0].argument
            && path.node.expression.expressions[0].argument.callee
            && path.node.expression.expressions[0].argument.callee.body
            && path.node.expression.expressions[0].argument.callee.body.body
            && path.node.expression.expressions[0].argument.callee.body.body[0].type == "ForStatement"
            
        )
        {
            shuffle_function = "shuffle ="+ generate(path.node.expression.expressions[0].argument.callee).code
        }

    }
  }


  const LongArrayFindVisitor = {
    // ↓ find long array function (that contains obfuscation strings) ↓
    FunctionDeclaration(path) {
      if (path.node.id.name == longArrayFunction) {
        originalScript = generate(path.node).code + "\n" + shuffle_function + "\n" + `shuffle(${path.node.id.name})\n` + originalScript

        
      }
    }
  }

  const LongAHHFunctionFindorVisitor = {
    FunctionDeclaration(path) {
      
      // ↓ find long encryption function ↓
      if (
        path.node.body
        && path.node.body.body
        && path.node.body.body[0]
        && path.node.body.body[0].body
      )
      {
        if (path.node.body.body[0].body.type == "SwitchStatement") {
          originalScript = generate(path.node).code + "\n" + originalScript
          
        }
      }


      // ↓ find leftshift function ↓
      if (
        path.node.body
        && path.node.body.body
        && path.node.body.body[0]
        && path.node.body.body[1]
        && path.node.body.body[0].type == "ForStatement"
        && path.node.body.body[1].type == "ReturnStatement"
        && path.node.body.body[0].update
        && path.node.body.body[0].body.expression
        && path.node.body.body[0].body.expression.callee
      )
      {
          originalScript = generate(path.node).code + "\n" + originalScript
      }
      
      // ↓ find slice function ↓
      if (
        path.node.body
        && path.node.body.body
        && path.node.body.body[0]
        && path.node.body.body[1]
        && path.node.body.body[0].type == "VariableDeclaration"
        && path.node.body.body[1].type == "ExpressionStatement"
        && path.node.body.body[1].expression
        && path.node.body.body[1].expression.expressions
      )
      {
        originalScript = generate(path.node).code + "\n" + originalScript
      }
    },

    // ↓ find longass variable list ↓
    VariableDeclarator(path) {
      if (
        path.node.init
        && path.node.init.elements
        && path.node.init.elements.length == 256
      )
      {
        originalScript = generate(path.node).code + "\n" + originalScript
      }
    }
    
  }
  
  
  const ast = parser.parse(source);
  traverse(ast, getMainScriptVisitor);
  try {
    const result = vm.runInThisContext(originalScript);
  } catch (error) {
      if (error instanceof ReferenceError) {
        proxiedFuncion = error.message.match(/(\w+) is not defined/)[1];
      } 
  }
  // console.log("proxied function -> "+ proxiedFuncion)
  traverse(ast, getSecondFunctionNameVisitor);
  // console.log("second function -> "+ secondFunctionActualName  + "()")

  traverse(ast, FunctionFindVisitor);

  try {
    const result = vm.runInThisContext(originalScript);
  } catch (error) {
      if (error instanceof ReferenceError) {
        longArrayFunction = error.message.match(/(\w+) is not defined/)[1];
      } 
  }
  // console.log("long array function -> "+ longArrayFunction  + "()")

  traverse(ast, getShuffleFunction);


  traverse(ast, LongArrayFindVisitor);

  traverse(ast, LongAHHFunctionFindorVisitor);

  // delete last line from originalScript
  // add the call to the function with the array
  
  originalScript = originalScript.trim().split('\n');
  originalScript.pop(); // Removes the last line
  originalScript = originalScript.join('\n');

  

  originalScript += `
  function encrypt() {
    return ${call_for_enc}(new Uint8Array([${blob_array}]));
  }
  `;
  const context = vm.createContext({ crypto }); // we need to pass the crypto module to the vm context

  vm.runInContext(originalScript, context);
  encrypted_value = vm.runInContext("encrypt()", context);


  resolve(encrypted_value);
}
)}
  )};


  function writeCodeToFile(code) {
    let outputPath = "output.js";
    writeFile(outputPath, code, (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log(`Wrote file to ${outputPath}`);
      }
    });
  }

hsw_version = argv[2];
Uint8ArrayBlob = JSON.parse(process.argv[3].replace(/'/g, '"')); 


encrypt(hsw_version, Uint8ArrayBlob).then((result) => {
    console.log(result);
});


