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

let R;   // unidades matemáticas del centro a cada lado

const W = canvas.width, H = canvas.height;

ayuda.addEventListener("click", function () {
    R = 5;
    if(obtenerValores()) {
        respuestaHTML.textContent = "";
        restricciones_list = restricciones_txt.split("\n");
        
        const puntos = obtenerPuntos(restricciones_list);
        dibujarPlano();
        // console.log(puntos);
        dibujarPuntos(puntos);

        // Ahora las intersecciones
        intersecciones(restricciones_list);
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

function obtenerPuntos(restricciones) {
    // del array original se reemplazan todas las variables solas con la variable*1, ejemplo x+y<=3 -> 1x+1y<=3
    restricciones = restricciones.map(restriccion => restriccion.replace(/(?<!\d)[xy]/g,"1$&"));
    // console.log(restricciones); // Pa ver que jala
    // Deja solo los coeficientes
    let valores = restricciones.map(restriccion => restriccion.split(/[xy<>=]/g).filter(valor => valor != ""));
    // A numero
    valores = valores.map(valor => valor.map(unidad => Number(unidad)));
    console.log(valores);
    // Pa ver que jala
    let puntos = [];
    restricciones_list = valores;
    console.log(restricciones_list);

    valores.forEach((valor, index) => {
        if(valor.length === 3) {
            R = actualizarR(valor);
            R = Math.ceil(R*1.1);
            let y1 = (valor[2] - valor[0]*-R)/valor[1];
            let y2 = (valor[2] - valor[0]*R)/valor[1];
            // let x1 = valor[2] / valor[0]; // y=0
            // let y2 = valor[2] / valor[1]; // x=0
            // puntos.push([[x1, 0], [0,y2]]);
            puntos.push([[-R, y1], [R, y2]]);
        }
        else {
            const variable = restricciones[index].match(/[xy]/g);
            // console.log(variable);
            switch(variable[0]) {
                case "x": 
                    let x1 = valor[1] / valor[0];
                    puntos.push([[x1,H], [x1,-H]]);
                    break;
                
                case "y": 
                    let y1 = valor[1] / valor[0];
                    puntos.push([[-R,y1], [R,y1]]);
                    break;
                
            }
        }

    });
    // console.log(puntos.length);
    return puntos;
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

function dibujarPuntos(puntos) {
    const esc = W / (2 * R);    // Escala, cuantos pixeles mide una unidad
    const px = x => W / 2 + x * esc;
    const py = y => H / 2 - y * esc;

    ctx.lineWidth = 1; 
    ctx.strokeStyle = "#dbc"; 
    ctx.fillStyle = "#978";

    for(let i = 0; i<puntos.length; i++) {
        
        ctx.beginPath(); 
        ctx.moveTo(px( puntos[i][0][0] ), py(puntos[i][0][1]) ); 
        ctx.lineTo(px( puntos[i][1][0] ), py(puntos[i][1][1]) ); 
        ctx.stroke();

        // console.log(puntos[i]);
    }
    // console.log("dibujarPuntos recibió: ", puntos);

}

function intersecciones(coeficientes) {
    // Puntos es un array de pares, es decir, 
    // por ejemplo [ [0,1], [4,9] ]
    // Así que compararé de a 2 pares
    let intersecciones = [];
    console.log(coeficientes);

    // Recorre los puntos iniciales
    for(let i = 0; i<coeficientes.length; i++) {
        // Recorre los siguientes
        for(let j = 0; j<coeficientes.length-i-1; j++) {

        }
    }


}

/*
6x+4y<=24
x+2y<=6
-x+y<=1
y<=2
y>=0
x>=0

x+y>=800
-0.21x+0.30y>=0
-0.03x+0.01y<=0
y>=0
x>=0

x+y<=5
-x+3y<=5
1.5x+y<=5
 */