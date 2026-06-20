console.log("JS cargado correctamente");
document.addEventListener("DOMContentLoaded", () => {
   const esSubcarpeta = window.location.pathname.includes("/html/");
   const apiURL = "../api.php";

   const tabLoginBtn = document.getElementById("tabLoginBtn");
   const tabRegistroBtn = document.getElementById("tabRegistroBtn");
   const formLogin = document.getElementById("formLogin");
   const formRegistro = document.getElementById("formRegistro");

   if (tabLoginBtn && tabRegistroBtn) {
       tabLoginBtn.addEventListener("click", () => {
           formLogin.style.display = "block"; formRegistro.style.display = "none";
           tabLoginBtn.className = "btn btn-link text-warning fw-bold text-decoration-none me-3";
           tabRegistroBtn.className = "btn btn-link text-white-50 fw-bold text-decoration-none";
       });
       tabRegistroBtn.addEventListener("click", () => {
           formLogin.style.display = "none"; formRegistro.style.display = "block";
           tabRegistroBtn.className = "btn btn-link text-warning fw-bold text-decoration-none";
          tabLoginBtn.className = "btn btn-link text-white-50 fw-bold text-decoration-none me-3";
       });
   }
 
   if (formLogin) {
       formLogin.addEventListener("submit", async (e) => {
           e.preventDefault();
           try {
               const res = await fetch(apiURL, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                       accion: 'login',
                       correo: document.getElementById("loginCorreo").value,
                       password: document.getElementById("loginPass").value
                   })
               });
               const datos = await res.json();
               if (datos.status === "success") {
                   window.location = (datos.rol === "admin") ? "panel.html" : "perfil.html";
               } else {
                   alert("Acceso denegado: Credenciales incorrectas");
               }
           } catch (error) {
               console.error("Error en login:", error);
           }
       });
   }

   if (formRegistro) {
       formRegistro.addEventListener("submit", async (e) => {
           e.preventDefault();
           const res = await fetch(apiURL, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                nombre:document.getElementById("regNombre").value,
                correo:document.getElementById("regCorreo").value,
                 password:document.getElementById("regPass").value,
                  id_plan:document.getElementById("regPlan").value
               })
            });
                
           const datos = await res.json();
           if (datos.status === "success") {
               alert("¡Socio registrado con éxito!");
               tabLoginBtn.click();
               formRegistro.reset();
           }
       });
    }

   const formOpinion = document.getElementById("formOpinion");
   const contenedorOpiniones = document.getElementById("contenedorOpiniones");

   if (contenedorOpiniones) {
       cargarOpiniones();
   }

   if (formOpinion) {
       formOpinion.addEventListener("submit", async (e) => {
           e.preventDefault();
           const res = await fetch(apiURL, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   accion: 'guardar_opinion',
                  nombre_autor: document.getElementById("opinionAutor").value,
                   comentario: document.getElementById("opinionComentario").value
               })
           });
           const d = await res.json();
           if (d.status === "success") {
               formOpinion.reset();
               cargarOpiniones();
           }
       });
   }

   async function cargarOpiniones() {
       if (!contenedorOpiniones) return;
       contenedorOpiniones.innerHTML = "";
       const res = await fetch(`${apiURL}?recurso=opiniones`);
       const opiniones = await res.json();
       opiniones.forEach(o => {
           contenedorOpiniones.innerHTML += `
               <div class="col-12 mb-2">
                   <div class="card p-3" style="background-color: #16253d;">
                       <div class="d-flex justify-content-between align-items-center mb-1">
                           <h6 class="text-warning fw-bold mb-0">👤 ${o.nombre_autor}</h6>
                          <small class="text-muted" style="font-size:0.75rem;">${o.fecha_publicacion}</small>
                       </div>
                       <p class="mb-0 text-white-50 small" style="font-style: italic;">"${o.comentario}"</p>
                   </div>
               </div>`;
       });
   }

   const contenedorClases = document.getElementById("contenedorClases");
   if (contenedorClases) {
       fetch(`${apiURL}?recurso=sesion`).then(res => res.json()).then(sesion => {
           if (!sesion.logueado) { window.location = "login.html"; return; }
           
           document.getElementById("nombreSocioSaludo").innerText = sesion.nombre;
           document.getElementById("idSocioMuestra").innerText = sesion.id;

           fetch(`${apiURL}?recurso=clases`).then(res => res.json()).then(clases => {
               clases.forEach(c => {
                   const col = document.createElement("div");
                   col.className = "col-md-6 mb-2";
                   col.innerHTML = `
                    <div class="card p-4">
                           <h4 class="text-warning text-uppercase fw-bold mb-2">${c.nombre_clase}</h4>
                           <p class="mb-1 text-white">🏋️‍♂️ Instructor: ${c.nombre_entrenador}</p>
                           <p class="mb-1 text-white ">⏰ Horario: ${c.horario}</p>
                           <button class="btn btn-warning w-100 fw-bold text-dark mt-2 btn-reservar" data-clase="${c.id_clase}">Apartar Cita</button>
                       </div> `;
                   contenedorClases.appendChild(col);
               });

               document.querySelectorAll(".btn-reservar").forEach(btn => {
                   btn.addEventListener("click", async () => {
                       const res = await fetch(apiURL, {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ accion: 'reservar', id_cliente: sesion.id, id_clase: btn.getAttribute("data-clase") })
                       });
                       const d = await res.json();
                       if(d.status === "success") alert("¡Cita de entrenamiento agendada con éxito!");
                   });
               });
           });

           const tPagos = document.getElementById("tablaPagosCliente");
           fetch(`${apiURL}?recurso=pagos&id_cliente=${sesion.id}`).then(res => res.json()).then(pagos => { console.log("PAGOS: ", pagos);
               if(pagos.length === 0) {
                   tPagos.innerHTML = "<tr><td  class='text-center text-black small'>Sin pagos registrados</td></tr>";
               } else {
                   pagos.forEach(p => { 
                    tPagos.innerHTML += `
                    <tr>
                    <td>$${p.monto}</td>
                    <td>${p.fecha_pago}</td>
                     </tr>`; });
               }
           });
       });
   }

   const formCrud = document.getElementById("formCrud");
   if (formCrud) {
       formCrud.addEventListener("submit", async (e) => {
           e.preventDefault();
           const res = await fetch(apiURL, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  accion: document.getElementById("crudId").value ? "editar" : "crear",
    id_cliente: document.getElementById("crudId").value,
    nombre: document.getElementById("crudNombre").value,
    correo: document.getElementById("crudCorreo").value,
    password: document.getElementById("crudPass").value,
    id_plan: document.getElementById("crudPlan").value
})
           });
           const d = await res.json();
           if(d.status === "success") {
               alert("Cliente insertado correctamente en el CRUD");
               formCrud.reset();
               cargarUsuariosAdmin();
           }
       });
       cargarUsuariosAdmin();
   }

      async function cargarUsuariosAdmin() {
    const tbody = document.getElementById("tablaUsuarios");
    if (!tbody) return;

    tbody.innerHTML = "";

    const res = await fetch(apiURL);
    const usuarios = await res.json();

    usuarios.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.id_cliente}</td>
                <td>
                    <strong>${u.nombre_cliente}</strong><br>
                    <small class="text-muted">${u.correo}</small>
                </td>
               <td> Plan ${u.id_plan}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-1"
                        onclick="editarUsuario(
                            ${u.id_cliente},
                            '${u.nombre_cliente}',
                            '${u.correo}',
                            ${u.id_plan}
                        )">
                        Editar
                    </button>

                    <button class="btn btn-danger btn-sm text-white"
                        onclick="eliminarUsuario(${u.id_cliente})">
                        Eliminar
                    </button>
                </td>
            </tr>`;
    });
       
   }
   

   window.eliminarUsuario = async (id) => {
    
       if (!confirm("¿Deseas dar de baja a este socio del sistema?")) return;
       const res = await fetch(apiURL, {
           method: 'DELETE',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_cliente: id })
       });
       const d = await res.json();
       if(d.status === "success") cargarUsuariosAdmin();
   };

   window.editarUsuario = (id, nombre, correo, plan) => {

    document.getElementById("crudId").value = id;
    document.getElementById("crudNombre").value = nombre;
    document.getElementById("crudCorreo").value = correo;
    document.getElementById("crudPlan").value = plan;

    document.querySelector("#formCrud button[type='submit']").innerText =
        "ACTUALIZAR CLIENTE";
   
};
   
});