const respuestaHTML = document.getElementById("respuesta");
const ayuda = document.getElementById("ayuda");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let variableX;
let variableY;
let objetivo;
let restricciones_txt;
let restricciones_list
let tipo;
let restriccionesConOperador = [];

let interseccionesDibujar = [];

let R;   // unidades matemáticas del centro a cada lado

const W = canvas.width, H = canvas.height;

ayuda.addEventListener("click", function () {
    R = 5;
    restriccionesConOperador = [];
    interseccionesDibujar = [];
    if(obtenerValores()) {
        respuestaHTML.textContent = "";
        restricciones_list = restricciones_txt.split("\n");
        
        const rectas = obtenerRectas(restricciones_list);
        dibujarPlano();
        // console.log(rectas);
        dibujarRectas(rectas);

        // Ahora las intersecciones
        const inters= intersecciones(restriccionesConOperador);
        // Las que cumplen
        const intersPro = interseccionesCumplen(inters);
        console.log(intersPro);
        // La más pro
        const resultado = resultadoOptimo(intersPro);
        console.log(resultado);

        dibujarFuncionObjetivo(resultado, objetivo);

        dibujarAreaFactible(interseccionesDibujar);

        respuestaHTML.textContent = `Se necesitan ${resultado.x.toFixed(2)} de ${variableX} y ${resultado.y.toFixed(2)} de ${variableY}, consiguiendo que z = ${resultado.final.toFixed(2)}`;
    } else {
        respuestaHTML.textContent = "Algo pasó :c";
    }
});

function obtenerValores() {
    try {
        variableX = document.getElementById("variable_X").value;
        variableY = document.getElementById("variable_Y").value;
        objetivo = document.getElementById("objetivo").value;
        restricciones_txt = String(document.getElementById("restricciones").value.trim());
        tipo = document.getElementById("sct_tipo").value;
        
        if(/*variableX.trim().length == 0 || variableY.trim().length == 0 || objetivo.trim().length == 0 ||*/ restricciones_txt.length == 0) {
            throw new Error("Llena todos los espacios porfa")
        } else {
            return true;
        }
    } catch (error) {
        respuestaHTML.textContent = String(error);
        return false;
    }
}

function dibujarPlano() {
    const esc = W / (2 * R);
    const px = x => W / 2 + x * esc;
    const py = y => H / 2 - y * esc;
    ctx.clearRect(0, 0, W, H);

    const paso = Math.max(1, Math.round(R / 10));
    // Estilos para las líneas
    ctx.lineWidth = 1; 
    ctx.strokeStyle = "#e3e3e3"; 
    ctx.fillStyle = "#666";

    ctx.font = "11px sans-serif";
    for (let i = -R; i <= R; i += paso) {
        ctx.beginPath(); 
        ctx.moveTo(px(i), 0); 
        ctx.lineTo(px(i), H); 
        ctx.stroke();

        ctx.beginPath(); 
        ctx.moveTo(0, py(i)); 
        ctx.lineTo(W, py(i)); 
        ctx.stroke();
        
        if (i !== 0) { 
            ctx.fillText(i, px(i) - 3, py(0) + 13); 
            ctx.fillText(i, px(0) + 4, py(i) + 4); 
        }
}

}

function obtenerRectas(restricciones) {
    // del array original se reemplazan todas las variables solas con la variable*1, ejemplo x+y<=3 -> 1x+1y<=3
    restricciones = restricciones.map(restriccion => restriccion.replace(/(?<!\d)[xy]/g,"1$&"));
    // console.log(restricciones); // Pa ver que jala
    // Deja solo los coeficientes
    let valores = restricciones.map(restriccion => restriccion.split(/[xy<>=]/g).filter(valor => valor != ""));

    let operadores = restricciones.map(restriccion => restriccion.match(/[<>]=?|=/g)[0]);
    // console.log("operadores:", operadores);
    // A numero
    valores = valores.map(valor => valor.map(unidad => Number(unidad)));
    console.log(valores);
    // Pa ver que jala
    let rectas = [];

    // Ocupo hacer lo mismo para el valor objetivo me lleva la cola
    // todo x o y que esté solito le pone un 1 antes
    objetivo = objetivo.replace(/(?<!\d)[xy]/g,"1$&");
    // Se deja solo numeros
    objetivoTemp = objetivo.split(/[xy<>=]/g).filter(valor => valor != "");
    // Se convierte a numero
    objetivoTemp = objetivoTemp.map(valor => Number(valor));

    // console.log(objetivo);
    // console.log(objetivoTemp);
    objetivo = {a: objetivoTemp[0], b:objetivoTemp[1], op: tipo};
    // console.log(objetivo);

    valores.forEach((valor, index) => {
        if(valor.length === 3) {
            R = actualizarR(valor);
            R = Math.ceil(R*1.1);
            let y1 = (valor[2] - valor[0]*-R)/valor[1];
            let y2 = (valor[2] - valor[0]*R)/valor[1];
            // let x1 = valor[2] / valor[0]; // y=0
            // let y2 = valor[2] / valor[1]; // x=0
            // rectas.push([[x1, 0], [0,y2]]);
            rectas.push([[-R, y1], [R, y2]]);
            restriccionesConOperador.push({a:valor[0], b:valor[1], c:valor[2], op: operadores[index]});
        }
        else {
            const variable = restricciones[index].match(/[xy]/g);
            // console.log(variable);
            switch(variable[0]) {
                case "x": 
                    let x1 = valor[1] / valor[0];
                    rectas.push([[x1,H], [x1,-H]]);
                    restriccionesConOperador.push({a:valor[0], b:0, c:valor[1], op: operadores[index]});
                    break;
                
                case "y": 
                    let y1 = valor[1] / valor[0];
                    rectas.push([[-R,y1], [R,y1]]);
                    restriccionesConOperador.push({a:0, b:valor[0], c:valor[1], op: operadores[index]});
                    break;
                
            }
        }

    });
    // console.log(rectas.length);
    return rectas;
}

