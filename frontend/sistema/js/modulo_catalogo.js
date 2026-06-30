document.addEventListener("DOMContentLoaded", () => {
    
    let usuarioActual = localStorage.getItem("martex_usuario_activo");
    if (!usuarioActual) {
        usuarioActual = "User_Name.";
        localStorage.setItem("martex_usuario_activo", usuarioActual);
    }
    
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
        userNameElement.textContent = usuarioActual;
    }

    let productos = [];
    let filtroActual = "Todos";

    // Elementos del DOM
    const gridProductos = document.getElementById("grid-productos");
    const buscador = document.getElementById("buscador");
    const botonesFiltro = document.querySelectorAll(".filter-btn");
    
    const sidePanel = document.getElementById("side-panel");
    const btnAddProduct = document.getElementById("btn-add-product");
    const btnClosePanel = document.getElementById("btn-close-panel");
    const btnCancel = document.getElementById("btn-cancel");
    const productForm = document.getElementById("product-form");
    const panelTitle = document.getElementById("panel-title");

    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async function cargarProductos() {
        try {
            const res = await fetch(CONFIG.API_URL + '/productos');
            if (!res.ok) throw new Error('Error al cargar productos');
            productos = await res.json();
            renderProductos();
        } catch (error) {
            console.error(error);
            if (gridProductos) gridProductos.innerHTML = `<div class="col-span-full text-center text-red-500 py-10">No se pudieron cargar los productos. Asegúrate de que el servidor esté corriendo.</div>`;
        }
    }

    function renderProductos() {
        if (!gridProductos) return;
        gridProductos.innerHTML = "";
        
        const textoBusqueda = buscador ? buscador.value.toLowerCase() : "";
        
        const productosFiltrados = productos.filter(p => {
            const coincideCategoria = filtroActual === "Todos" || p.categoria === filtroActual;
            const coincideBusqueda = p.nombre.toLowerCase().includes(textoBusqueda);
            return coincideCategoria && coincideBusqueda;
        });

        if (productosFiltrados.length === 0) {
            gridProductos.innerHTML = `<div class="col-span-full text-center text-medical-muted py-10">No se encontraron productos.</div>`;
            return;
        }

        productosFiltrados.forEach(prod => {
            let badgeColor = "text-blue-600";
            if(prod.categoria === 'Médico') badgeColor = "text-blue-600";
            if(prod.categoria === 'Enfermería') badgeColor = "text-pink-600";
            if(prod.categoria === 'Estética') badgeColor = "text-purple-600";
            if(prod.categoria === 'Dental') badgeColor = "text-teal-600";
            if(prod.categoria === 'Barbería') badgeColor = "text-orange-600";

            const imagenUrl = prod.imagen_url && prod.imagen_url.startsWith('http') 
                ? prod.imagen_url 
                : (prod.imagen_url ? CONFIG.BASE_URL + prod.imagen_url : 'imagenes/placeholder.jpeg');

            const card = document.createElement("div");
            card.className = "bg-medical-card border border-medical-border rounded-lg p-4 hover:bg-medical-bg transition-colors flex flex-col h-full relative group";
            
            card.innerHTML = `
                <div class="h-44 w-full bg-medical-bg rounded-md mb-4 overflow-hidden border border-medical-border/80">
                    <img src="${imagenUrl}" alt="${prod.nombre}" 
                         class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                         onerror="this.onerror=null; this.src='imagenes/placeholder.jpeg';">
                </div>
                <div class="flex-1">
                    <h3 class="text-medical-dark font-semibold text-sm mb-1 leading-tight">${prod.nombre}</h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider ${badgeColor}">${prod.categoria}</span>
                </div>
                <div class="flex items-center justify-between mt-4 pt-3 border-t border-medical-border/60">
                    <span class="text-medical-primary font-bold">$${parseFloat(prod.precio_base).toFixed(2)}</span>
                    <div class="flex space-x-2">
                        <button onclick="editarProducto('${prod.id}')" class="text-xs text-medical-muted hover:text-medical-dark px-2 py-1 bg-medical-bg rounded border border-medical-border transition-colors">Editar</button>
                        <button onclick="eliminarProducto('${prod.id}')" class="text-xs text-red-500 hover:text-red-600 px-2 py-1 bg-medical-bg rounded border border-medical-border transition-colors" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `;
            gridProductos.appendChild(card);
        });
    }

    // Filtros de Categoría
    botonesFiltro.forEach(btn => {
        btn.addEventListener("click", () => {
            botonesFiltro.forEach(b => {
                b.classList.remove("border-medical-primary", "text-medical-primary", "bg-medical-primary/10");
                b.classList.add("border-transparent", "text-medical-muted");
            });
            btn.classList.add("border-medical-primary", "text-medical-primary", "bg-medical-primary/10");
            btn.classList.remove("border-transparent", "text-medical-muted");
            
            filtroActual = btn.getAttribute("data-filter");
            renderProductos();
        });
    });

    if (buscador) buscador.addEventListener("input", renderProductos);

    // Panel lateral para añadir/editar productos
    function abrirPanel(modo = 'añadir', id = null) {
        if (!sidePanel) return;
        sidePanel.classList.remove("hidden");
        
        if (modo === 'añadir') {
            panelTitle.textContent = "Añadir nuevo producto";
            productForm.reset();
            document.getElementById("producto-id").value = "";
        } else if (modo === 'editar' && id !== null) {
            panelTitle.textContent = "Editar producto";
            const p = productos.find(prod => prod.id === id);
            if (p) {
                document.getElementById("producto-id").value = p.id;
                document.getElementById("prod-nombre").value = p.nombre;
                document.getElementById("prod-precio").value = p.precio_base;
                document.getElementById("prod-categoria").value = p.categoria;
                const descTextarea = document.getElementById("prod-desc");
                if (descTextarea && p.descripcion) {
                    descTextarea.value = p.descripcion;
                }
            }
        }
    }

    function cerrarPanel() {
        if (sidePanel) sidePanel.classList.add("hidden");
        if (productForm) productForm.reset();
    }

    if (btnAddProduct) btnAddProduct.addEventListener("click", () => abrirPanel('añadir'));
    if (btnClosePanel) btnClosePanel.addEventListener("click", cerrarPanel);
    if (btnCancel) btnCancel.addEventListener("click", cerrarPanel);

    // Guardar o Actualizar a la API
    if (productForm) {
        productForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const id = document.getElementById("producto-id").value;
            const btnSubmit = productForm.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Guardando...';
            
            const formData = new FormData();
            formData.append("nombre", document.getElementById("prod-nombre").value);
            formData.append("precio_base", document.getElementById("prod-precio").value);
            formData.append("categoria", document.getElementById("prod-categoria").value);
            
            const descTextarea = document.getElementById("prod-desc");
            formData.append("descripcion", descTextarea ? descTextarea.value : "");
            
            const imagenInput = document.getElementById("prod-imagen"); 
            if (imagenInput && imagenInput.files && imagenInput.files[0]) {
                formData.append("imagen", imagenInput.files[0]);
            }

            try {
                let res;
                if (id) {
                    // Modo edición
                    res = await fetch(CONFIG.API_URL + '/productos/' + id, {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: formData
                    });
                } else {
                    // Modo creación
                    res = await fetch(CONFIG.API_URL + '/productos', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: formData
                    });
                }

                if (!res.ok) {
                    if(res.status === 401 || res.status === 403) throw new Error("No tienes permisos o tu sesión ha expirado.");
                    throw new Error("Error al guardar el producto");
                }

                cerrarPanel();
                await cargarProductos(); // Recargar de la BD
                alert(id ? "Producto actualizado correctamente" : "Producto añadido al catálogo");
            } catch (err) {
                console.error(err);
                alert(err.message);
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Guardar Producto';
            }
        });
    }

    // Funciones globales para botones dinámicos
    window.eliminarProducto = async function(id) {
        if(confirm("¿Estás seguro de eliminar este producto de la base de datos?")) {
            try {
                const res = await fetch(CONFIG.API_URL + '/productos/' + id, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                
                if (!res.ok) throw new Error("Error al eliminar el producto");
                
                await cargarProductos();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        }
    };
    
    window.editarProducto = function(id) {
        abrirPanel('editar', id);
    };

    // Cargar productos al inicio
    cargarProductos();
});