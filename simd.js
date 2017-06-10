"use strict"

var CHART_RANGE;
var CHART_AMOUNT;
var CHART_WIDTH = 1200;
var CHART_HEIGHT = 600;

var ADDITION_TIME;
var MULTIPLICATION_TIME;
var SUBTRACTION_TIME;
var ABS_TIME;
var COMPARE_TIME;

var T1;
var Tn;

var p, m, q;
var n;

var totalOperations = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    absolute: 0,
    comparison: 0
};

var operationRanks = {
    firstIf: 0, // two modules + comparison
    firstIfTrue: 0, // multiplication
    secondIf: 0, // comparison
    secondIfTrue: 0, // multiplication + addition
    secondIfFalse: 0 // two multiplication + module + subtraction
}

function generateMatrix(x, y, empty = false){

    function randomFloat(minValue = -1, maxValue = 1, precision = 2){
        var number = Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue);
        return parseFloat(number.toFixed(precision));
    }

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

function printResults(A, B, C){

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
                    currentCell.innerHTML = matrix[i-1][j-1];
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

    printMatrixToTable("tableA", A);
    printMatrixToTable("tableB", B);
    printMatrixToTable("tableC", formatMatrix(C));
    document.getElementById("time_1").innerHTML = "<b> T1 = " + T1 + " </b>";
    document.getElementById("time_n").innerHTML = "<b> Tn = " + Tn + " </b>";
}

function getParameters(){
    p = parseInt(document.getElementById("input_p").value);
    m = parseInt(document.getElementById("input_m").value);
    q = parseInt(document.getElementById("input_q").value);
    n = parseInt(document.getElementById("input_n").value);

    CHART_RANGE = parseInt(document.getElementById("input_chart_range").value);
    CHART_AMOUNT = parseInt(document.getElementById("input_chart_amount").value);

    ADDITION_TIME = parseInt(document.getElementById("input_t1").value);
    SUBTRACTION_TIME = parseInt(document.getElementById("input_t2").value);
    MULTIPLICATION_TIME = parseInt(document.getElementById("input_t3").value);
    ABS_TIME = parseInt(document.getElementById("input_t4").value);
    COMPARE_TIME = parseInt(document.getElementById("input_t5").value);
}

function reset(){
    T1 = 0;
    Tn = 0;

    totalOperations.multiplication = 0;
    totalOperations.addition = 0;
    totalOperations.subtraction = 0;
    totalOperations.comparison = 0;
    totalOperations.absolute = 0;

    operationRanks.firstIf = 0;
    operationRanks.firstIfTrue = 0;
    operationRanks.secondIf = 0;
    operationRanks.secondIfTrue = 0;
    operationRanks.secondIfFalse = 0;
}

function calculateTime(){
    var mul = totalOperations.multiplication * MULTIPLICATION_TIME;
    var sum = totalOperations.addition * ADDITION_TIME;
    var sub = totalOperations.subtraction * SUBTRACTION_TIME;
    var comp = totalOperations.comparison * COMPARE_TIME;
    var abs = totalOperations.absolute * ABS_TIME;

    var additionalSums = (m - 1) * p * q * ADDITION_TIME;

    return mul + sum + sub + comp + abs + additionalSums;
}

function calculateParallelTime(){
    var T = 0;

    T += calculateParallelStages(operationRanks.firstIf * 2) * ABS_TIME;
    T += calculateParallelStages(operationRanks.firstIf) * COMPARE_TIME;

    T += calculateParallelStages(operationRanks.firstIfTrue) * MULTIPLICATION_TIME;

    T += calculateParallelStages(operationRanks.secondIf) * COMPARE_TIME;

    T += calculateParallelStages(operationRanks.secondIfTrue) * MULTIPLICATION_TIME;
    T += calculateParallelStages(operationRanks.secondIfTrue) * ADDITION_TIME;

    T += calculateParallelStages(operationRanks.secondIfFalse * 2) * MULTIPLICATION_TIME;
    T += calculateParallelStages(operationRanks.secondIfFalse) * ABS_TIME;
    T += calculateParallelStages(operationRanks.secondIfFalse) * SUBTRACTION_TIME;

    T += calculateParallelStages(m - 1) * p * q * ADDITION_TIME;

    return T;
}

