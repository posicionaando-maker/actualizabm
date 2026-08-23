// Datos iniciales
let productos = [];
let productoAEliminar = null;

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
});

// Cargar productos desde el archivo JSON
function cargarProductos() {
    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo JSON');
            }
            return response.json();
        })
        .then(data => {
            productos = data;
            renderizarTabla();
            actualizarContador();
        })
        .catch(error => {
            console.error('Error cargando productos:', error);
            // Si no existe el archivo, crear uno con datos de ejemplo
            if (error.message.includes('404')) {
                productos = obtenerDatosEjemplo();
                guardarProductos();
                renderizarTabla();
                actualizarContador();
                mostrarMensaje('Archivo creado con datos de ejemplo', 'info');
            } else {
                mostrarMensaje('Error al cargar los datos: ' + error.message, 'error');
            }
        });
}

// Datos de ejemplo por si el archivo no existe
function obtenerDatosEjemplo() {
    return [
        {
            "id": 1,
            "nombre": "Kit Jardín Urbano",
            "categoria": "kits",
            "precio": 2490,
            "descripcion": "Maceta + sustrato + 3 semillas de girasol. Perfecto para comenzar tu huerto en casa.",
            "stock": 15,
            "codigo": "KIT-001",
            "fecha_registro": "2026-01-15",
            "imagen": "img/productos/kit-jardin.jpg",
            "thumbnail": "img/thumbnails/kit-jardin.jpg",
            "destacado": true,
            "ofertas": true,
            "etiquetas": ["kit", "girasol", "principiante"]
        },
        {
            "id": 2,
            "nombre": "Maceta Autorriego",
            "categoria": "macetas",
            "precio": 1200,
            "descripcion": "Maceta con sistema de autorriego para plantas de interior.",
            "stock": 25,
            "codigo": "MAC-001",
            "fecha_registro": "2026-01-16",
            "imagen": "img/productos/maceta-autorriego.jpg",
            "thumbnail": "img/thumbnails/maceta-autorriego.jpg",
            "destacado": false,
            "ofertas": true,
            "etiquetas": ["maceta", "autorriego", "interior"]
        }
    ];
}