function actualizarR(valores) {
    // valores[0] = x
    // valores[1] = y
    // valores[2] = resultado
    const a = valores[0]
    const b = valores[1]
    const c = valores[2]

    const op1 = Math.abs(Number.isFinite((c/a)) ? (c/a) : 0);
    const op2 = Math.abs(Number.isFinite((c/b)) ? (c/b) : 0);

    return Math.max(op1, op2, R);
    
}

function dibujarRectas(rectas) {
    const esc = W / (2 * R);    // Escala, cuantos pixeles mide una unidad
    const px = x => W / 2 + x * esc;
    const py = y => H / 2 - y * esc;

    ctx.lineWidth = 1; 
    ctx.strokeStyle = "rgb(255, 101, 178)"; 
    ctx.fillStyle = "rgb(157, 51, 104)";

    for(let i = 0; i<rectas.length; i++) {
        
        ctx.beginPath(); 
        ctx.moveTo(px( rectas[i][0][0] ), py(rectas[i][0][1]) ); 
        ctx.lineTo(px( rectas[i][1][0] ), py(rectas[i][1][1]) ); 
        ctx.stroke();

        // console.log(rectas[i]);
    }
    // console.log("dibujarRectas recibió: ", rectas);

}

function intersecciones(coeficientes) {
    // recibo coeficientes ;-;
    let intersecciones = [];
    // console.log("intersecciones recibe: ", coeficientes);

    // Recorre los coeficientes iniciales
    for(let i = 0; i<coeficientes.length-1; i++) {
        // Recorre los siguientes
        for(let j = i+1; j<coeficientes.length; j++) {
            let determinador = (coeficientes[i].a * coeficientes[j].b) - (coeficientes[j].a * coeficientes[i].b);
            if(determinador != 0) {
                let x = ((coeficientes[i].c * coeficientes[j].b) - (coeficientes[j].c * coeficientes[i].b))/determinador;
                let y = ((coeficientes[i].a * coeficientes[j].c) - (coeficientes[j].a * coeficientes[i].c))/determinador;
                intersecciones.push([x,y]);
            }
        }
    }
    coeficientes.push({a: 1, b: 0, c: R})
    coeficientes.push({a: 1, b: 0, c: -R})
    coeficientes.push({a: 0, b: 1, c: R})
    coeficientes.push({a: 0, b: 1, c: -R})

    for(let i = 0; i<coeficientes.length-1; i++) {
        // Recorre los siguientes
        for(let j = i+1; j<coeficientes.length; j++) {
            let determinador = (coeficientes[i].a * coeficientes[j].b) - (coeficientes[j].a * coeficientes[i].b);
            if(determinador != 0) {
                let x = ((coeficientes[i].c * coeficientes[j].b) - (coeficientes[j].c * coeficientes[i].b))/determinador;
                let y = ((coeficientes[i].a * coeficientes[j].c) - (coeficientes[j].a * coeficientes[i].c))/determinador;
                interseccionesDibujar.push([x,y]);
            }
        }
    }
    return intersecciones;
}

function interseccionesCumplen(intersecciones) {
    let interseccionesPro;

    interseccionesPro = intersecciones.filter(inter => {

        for(let i = 0; i<restriccionesConOperador.length; i++) {
            switch(restriccionesConOperador[i].op) {
                case "<":
                    if(!(operacion(restriccionesConOperador[i], inter) < restriccionesConOperador[i].c))
                        return false;
                    break;
                case ">":
                    if(!(operacion(restriccionesConOperador[i], inter) > restriccionesConOperador[i].c))
                        return false;
                    break;
                case "<=":
                    if(!(operacion(restriccionesConOperador[i], inter) <= restriccionesConOperador[i].c))
                        return false;
                    break;
                case ">=":
                    if(!(operacion(restriccionesConOperador[i], inter) >= restriccionesConOperador[i].c))
                        return false;
                    break;
                case "=":
                    if(!(operacion(restriccionesConOperador[i], inter) == restriccionesConOperador[i].c))
                        return false;
                break;
            }
        }
        return true;
    });
    interseccionesDibujar = interseccionesDibujar.filter(inter => {

        for(let i = 0; i<restriccionesConOperador.length; i++) {
            switch(restriccionesConOperador[i].op) {
                case "<":
                    if(!(operacion(restriccionesConOperador[i], inter) < restriccionesConOperador[i].c))
                        return false;
                    break;
                case ">":
                    if(!(operacion(restriccionesConOperador[i], inter) > restriccionesConOperador[i].c))
                        return false;
                    break;
                case "<=":
                    if(!(operacion(restriccionesConOperador[i], inter) <= restriccionesConOperador[i].c))
                        return false;
                    break;
                case ">=":
                    if(!(operacion(restriccionesConOperador[i], inter) >= restriccionesConOperador[i].c))
                        return false;
                    break;
                case "=":
                    if(!(operacion(restriccionesConOperador[i], inter) == restriccionesConOperador[i].c))
                        return false;
                break;
            }
        }
        return true;
    });

    console.log(interseccionesPro);
    return interseccionesPro;
}