function calculateParallelStages(amountOfOperations){
    if (n > 1){
        var stages = Math.ceil(amountOfOperations / n);
    }
    else{
        stages = amountOfOperations;
    }
    return stages;
}

function calculateDivergency(){
    var Lavg = (operationRanks.firstIf * COMPARE_TIME  * 2 +
               operationRanks.firstIf * 2 * ABS_TIME +
               operationRanks.firstIfTrue * MULTIPLICATION_TIME * 2 +
               operationRanks.secondIf * COMPARE_TIME +
               operationRanks.secondIfTrue * ADDITION_TIME * 2 +
               operationRanks.secondIfTrue * MULTIPLICATION_TIME +
               operationRanks.secondIfFalse * (MULTIPLICATION_TIME + SUBTRACTION_TIME + ABS_TIME) * 2 +
               operationRanks.secondIfFalse * MULTIPLICATION_TIME +
               calculateParallelStages(m - 1) * p * q * ADDITION_TIME * 4) / (2 * m * p * q);

    var Lsum = Tn;
    return Lsum / Lavg;
}

function calculate(A, B){
    reset();
    var C = generateMatrix(p, q, true);

    for (var i = 0; i < p; i++){
        for (var j = 0; j < q; j++){
            var c = 0;

            for (var k = 0; k < m; k++){
                var a = A[i][k];
                var b = B[k][j];
                var d = 0;

                totalOperations.comparison += 1;
                totalOperations.absolute += 2;
                operationRanks.firstIf += 1;
                if (Math.abs(a) <= Math.abs(b)){
                    d = a * b;

                    totalOperations.multiplication += 1;
                    operationRanks.firstIfTrue += 1;
                }
                else{
                    totalOperations.comparison += 1;
                    operationRanks.secondIf += 1;
                    if (b == 0){
                        d = a * a + b;

                        totalOperations.multiplication += 1;
                        totalOperations.addition += 1;
                        operationRanks.secondIfTrue += 1;
                    }
                    else{
                        d = a * a - Math.abs(a * b);

                        totalOperations.multiplication += 2;
                        totalOperations.absolute += 1;
                        totalOperations.subtraction += 1;
                        operationRanks.secondIfFalse += 1;
                    }
                }
                c += d;
            }
            C[i][j] = c;
        }
    }

    T1 = calculateTime();
    Tn = calculateParallelTime();
    return C;
}

function process(){
    getParameters();
    
    var A = generateMatrix(p, m);
    var B = generateMatrix(m, q);
    var C = calculate(A, B);

    printResults(A, B, C);
}

function drawCharts(){
    getParameters();

    var A = generateMatrix(p, CHART_RANGE);
    var B = generateMatrix(CHART_RANGE, q);

    drawChart_Ky_n(A, B);
    drawChart_Ky_r(A, B);
    drawChart_e_n(A, B);
    drawChart_e_r(A, B);
    drawChart_D_n(A, B);
    drawChart_D_r(A, B);
}