// Guardar productos en el archivo JSON
function guardarProductos() {
    const dataStr = JSON.stringify(productos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Descargar el archivo (en entorno local)
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Renderizar tabla
function renderizarTabla(productosFiltrados = null) {
    const tbody = document.getElementById('productTableBody');
    const datos = productosFiltrados || productos;
    
    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px; color: #999;">No hay productos disponibles</td></tr>`;
        return;
    }
    
    tbody.innerHTML = datos.map(producto => `
        <tr>
            <td>${producto.id}</td>
            <td><strong>${producto.nombre}</strong></td>
            <td>${producto.categoria}</td>
            <td>$${producto.precio.toFixed(0)}</td>
            <td><span class="badge ${producto.stock <= 5 ? 'badge-warning' : ''}">${producto.stock}</span></td>
            <td>${producto.codigo}</td>
            <td>${producto.destacado ? '⭐' : '—'}</td>
            <td>${producto.ofertas ? '🔥' : '—'}</td>
            <td>
                <button onclick="editarProducto(${producto.id})" class="btn btn-primary btn-sm">✏️</button>
                <button onclick="eliminarProducto(${producto.id})" class="btn btn-danger btn-sm">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Actualizar contador
function actualizarContador() {
    document.getElementById('totalProductos').textContent = `Total: ${productos.length} productos`;
}

// Buscar productos
function buscarProductos() {
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!searchText) {
        renderizarTabla();
        return;
    }
    
    const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(searchText) ||
        p.categoria.toLowerCase().includes(searchText) ||
        p.codigo.toLowerCase().includes(searchText) ||
        p.descripcion.toLowerCase().includes(searchText)
    );
    renderizarTabla(filtrados);
}

// Agregar/Editar producto
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editId').value;
    const etiquetas = document.getElementById('etiquetas').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
    
    const productoData = {
        nombre: document.getElementById('nombre').value.trim(),
        categoria: document.getElementById('categoria').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        descripcion: document.getElementById('descripcion').value.trim(),
        stock: parseInt(document.getElementById('stock').value),
        codigo: document.getElementById('codigo').value.trim().toUpperCase(),
        fecha_registro: document.getElementById('fecha_registro').value || new Date().toISOString().split('T')[0],
        imagen: document.getElementById('imagen').value.trim() || 'img/productos/default.jpg',
        thumbnail: document.getElementById('thumbnail').value.trim() || 'img/thumbnails/default.jpg',
        destacado: document.getElementById('destacado').checked,
        ofertas: document.getElementById('ofertas').checked,
        etiquetas: etiquetas
    };
    
    if (editId) {
        // Editar producto existente
        const index = productos.findIndex(p => p.id === parseInt(editId));
        if (index !== -1) {
            productoData.id = parseInt(editId);
            productos[index] = productoData;
            mostrarMensaje('Producto actualizado correctamente', 'success');
        }
    } else {
        // Agregar nuevo producto
        const maxId = productos.reduce((max, p) => Math.max(max, p.id), 0);
        productoData.id = maxId + 1;
        productos.push(productoData);
        mostrarMensaje('Producto agregado correctamente', 'success');
    }
    
    guardarProductos();
    renderizarTabla();
    actualizarContador();
    resetForm();
});

// Resetear formulario
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').textContent = 'Agregar Nuevo Producto';
    document.getElementById('destacado').checked = false;
    document.getElementById('ofertas').checked = false;
    
    // Configurar fecha por defecto
    if (!document.getElementById('fecha_registro').value) {
        document.getElementById('fecha_registro').value = new Date().toISOString().split('T')[0];
    }
}

// Editar producto
function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    document.getElementById('editId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('categoria').value = producto.categoria;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('descripcion').value = producto.descripcion || '';
    document.getElementById('stock').value = producto.stock;
    document.getElementById('codigo').value = producto.codigo;
    document.getElementById('fecha_registro').value = producto.fecha_registro || '';
    document.getElementById('imagen').value = producto.imagen || '';
    document.getElementById('thumbnail').value = producto.thumbnail || '';
    document.getElementById('destacado').checked = producto.destacado || false;
    document.getElementById('ofertas').checked = producto.ofertas || false;
    document.getElementById('etiquetas').value = producto.etiquetas ? producto.etiquetas.join(', ') : '';
    
    document.getElementById('formTitle').textContent = 'Editar Producto';
    
    // Scroll al formulario
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Eliminar producto (mostrar modal)
function eliminarProducto(id) {
    productoAEliminar = id;
    document.getElementById('deleteModal').classList.add('show');
}

// Confirmar eliminación
function confirmDelete() {
    if (productoAEliminar !== null) {
        productos = productos.filter(p => p.id !== productoAEliminar);
        guardarProductos();
        renderizarTabla();
        actualizarContador();
        mostrarMensaje('Producto eliminado correctamente', 'success');
        productoAEliminar = null;
    }
    closeDeleteModal();
}

// Cerrar modal de eliminación
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    productoAEliminar = null;
}

// Exportar JSON
function exportarJSON() {
    guardarProductos();
    mostrarMensaje('Archivo JSON exportado correctamente', 'success');
}

// Importar JSON
function importarJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data)) {
                    productos = data;
                    guardarProductos();
                    renderizarTabla();
                    actualizarContador();
                    mostrarMensaje('Archivo importado correctamente', 'success');
                } else {
                    mostrarMensaje('El archivo no contiene un array válido', 'error');
                }
            } catch (error) {
                mostrarMensaje('Error al leer el archivo: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Mostrar mensaje en modal
function mostrarMensaje(texto, tipo = 'info') {
    const modal = document.getElementById('messageModal');
    const title = document.getElementById('messageTitle');
    const message = document.getElementById('messageText');
    
    const colores = {
        success: '#2ecc71',
        error: '#e74c3c',
        info: '#667eea'
    };
    
    title.style.color = colores[tipo] || colores.info;
    title.textContent = tipo === 'success' ? '✅ Éxito' : tipo === 'error' ? '❌ Error' : 'ℹ️ Información';
    message.textContent = texto;
    modal.classList.add('show');
}

// Cerrar modal de mensaje
function closeMessageModal() {
    document.getElementById('messageModal').classList.remove('show');
}

// Cerrar modales con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDeleteModal();
        closeMessageModal();
    }
});

// Cerrar modales clickeando fuera
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });
});
