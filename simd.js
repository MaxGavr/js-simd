"use strict"

var CHART_RANGE = 20;
var CHART_WIDTH = 1200;
var CHART_HEIGHT = 700;

var ADDITION_TIME;
var MULTIPLICATION_TIME;
var SUBTRACTION_TIME;
var ABS_TIME;
var COMPARE_TIME;

var T1 = 0;
var Tn = 0;

var p, m, q;
var n;

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
    document.getElementById("time_1").innerHTML = "<b> T1 = " + T1 + " </b>";
    document.getElementById("time_n").innerHTML = "<b> Tn = " + Tn + " </b>";
}

function getTimes(){
    ADDITION_TIME = parseInt(document.getElementById("input_t1").value);
    SUBTRACTION_TIME = parseInt(document.getElementById("input_t2").value);
    MULTIPLICATION_TIME = parseInt(document.getElementById("input_t3").value);
    ABS_TIME = parseInt(document.getElementById("input_t4").value);
    COMPARE_TIME = parseInt(document.getElementById("input_t5").value);
}

function getParameters(){
    p = document.getElementById("input_p").value;
    m = document.getElementById("input_m").value;
    q = document.getElementById("input_q").value;
    n = document.getElementById("input_n").value;
}

function calculateTime(amount){
    var mul = amount.multiplication * MULTIPLICATION_TIME;
    var sum = amount.addition * ADDITION_TIME;
    var sub = amount.subtraction * SUBTRACTION_TIME;
    var comp = amount.comparison * COMPARE_TIME;
    var abs = amount.absolute * ABS_TIME;

    var additionalSums = (m - 1)* ADDITION_TIME;

    return mul + sum + sub + comp + abs + additionalSums;
}

function calculateParallelTime(amount){
    var T = 0;

    if (amount.addition > 0)
        T += Math.ceil(amount.addition / n) * ADDITION_TIME;
    if (amount.subtraction > 0)
        T += Math.ceil(amount.subtraction / n) * SUBTRACTION_TIME;
    if (amount.multiplication > 0)
        T += Math.ceil(amount.multiplication / n) * MULTIPLICATION_TIME;
    if (amount.absolute > 0)
        T += Math.ceil(amount.absolute / n) * ABS_TIME;
    if (amount.comparison > 0)
        T += Math.ceil(amount.comparison / n) * COMPARE_TIME;

    return T;
}

function calculate(A, B){
    var C = generateMatrix(p, q, true);
    T1 = 0;
    Tn = 0;

    for (var i = 0; i < p; i++){
        for (var j = 0; j < q; j++){
            var c = 0;

            var amount = {
                addition: 0,
                subtraction: 0,
                multiplication: 0,
                absolute: 0,
                comparison: 0
            };

            for (var k = 0; k < m; k++){
                var a = A[i][k];
                var b = B[k][j];
                var d = 0;

                amount.comparison += 1;
                amount.absolute += 2;
                if (Math.abs(a) <= Math.abs(b)){
                    d = a * b;
                    amount.multiplication += 1;
                }
                else{
                    amount.comparison += 1;
                    if (a == 0){
                        d = a * a + b;
                        amount.multiplication += 1;
                        amount.addition += 1;
                    }
                    else{
                        d = a * a - Math.abs(a * b);
                        amount.multiplication += 2;
                        amount.absolute += 1;
                        amount.subtraction += 1;
                    }
                }
                c += d;
            }

            C[i][j] = c;
            T1 += calculateTime(amount);
            Tn += calculateParallelTime(amount);
        }
    }

    if (n > 1){
        var parallelSumsCount = Math.ceil((m + 1) / n);
        Tn += parallelSumsCount * p * q * ADDITION_TIME;
    }
    else
        Tn += (m - 1) * p * q * ADDITION_TIME;

    return C;
}

function process(){
    getParameters();
    getTimes();
    
    var A = generateMatrix(p, m);
    var B = generateMatrix(m, q);
    var C = calculate(A, B);

    printResults(A, B, C);
}

function drawCharts(){
    getParameters();
    getTimes();

    drawChart1();
    drawChart2();
    drawChart3();
    drawChart4();
}

function drawChart1() {
    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = new google.visualization.DataTable();

        var rows = [];

        data.addColumn('number', 'r');

        for (var i = 1; i <= CHART_RANGE; i++) {
            rows.push([i]);
            data.addColumn('number', 'n = ' + i);

            n = i;

            for (var j = 1; j <= CHART_RANGE; j++) {
                m = j;

                var A = generateMatrix(p, m);
                var B = generateMatrix(m, q);
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
}

function drawChart2() {
    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = new google.visualization.DataTable();

        var rows = [];

        data.addColumn('number', 'n');

        for (var i = 1; i <= CHART_RANGE; i++) {
            rows.push([i]);
            data.addColumn('number', 'r = ' + i);

            m = i;

            for (var j = 1; j <= CHART_RANGE; j++) {
                n = j;

                var A = generateMatrix(p, m);
                var B = generateMatrix(m, q);
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
}

function drawChart3() {
    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = new google.visualization.DataTable();

        var rows = [];

        data.addColumn('number', 'n');

        for (var i = 1; i <= CHART_RANGE; i++) {
            rows.push([i]);
            data.addColumn('number', 'r = ' + i);

            m = i;

            for (var j = 1; j <= CHART_RANGE; j++) {
                n = j;

                var A = generateMatrix(p, m);
                var B = generateMatrix(m, q);
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
}

function drawChart4() {
    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = new google.visualization.DataTable();

        var rows = [];

        data.addColumn('number', 'r');

        for (var i = 1; i <= CHART_RANGE; i++) {
            rows.push([i]);
            data.addColumn('number', 'n = ' + i);

            n = i;

            for (var j = 1; j <= CHART_RANGE; j++) {
                m = j;

                var A = generateMatrix(p, m);
                var B = generateMatrix(m, q);
                var C = calculate(A, B);

                rows[i - 1].push(T1 / Tn / n);
            }
        }
        data.addRows(rows);

        var options = {
            chart: {
                title: 'График зависимости e(n,r) от ранга задачи'
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
}