function operacion(coso, interseccion) {
    return coso.a * interseccion[0] + coso.b * interseccion[1];
}

function resultadoOptimo(interseccionesQueCumplen) {
    // interseccionesQueCumplen = interseccionesQueCumplen.filter(interseccion => interseccion[0] != 0 && interseccion[1] != 0)
    console.log(objetivo);

    let results = [];
    interseccionesQueCumplen.forEach(interseccion => {
        results.push(operacion(objetivo, interseccion));
    });
    console.log(results);

    
    
    if(objetivo.op == 'min') {
        let coso = interseccionesQueCumplen[results.indexOf(Math.min(...results))];
        console.log(Math.max(...results));
        console.log(coso);
        let result = {x: coso[0], y: coso[1], final: Math.min(...results)} 
        return result;
    } else {
        let coso = interseccionesQueCumplen[results.indexOf(Math.max(...results))];
        console.log(Math.max(...results));
        console.log(coso);
        let result = {x: coso[0], y: coso[1], final: Math.max(...results)} 
        return result;
    }
}

function dibujarFuncionObjetivo(resultado, objetivo) {
    const esc = W / (2 * R);    // Escala, cuantos pixeles mide una unidad
    const px = x => W / 2 + x * esc;
    const py = y => H / 2 - y * esc;

    let y1 = (resultado.final - objetivo.a*-R)/objetivo.b;
    let y2 = (resultado.final - objetivo.a*R)/objetivo.b;
// console.log("objetivo:", objetivo, "resultado:", resultado);
// console.log("y1:", y1, "y2:", y2);
    ctx.lineWidth = 1; 
    ctx.strokeStyle = "rgb(97, 232, 126)"; 
    ctx.fillStyle = "rgb(50, 160, 75)";

    ctx.beginPath(); 
    ctx.moveTo(px( -R ), py(y1) ); 
    ctx.lineTo(px( R ), py(y2) ); 
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px(resultado.x), py(resultado.y), 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(97, 232, 126)";
    ctx.fill();
    
    ctx.fillStyle = "rgb(32, 101, 48)";
    ctx.fillText(`(${resultado.x.toFixed(2)},${resultado.y.toFixed(2)})`,px(resultado.x - 1), py(resultado.y + 1));

}

function areaFactible(vertices) {
    // Ordenar los vértices ;-;
    let xs = vertices.map(vertice => vertice[0]);
    let ys = vertices.map(vertice => vertice[1]);
    let centroX = xs.reduce((acc, nuevo) => acc + nuevo, 0) / xs.length;
    let centroY = ys.reduce((acc, nuevo) => acc + nuevo, 0) / ys.length;
    let angulos = [];
    // console.log(centroX, centroY);
    // console.log(vertices);
    angulos = vertices.map(vertice => {
        let dx = vertice[0] - centroX;
        let dy = vertice[1] - centroY;
        return Math.atan2(dy, dx);
    });

    // console.log(angulos);
    let arr = [];
    arr = angulos.map((ang, index) => {
        return {angulo: ang, vertice: vertices[index]};
    });

    arr.sort((a, b) => a.angulo - b.angulo);
    console.log(arr);

    return arr;
}

function dibujarAreaFactible(vertices) {
    let vert = areaFactible(vertices).map(v => v.vertice);
    console.log(vert);
    const esc = W / (2 * R);    // Escala, cuantos pixeles mide una unidad
    const px = x => W / 2 + x * esc;
    const py = y => H / 2 - y * esc;
    ctx.lineWidth = 1; ; 
    
    ctx.beginPath()
    ctx.moveTo(px(vert[0][0]), py(vert[0][1]));
    for(let i = 1; i<vert.length; i++) {
        ctx.lineTo(px(vert[i][0]), py(vert[i][1]));
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(50, 160, 75,0.3)";
    ctx.fill();

}
/*
6x+4y<=24
x+2y<=6
-x+y<=1
y<=2
y>=0
x>=0

0.3x+0.9y

x+y>=800
-0.21x+0.30y>=0
-0.03x+0.01y<=0
y>=0
x>=0

x+y<=5
-x+3y<=5
1.5x+y<=5
 */