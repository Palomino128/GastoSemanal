// =========================
// Clase Presupuesto
// =========================
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto); // Guardamos el presupuesto inicial en número
        this.restante = Number(presupuesto);    // Al inicio, el restante es igual al presupuesto
        this.gastos = [];                       // Arreglo que guarda los gastos
    }

    // Método para añadir un gasto
    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];   // Agregamos el gasto al arreglo
        this.calcularRestante();                 // Recalculamos el dinero restante
    }

    // Método para calcular el dinero restante
    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0); // Sumamos los gastos
        this.restante = this.presupuesto - gastado;  // Restante = presupuesto - gastado
    }

    // Método para eliminar un gasto según su ID
    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id); // Quitamos el gasto con ese ID
        this.calcularRestante(); // Recalculamos el restante
    }
}

// =========================
// Clase UI (Interfaz de Usuario)
// =========================
class UI {
    // Insertar presupuesto en el HTML
    insertarPresupuesto(cantidad) {
        document.querySelector('#total').textContent = cantidad.presupuesto; // Mostramos presupuesto inicial
        document.querySelector('#restante').textContent = cantidad.restante; // Mostramos presupuesto restante
    }

    // Mostrar mensaje en pantalla
    imprimirAlerta(mensaje, tipo) {
        const div = document.createElement('div'); // Creamos un div
        div.classList.add('text-center', 'alert'); // Le damos clases de estilo
        if (tipo === 'error') {
            div.classList.add('alert-danger');     // Rojo si es error
        } else {
            div.classList.add('alert-success');    // Verde si es éxito
        }
        div.textContent = mensaje; // Texto del mensaje

        // Insertamos en el HTML
        document.querySelector('.primario').insertBefore(div, formulario);

        // Eliminamos el mensaje después de 3 segundos
        setTimeout(() => {
            div.remove();
        }, 3000);
    }

    // Mostrar los gastos en la lista
    mostrarGastos(gastos) {
        this.limpiarHTML(); // Limpiamos lista anterior

        gastos.forEach(gasto => {
            const { cantidad, nombre, id } = gasto; // Desestructuramos el gasto

            const nuevoGasto = document.createElement('li'); // Creamos un li
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id; // Guardamos el id como data-id

            // Insertamos el contenido del gasto
            nuevoGasto.innerHTML = `
                ${nombre} <span class="badge badge-primary badge-pill">S/ ${cantidad}</span>
            `;

            // Botón para eliminar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Eliminar &times;';
            btnBorrar.onclick = () => {
                eliminarGasto(id); // Llamamos a la función eliminar
            };

            nuevoGasto.appendChild(btnBorrar); // Agregamos el botón al li
            gastosListado.appendChild(nuevoGasto); // Agregamos el li a la lista
        });
    }

    // Limpiar la lista de gastos
    limpiarHTML() {
        while (gastosListado.firstChild) {
            gastosListado.removeChild(gastosListado.firstChild); // Borramos todos los hijos
        }
    }

    // Actualizar el presupuesto restante
    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante; // Mostramos el nuevo restante
    }

    // Comprobar el presupuesto (si queda poco, cambiar colores)
    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj; // Extraemos valores
        const restanteDiv = document.querySelector('.restante'); // Div del restante

        // Si queda menos del 25% -> rojo
        if ((presupuesto / 4) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if ((presupuesto / 2) > restante) {
            // Si queda menos del 50% -> amarillo
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        } else {
            // Si hay suficiente dinero -> verde
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // Si el presupuesto se acabó
        if (restante <= 0) {
            this.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true; // Desactivamos botón
        }
    }
}

// =========================
// Variables globales
// =========================
const formulario = document.querySelector('#agregar-gasto'); // Formulario para gastos
const gastosListado = document.querySelector('#gastos ul');  // Lista de gastos

let presupuesto; // Guardará el objeto Presupuesto

// =========================
// Eventos
// =========================
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto); // Al cargar, pedimos presupuesto
    formulario.addEventListener('submit', agregarGasto); // Al enviar gasto, lo añadimos
}

// =========================
// Funciones
// =========================

// Preguntar presupuesto inicial
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto semanal?'); // Pedimos presupuesto

    // Validamos entrada
    if (presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload(); // Si no es válido, recargamos la página
    }

    // Creamos el objeto presupuesto
    presupuesto = new Presupuesto(presupuestoUsuario);

    // Creamos la interfaz
    ui = new UI();
    ui.insertarPresupuesto(presupuesto);
}

// Función para agregar un gasto
function agregarGasto(e) {
    e.preventDefault(); // Evitamos recargar la página

    const nombre = document.querySelector('#gasto').value; // Nombre del gasto
    const cantidad = Number(document.querySelector('#cantidad').value); // Monto del gasto

    // Validaciones
    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');
        return;
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }

    // Creamos un objeto gasto
    const gasto = { nombre, cantidad, id: Date.now() };

    // Añadimos el gasto al presupuesto
    presupuesto.nuevoGasto(gasto);

    // Mensaje de éxito
    ui.imprimirAlerta('Gasto agregado correctamente');

    // Mostramos los gastos
    ui.mostrarGastos(presupuesto.gastos);

    // Actualizamos el restante
    ui.actualizarRestante(presupuesto.restante);

    // Comprobamos presupuesto
    ui.comprobarPresupuesto(presupuesto);

    // Reiniciamos el formulario
    formulario.reset();
}

// Función para eliminar un gasto
function eliminarGasto(id) {
    presupuesto.eliminarGasto(id); // Lo eliminamos del objeto presupuesto

    ui.mostrarGastos(presupuesto.gastos); // Actualizamos lista
    ui.actualizarRestante(presupuesto.restante); // Actualizamos restante
    ui.comprobarPresupuesto(presupuesto); // Revisamos estado
}