function drawChart_Ky_n(A, B) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'n');
    
    var rows = [];

    for (var i = 1; i <= CHART_RANGE; i++){
        n = i;
        rows.push([n]);

        for (var j = 1; j <= CHART_AMOUNT; j++){
            m = j;

            if (i == 1){
                data.addColumn('number', 'r = ' + j);
            }

            var C = calculate(A, B);
            rows[i - 1].push(T1 / Tn);
        }
    }
    data.addRows(rows);

    var options = {
        chart: {
            title: 'График зависимости Ky(n,r) от количества процессорных элементов n'
        },
        hAxis: {
            title: "Количество процессорных элементов n"
        },
        vAxis: {
            title: "Коэффициент ускорения Ку"
        },
        width: CHART_WIDTH,
        height: CHART_HEIGHT
    };

    var chart = new google.charts.Line(document.getElementById('chart_Ky_n'));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function drawChart_Ky_r(A, B) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'r');
    var rows = [];

    for (var i = 1; i <= CHART_RANGE; i++){
        m = i;       
        rows.push([m]);

        for (var j = 1; j <= CHART_AMOUNT; j++){
            n = j;

            if (i == 1){
                data.addColumn('number', 'n = ' + j);
            }

            var C = calculate(A, B);
            rows[i - 1].push(T1 / Tn);
        }
    }
    data.addRows(rows);

    var options = {
        chart: {
            title: 'График Ky(n,r) от ранга задачи'
        },
        hAxis: {
            title: "Ранг задачи r"
        },
        vAxis: {
            title: "Коэффициент ускорения Ку"
        },
        width: CHART_WIDTH,
        height: CHART_HEIGHT
    };

    var chart = new google.charts.Line(document.getElementById('chart_Ky_r'));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function drawChart_e_n(A, B) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'n');
    var rows = [];

    for (var i = 1; i <= CHART_RANGE; i++){
        n = i;
        rows.push([n]);

        for (var j = 1; j <= CHART_AMOUNT; j++){
            m = j;

            if (i == 1){
                data.addColumn('number', 'r = ' + j);
            }

            var C = calculate(A, B);
            rows[i - 1].push(T1 / Tn / n);
        }
    }
    data.addRows(rows);

    var options = {
        chart: {
            title: 'График зависимости e(n,r) от количества процессорных элементов n'
        },
        hAxis: {
            title: "Количество процессорных элементов n"
        },
        vAxis: {
            title: "Эффективность e"
        },
        width: CHART_WIDTH,
        height: CHART_HEIGHT
    };

    var chart = new google.charts.Line(document.getElementById('chart_e_n'));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function drawChart_e_r(A, B) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'r');
    var rows = [];

    for (var i = 1; i <= CHART_RANGE; i++){
        m = i;        
        rows.push([m]);

        for (var j = 1; j <= CHART_AMOUNT; j++){
            n = j;

            if (i == 1){
                data.addColumn('number', 'n = ' + j);
            }

            var C = calculate(A, B);
            rows[i - 1].push(T1 / Tn / n);
        }
    }
    data.addRows(rows);

    var options = {
        chart: {
            title: 'График зависимости e(n,r) от ранга задачи',
        },
        hAxis: {
            title: "Ранг задачи r"
        },
        vAxis: {
            title: "Эффективность e"
        },
        
        width: CHART_WIDTH,
        height: CHART_HEIGHT
    };

    var chart = new google.charts.Line(document.getElementById('chart_e_r'));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function drawChart_D_n(A, B) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'n');
    var rows = [];

    for (var i = 1; i <= CHART_RANGE; i++){
        n = i;
        rows.push([n]);

        for (var j = 1; j <= CHART_AMOUNT; j++){
            m = j;

            if (i == 1){
                data.addColumn('number', 'r = ' + j);
            }

            var C = calculate(A, B);
            rows[i - 1].push(calculateDivergency());
        }
    }
    data.addRows(rows);

    var options = {
        chart: {
            title: 'График зависимости D(n,r) от количества процессорных элементов n'
        },
        hAxis: {
            title: "Количество процессорных элементов n"
        },
        vAxis: {
            title: "Коэффициент расхождения программы D"
        },
        width: CHART_WIDTH,
        height: CHART_HEIGHT
    };

    var chart = new google.charts.Line(document.getElementById('chart_D_n'));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function drawChart_D_r(A, B) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'r');
    var rows = [];

    for (var i = 1; i <= CHART_RANGE; i++){
        m = i;       
        rows.push([m]);

        for (var j = 1; j <= CHART_AMOUNT; j++){
            n = j;

            if (i == 1){
                data.addColumn('number', 'n = ' + j);
            }

            var C = calculate(A, B);
            rows[i - 1].push(calculateDivergency());
        }
    }
    data.addRows(rows);

    var options = {
        chart: {
            title: 'График зависимости D(n,r) от ранга задачи r'
        },
        hAxis: {
            title: "Ранг задачи r"
        },
        vAxis: {
            title: "Коэффициент расхождения программы D"
        },
        width: CHART_WIDTH,
        height: CHART_HEIGHT
    };

    var chart = new google.charts.Line(document.getElementById('chart_D_r'));
    chart.draw(data, google.charts.Line.convertOptions(options));
}