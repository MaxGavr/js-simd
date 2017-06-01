"use strict"

var ADDITION_TIME;
var MULTIPLICATION_TIME;
var SUBTRACTION_TIME;
var ABS_TIME;
var COMPARE_TIME;

var ELAPSED_TIME;

function elapseTime(time){
    ELAPSED_TIME += time;
}

function addMatrices(A, B){
    var result = [];
    for (var i = 0; i < A.length; i++){
        result.push([]);
        for (var j = 0; j < A[i].length; j++){
            var sum = A[i][j] + B[i][j];
            result[i].push(sum);
        }
    }
    return result;
}

function add(a, b){
    var result = [];
    for (var i = 0; i < a.length; i++){
        result.push([]);
        for (var j = 0; j < b.length; j++){
            var sum = a[i] + b[j];
            result[i].push(sum);
        }
    }
    elapseTime(ADDITION_TIME);
    return result;
}

function multiply(a, b){
    var result = [];
    for (var i = 0; i < a.length; i++){
        result.push([]);
        for (var j = 0; j < b.length; j++){
            var product = a[i] * b[j];
            result[i].push(product);
        }
    }
    elapseTime(MULTIPLICATION_TIME);
    return result;
}

function subtract(a, b){
    var result = [];
    for (var i = 0; i < a.length; i++){
        result.push([]);
        for (var j = 0; j < b[i].length; j++){
            var difference = a[i] - b[i][j];
            result[i].push(difference);
        }
    }
    elapseTime(SUBTRACTION_TIME);
    return result;
}

function absolute(a){
    var rowAbs = function(row){
        return row.map(function(value){
            return Math.abs(value);
        });
    };

    elapseTime(ABS_TIME);
    if (!Array.isArray(a[0])){
        return rowAbs(a); 
    } else{
        return a.map(rowAbs);
    }    
}

function power(a){
    elapseTime(MULTIPLICATION_TIME);
    return a.map(function(value){
        return Math.pow(value, 2);
    });
}

function equalToZero(a, q){
    var result = [];
    for (var i = 0; i < a.length; i++){
        result.push([]);
        for (var j = 0; j < q; j++){
            var equality = a[i][0] == 0;
            result[i].push(equality);
        }
    }
    elapseTime(COMPARE_TIME);
    return result;
}

function lessOrEqual(a, b){
    var result = [];
    for (var i = 0; i < a.length; i++){
        result.push([]);
        for (var j = 0; j < b.length; j++){
            var res = a[i] <= b[j];
            result[i].push(res);
        }
    }
    elapseTime(COMPARE_TIME);
    return result;
}

function blend(x, y, mask){
    var result = [];
    for (var i = 0; i < x.length; i++){
        result.push([]);
        for (var j = 0; j < x[i].length; j++){
            result[i].push(mask[i][j] ? x[i][j] : y[i][j]);
        }
    }
    return result;
}

function randomFloat(minValue = -1, maxValue = 1, precision = 2){
    var number = Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue);
    return parseFloat(number.toFixed(precision));
}

function generateMatrix(x, y, empty = false){
    var result = [];
    for (var i = 0; i < x; i++){
        result.push([]);
        for (var j = 0; j < y; j++){
            if (!empty)
                result[i].push(randomFloat());
            else
                result[i].push(0);
        }
    }
    return result;
}

function getMatrixColumn(A, column){
    var result = [];
    for (var i = 0; i < A.length; i++){
        result.push(A[i][column]);
    }
    return result;
}

function formatMatrix(A, precision = 2){
    var result = [];
    for (var i = 0; i < A.length; i++){
        result.push([]);
        for (var j = 0; j < A[i].length; j++){
            result[i].push(parseFloat(A[i][j].toFixed(precision)));;
        }
    }
    return result;
}

function printMatrixToTable(id, matrix){
    var title = id.charAt(id.length - 1);
    var x = matrix.length;
    var y = matrix[0].length;

    var table = document.getElementById(id);
    table.innerHTML = "";
    var currentRow, currentCell;
    for (var i = 0; i < x + 1; i++){
        currentRow = table.insertRow();
        for (var j = 0; j < y + 1; j++){
            currentCell = currentRow.insertCell();
            if (i > 0 && i < x && j > 0 && j < y){
                currentCell.innerHTML = matrix[i][j];
            } else if (i == 0 && j == 0){
                currentCell.innerHTML = "<b>" + title + "</b>";
            } else if (i == 0 || j == 0){
                currentCell.innerHTML = "";
            } else if (i == x || j == y){
                currentCell.innerHTML = matrix[i-1][j-1];
            }
        }
    }
}

function printResults(A, B, C){
    printMatrixToTable("tableA", A);
    printMatrixToTable("tableB", B);
    printMatrixToTable("tableC", formatMatrix(C));
    document.getElementById("time").innerHTML = "Время = " + ELAPSED_TIME;
}

function getTimes(){
    ELAPSED_TIME = 0;
    ADDITION_TIME = parseInt(document.getElementById("input_t1").value);
    SUBTRACTION_TIME = parseInt(document.getElementById("input_t2").value);
    MULTIPLICATION_TIME = parseInt(document.getElementById("input_t3").value);
    ABS_TIME = parseInt(document.getElementById("input_t4").value);
    COMPARE_TIME = parseInt(document.getElementById("input_t5").value);
}

function process(){
    var p = document.getElementById("input_p").value;
    var m = document.getElementById("input_m").value;
    var q = document.getElementById("input_q").value;

    getTimes();

    var A = generateMatrix(p, m);
    var B = generateMatrix(m, q);
    var C = generateMatrix(p, q, true);

    for (var k = 0; k < m; k++){
        var a = getMatrixColumn(A, k);
        var b = B[k];

        var condition1_true = add(power(a), b);
        var condition1_false = subtract(power(a), absolute(multiply(a, b)));
        var condition1 = equalToZero(a, q);
        var condition2_false = blend(condition1_true, condition1_false, condition1);
        var condition2_true = multiply(a, b);
        var condition2 = lessOrEqual(absolute(a), absolute(b));

        var D = blend(condition2_true, condition2_false, condition2);
        C = addMatrices(C, D);
    }

    printResults(A, B, C);
}

var testA = [ [0.27, -0.47], [0.79, 0.05] ];
var testB = [ [0.43, -0.99], [0.87, -0.21] ];
var testC = [ [-0.29, -0.15], [0.33, -0.79] ];