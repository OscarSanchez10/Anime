// Definir tipo de entrada de anime
class AnimeEntry {
  constructor(id, title, rating, category, review, imageUrl, status = "watched") {
    this.id = id
    this.title = title
    this.rating = rating || 5
    this.category = category
    this.review = review || ""
    this.imageUrl = imageUrl || ""
    this.date = new Date().toLocaleDateString()
    this.status = status // 'watched' o 'pending'
  }
}

// Elementos DOM
const animeForm = document.getElementById("animeForm")
const titleInput = document.getElementById("title")
const ratingInput = document.getElementById("rating")
const ratingValue = document.getElementById("ratingValue")
const ratingStars = document.getElementById("ratingStars")
const ratingSliderFill = document.getElementById("ratingSliderFill")
const categoryInput = document.getElementById("category")
const statusInput = document.getElementById("status")
const watchedFields = document.getElementById("watchedFields")
const reviewInput = document.getElementById("review")
const imageUrlInput = document.getElementById("imageUrl")
const animeListContainer = document.getElementById("animeList")
const emptyState = document.getElementById("emptyState")
const emptyStateTitle = document.getElementById("emptyStateTitle")
const emptyStateDescription = document.getElementById("emptyStateDescription")
const noResultsState = document.getElementById("noResultsState")
const noResultsText = document.getElementById("noResultsText")
const searchInput = document.getElementById("searchInput")
const animeCount = document.getElementById("animeCount")
const totalAnimeCount = document.getElementById("totalAnime")
const pendingAnimeCount = document.getElementById("pendingAnime")
const avgRatingElement = document.getElementById("avgRating")
const topCategoryElement = document.getElementById("topCategory")
const formTitle = document.getElementById("formTitle")
const formDescription = document.getElementById("formDescription")
const submitButtonText = document.getElementById("submitButtonText")
const cancelButton = document.getElementById("cancelButton")
const clearSearchButton = document.getElementById("clearSearchButton")
const viewButtons = document.querySelectorAll(".view-button")
const emptyStateButton = document.querySelector(".empty-state-button")
const tabButtons = document.querySelectorAll(".tab-button")
const watchedCountBadge = document.getElementById("watchedCount")
const pendingCountBadge = document.getElementById("pendingCount")
const listTitle = document.getElementById("listTitle")
const categoryFilterContainer = document.getElementById("categoryFilterContainer")

// Estado
let animeList = []
let editingId = null
let currentView = "grid" // 'grid' o 'list'
let currentTab = "watched" // 'watched' o 'pending'
let selectedCategories = [] // NUEVO: Para el filtro de categorías

// Funciones auxiliares (simuladas para el ejemplo)
function saveAnimeList() {
  localStorage.setItem("animeList", JSON.stringify(animeList))
  updateTabCounts()
  updateAnimeCount()
  updateStats()
  console.log("Guardando la lista de anime...")
}

function renderAnimeList() {
  // Filtrar por estado actual
  const filteredList = animeList.filter((anime) => anime.status === currentTab)

  if (filteredList.length === 0) {
    showEmptyState()
    return
  }

  emptyState.style.display = "none"
  noResultsState.style.display = "none"
  renderAnimeCards(filteredList)
  console.log("Renderizando la lista de anime...")
}

function setActiveTab(tab) {
  currentTab = tab

  // Actualizar botones activos
  tabButtons.forEach((btn) => btn.classList.remove("active"))
  document.querySelector(`.tab-button[data-tab="${tab}"]`).classList.add("active")

  // Actualizar título de la lista
  if (tab === "watched") {
    listTitle.textContent = "Animes Finalizados"
    emptyStateTitle.textContent = "No tienes animes finalizados"
    emptyStateDescription.textContent = "Añade animes que ya hayas visto o marca alguno como finalizado"
  } else {
    listTitle.textContent = "Animes Pendientes"
    emptyStateTitle.textContent = "No tienes animes pendientes"
    emptyStateDescription.textContent = "Añade animes que quieras ver en el futuro"
  }

  // Limpiar búsqueda
  searchInput.value = ""

  // Renderizar la lista
  renderAnimeList()
  updateAnimeCount()
  console.log("Cambiando a la pestaña:", tab)
}

function showNotification(message) {
  // Crear elemento de notificación
  const notification = document.createElement("div")
  notification.className = "notification"
  notification.innerHTML = `
    <div class="notification-content">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    </div>
  `

  // Agregar estilos
  const style = document.createElement("style")
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      animation: slideInRight 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
    }
    
    .notification-content {
      background: linear-gradient(to right, var(--primary-light), var(--secondary-light));
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `

  document.head.appendChild(style)
  document.body.appendChild(notification)

  // Eliminar notificación después de 3 segundos
  setTimeout(() => {
    document.body.removeChild(notification)
  }, 3000)
}

// Inicializar estrellas de calificación
function renderRatingStars() {
  ratingStars.innerHTML = ""
  const rating = Number.parseInt(ratingInput.value)

  // Actualizar el relleno del slider
  const percentage = ((rating - 1) / 9) * 100
  ratingSliderFill.style.width = `${percentage}%`

  for (let i = 0; i < 10; i++) {
    const starButton = document.createElement("button")
    starButton.type = "button"
    starButton.className = "star-button"
    starButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${i < rating ? "currentColor" : "none"}" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
        class="${i < rating ? "star-filled" : "star-empty"}">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `

    // Agregar evento para cambiar la calificación al hacer clic en una estrella
    starButton.addEventListener("click", () => {
      ratingInput.value = i + 1
      ratingValue.textContent = i + 1
      renderRatingStars()
    })

    ratingStars.appendChild(starButton)
  }

  // Agregar el valor numérico
  const ratingText = document.createElement("span")
  ratingText.className = "rating-value"
  ratingText.textContent = `${rating}/10`
  ratingStars.appendChild(ratingText)
}

// Función para cargar la lista de anime
function loadAnimeList() {
  const savedAnime = localStorage.getItem("animeList")
  if (savedAnime) {
    animeList = JSON.parse(savedAnime)
    updateTabCounts()
    renderAnimeList()
    updateAnimeCount()
    updateStats()
  }
  console.log("Cargando la lista de anime...")
}

// Actualizar contador de anime
function updateAnimeCount() {
  const filteredByStatus = animeList.filter((anime) => anime.status === currentTab)

  // Aplicar filtro de categoría si hay categorías seleccionadas
  const filteredList =
    selectedCategories.length > 0
      ? filteredByStatus.filter((anime) => selectedCategories.includes(anime.category))
      : filteredByStatus

  const count = filteredList.length
  animeCount.textContent = `${count} ${count === 1 ? "anime" : "animes"}`
}

// Actualizar contadores de pestañas
function updateTabCounts() {
  const watchedCount = animeList.filter((anime) => anime.status === "watched").length
  const pendingCount = animeList.filter((anime) => anime.status === "pending").length

  watchedCountBadge.textContent = watchedCount
  pendingCountBadge.textContent = pendingCount
}

// Actualizar estadísticas
function updateStats() {
  // Total de anime
  totalAnimeCount.textContent = animeList.length

  // Animes pendientes
  const pendingCount = animeList.filter((anime) => anime.status === "pending").length
  pendingAnimeCount.textContent = pendingCount

  // Calificación media (solo de los vistos)
  const watchedAnimes = animeList.filter((anime) => anime.status === "watched")
  if (watchedAnimes.length > 0) {
    const totalRating = watchedAnimes.reduce((sum, anime) => sum + anime.rating, 0)
    const avgRating = (totalRating / watchedAnimes.length).toFixed(1)
    avgRatingElement.textContent = avgRating
  } else {
    avgRatingElement.textContent = "0.0"
  }

  // Categoría más común
  if (animeList.length > 0) {
    const categoryCounts = {}
    animeList.forEach((anime) => {
      categoryCounts[anime.category] = (categoryCounts[anime.category] || 0) + 1
    })

    let topCategory = ""
    let maxCount = 0

    for (const category in categoryCounts) {
      if (categoryCounts[category] > maxCount) {
        maxCount = categoryCounts[category]
        topCategory = category
      }
    }

    topCategoryElement.textContent = topCategory
  } else {
    topCategoryElement.textContent = "-"
  }
}

// Manejar envío del formulario
animeForm.addEventListener("submit", (e) => {
  e.preventDefault()

  if (!titleInput.value || !categoryInput.value) return

  const status = statusInput.value
  const rating = status === "watched" ? Number.parseInt(ratingInput.value) : 0
  const review = status === "watched" ? reviewInput.value : ""

  if (editingId) {
    // Actualizar anime existente
    const index = animeList.findIndex((anime) => anime.id === editingId)
    if (index !== -1) {
      animeList[index] = {
        ...animeList[index],
        title: titleInput.value,
        rating: rating,
        category: categoryInput.value,
        review: review,
        imageUrl: imageUrlInput.value,
        status: status,
      }
    }

    // Restablecer modo de edición
    editingId = null
    formTitle.textContent = "Añadir Nuevo Anime"
    formDescription.textContent = "Completa los detalles sobre un anime"
    submitButtonText.textContent = "Guardar Anime"
    cancelButton.style.display = "none"
  } else {
    // Crear nuevo anime
    const newAnime = new AnimeEntry(
      Date.now().toString(),
      titleInput.value,
      rating,
      categoryInput.value,
      review,
      imageUrlInput.value,
      status,
    )

    animeList.unshift(newAnime)
  }

  saveAnimeList()

  // Si estamos en la pestaña correcta, renderizar la lista
  if (currentTab === status) {
    renderAnimeList()
  } else {
    // Si no, cambiar a la pestaña correspondiente
    setActiveTab(status)
  }

  // Mostrar notificación de éxito
  showNotification(editingId ? "Anime actualizado con éxito" : "Anime añadido con éxito")

  // Reiniciar formulario
  animeForm.reset()
  ratingInput.value = 5
  ratingValue.textContent = 5
  renderRatingStars()
  watchedFields.style.display = "block"
})

// Cancelar edición
cancelButton.addEventListener("click", () => {
  editingId = null
  formTitle.textContent = "Añadir Nuevo Anime"
  formDescription.textContent = "Completa los detalles sobre un anime"
  submitButtonText.textContent = "Guardar Anime"
  cancelButton.style.display = "none"

  // Reiniciar formulario
  animeForm.reset()
  ratingInput.value = 5
  ratingValue.textContent = 5
  renderRatingStars()
  watchedFields.style.display = "block"
})

// Eliminar una entrada de anime
function deleteAnime(id) {
  // Crear un modal de confirmación personalizado
  const confirmModal = document.createElement("div")
  confirmModal.className = "confirm-modal"
  confirmModal.innerHTML = `
    <div class="confirm-modal-content glass-card">
      <h3>Confirmar eliminación</h3>
      <p>¿Estás seguro de que quieres eliminar este anime?</p>
      <div class="confirm-modal-actions">
        <button class="btn btn-outline" id="cancelDelete">Cancelar</button>
        <button class="btn btn-primary" id="confirmDelete">Eliminar</button>
      </div>
    </div>
  `

  document.body.appendChild(confirmModal)

  // Agregar estilos al modal
  const style = document.createElement("style")
  style.textContent = `
    .confirm-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }
    
    .confirm-modal-content {
      width: 90%;
      max-width: 400px;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      text-align: center;
      animation: slideUp 0.3s ease;
    }
    
    .confirm-modal-content h3 {
      margin-bottom: 1rem;
      font-size: 1.25rem;
      font-weight: 700;
    }
    
    .confirm-modal-content p {
      margin-bottom: 1.5rem;
      color: var(--muted);
    }
    
    .confirm-modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .confirm-modal-actions button {
      min-width: 100px;
    }
  `

  document.head.appendChild(style)

  // Manejar acciones del modal
  document.getElementById("cancelDelete").addEventListener("click", () => {
    document.body.removeChild(confirmModal)
  })

  document.getElementById("confirmDelete").addEventListener("click", () => {
    animeList = animeList.filter((anime) => anime.id !== id)
    saveAnimeList()
    renderAnimeList()
    document.body.removeChild(confirmModal)
    showNotification("Anime eliminado con éxito")
  })
}

// Editar una entrada de anime
function editAnime(id) {
  const anime = animeList.find((anime) => anime.id === id)
  if (anime) {
    editingId = id

    // Actualizar formulario con datos del anime
    titleInput.value = anime.title
    statusInput.value = anime.status
    categoryInput.value = anime.category
    imageUrlInput.value = anime.imageUrl || ""

    // Mostrar/ocultar campos según el estado
    if (anime.status === "watched") {
      watchedFields.style.display = "block"
      ratingInput.value = anime.rating
      ratingValue.textContent = anime.rating
      reviewInput.value = anime.review || ""
    } else {
      watchedFields.style.display = "none"
    }

    // Actualizar UI para modo de edición
    formTitle.textContent = "Editar Anime"
    formDescription.textContent = "Actualiza los detalles de este anime"
    submitButtonText.textContent = "Actualizar"
    cancelButton.style.display = "block"

    // Actualizar estrellas de calificación
    renderRatingStars()

    // Desplazarse al formulario con animación suave
    animeForm.scrollIntoView({ behavior: "smooth" })
  }
}

// Cambiar el estado de un anime (watched/pending)
function toggleAnimeStatus(id) {
  const index = animeList.findIndex((anime) => anime.id === id)
  if (index !== -1) {
    // Cambiar el estado
    animeList[index].status = animeList[index].status === "watched" ? "pending" : "watched"

    // Si cambia a "watched", asignar una calificación por defecto
    if (animeList[index].status === "watched" && !animeList[index].rating) {
      animeList[index].rating = 5
    }

    saveAnimeList()
    renderAnimeList()
    showNotification(`Anime marcado como ${animeList[index].status === "watched" ? "finalizado" : "pendiente"}`)
  }
}

// Filtrar lista de anime basado en la consulta de búsqueda
searchInput.addEventListener("input", () => {
  filterAnimeList()
})

// Limpiar búsqueda
clearSearchButton.addEventListener("click", () => {
  searchInput.value = ""
  filterAnimeList()
})

function filterAnimeList() {
  const query = searchInput.value.toLowerCase()

  // Filtrar por estado actual
  const filteredByStatus = animeList.filter((anime) => anime.status === currentTab)

  if (filteredByStatus.length === 0) {
    showEmptyState()
    return
  }

  // Aplicar filtro de categoría si hay categorías seleccionadas
  const filteredByCategory =
    selectedCategories.length > 0
      ? filteredByStatus.filter((anime) => selectedCategories.includes(anime.category))
      : filteredByStatus

  // Aplicar filtro de búsqueda
  const filteredBySearch = filteredByCategory.filter((anime) => anime.title.toLowerCase().includes(query))

  if (filteredBySearch.length === 0) {
    emptyState.style.display = "none"
    noResultsState.style.display = "flex"

    // Determinar el mensaje según los filtros aplicados
    if (selectedCategories.length > 0 && query) {
      noResultsText.textContent = `No hay anime que coincida con "${query}" en las categorías seleccionadas`
    } else if (selectedCategories.length > 0) {
      noResultsText.textContent = `No hay anime en las categorías seleccionadas`
    } else if (query) {
      noResultsText.textContent = `No hay anime que coincida con "${query}"`
    } else {
      noResultsText.textContent = `No se encontraron resultados`
    }

    animeListContainer.innerHTML = ""
  } else {
    emptyState.style.display = "none"
    noResultsState.style.display = "none"
    renderAnimeCards(filteredBySearch)
  }

  // Actualizar contador
  animeCount.textContent = `${filteredBySearch.length} ${filteredBySearch.length === 1 ? "anime" : "animes"}`
}

// Cambiar vista (grid o lista)
viewButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const view = this.getAttribute("data-view")

    // Actualizar botones activos
    viewButtons.forEach((btn) => btn.classList.remove("active"))
    this.classList.add("active")

    // Cambiar vista
    currentView = view
    animeListContainer.className = view === "grid" ? "anime-grid" : "anime-list"

    // Volver a renderizar la lista
    filterAnimeList()
  })
})

// Cambiar pestaña (finalizados o pendientes)
tabButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const tab = this.getAttribute("data-tab")
    setActiveTab(tab)

    // Resetear filtros de categoría al cambiar de pestaña
    selectedCategories = []
    updateCategoryFilterUI()
  })
})

// Mostrar estado vacío
function showEmptyState() {
  emptyState.style.display = "flex"
  noResultsState.style.display = "none"
  animeListContainer.innerHTML = ""
}

// Renderizar las tarjetas de anime
function renderAnimeCards(list) {
  animeListContainer.innerHTML = ""

  if (currentView === "grid") {
    // Vista de cuadrícula
    list.forEach((anime) => {
      const animeCard = document.createElement("div")
      animeCard.className = "glass-card anime-card"

      // Contenido de la imagen
      let imageContent = ""
      if (anime.imageUrl) {
        imageContent = `
          <div class="anime-image-container">
            <img
              src="${anime.imageUrl}"
              alt="${anime.title}"
              class="anime-image"
              onerror="this.src='https://placehold.co/400x600/333/666?text=Imagen+No+Encontrada';"
            />
          </div>
        `
      } else {
        imageContent = `
          <div class="anime-image-container">
            <div class="anime-image-placeholder">${anime.title}</div>
          </div>
        `
      }

      // Estrellas de calificación (solo para animes vistos)
      let ratingHtml = ""
      if (anime.status === "watched") {
        const starsHtml = Array.from(
          { length: 5 },
          (_, i) => `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
            fill="${i < Math.round(anime.rating / 2) ? "currentColor" : "none"}" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            class="${i < Math.round(anime.rating / 2) ? "star-filled" : "star-empty"}">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        `,
        ).join("")

        ratingHtml = `
          <div class="anime-rating">
            ${starsHtml}
            <span class="rating-value">${anime.rating}/10</span>
          </div>
        `
      }

      // Botón de estado
      let statusButtonHtml = ""
      if (anime.status === "watched") {
        statusButtonHtml = `
          <button class="action-button status-button" data-id="${anime.id}" aria-label="Marcar como pendiente">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
          </button>
        `
      } else {
        statusButtonHtml = `
          <button class="action-button status-button" data-id="${anime.id}" aria-label="Marcar como finalizado">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </button>
        `
      }

      // Insignia de estado
      const statusBadgeHtml = `
        <span class="status-badge ${anime.status === "watched" ? "status-badge-watched" : "status-badge-pending"}">
          ${anime.status === "watched" ? "Finalizado" : "Pendiente"}
        </span>
      `

      animeCard.innerHTML = `
        ${imageContent}
        <div class="anime-card-actions">
          ${statusButtonHtml}
          <button class="action-button edit-button" aria-label="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="action-button delete-button" aria-label="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
        <div class="anime-card-content">
          <h3 class="anime-title">${anime.title}</h3>
          <div class="anime-meta">
            <span class="anime-category">${anime.category}</span>
            ${statusBadgeHtml}
            <span class="anime-date">${anime.date}</span>
          </div>
          ${ratingHtml}
          ${anime.review && anime.status === "watched" ? `<p class="anime-review">${anime.review}</p>` : ""}
        </div>
      `

      // Agregar eventos a los botones
      animeCard.querySelector(".edit-button").addEventListener("click", () => editAnime(anime.id))
      animeCard.querySelector(".delete-button").addEventListener("click", () => deleteAnime(anime.id))
      animeCard.querySelector(".status-button").addEventListener("click", () => toggleAnimeStatus(anime.id))

      animeListContainer.appendChild(animeCard)
    })
  } else {
    // Vista de lista
    list.forEach((anime) => {
      const animeItem = document.createElement("div")
      animeItem.className = "anime-list-item"

      // Imagen
      let imageHtml = ""
      if (anime.imageUrl) {
        imageHtml = `<img src="${anime.imageUrl}" alt="${anime.title}" class="anime-list-image" onerror="this.src='https://placehold.co/400x600/333/666?text=No+Image';">`
      } else {
        imageHtml = `<div class="anime-list-image anime-image-placeholder">${anime.title.charAt(0)}</div>`
      }

      // Estrellas de calificación (solo para animes vistos)
      let ratingHtml = ""
      if (anime.status === "watched") {
        const starsHtml = Array.from(
          { length: 5 },
          (_, i) => `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" 
            fill="${i < Math.round(anime.rating / 2) ? "currentColor" : "none"}" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            class="${i < Math.round(anime.rating / 2) ? "star-filled" : "star-empty"}">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        `,
        ).join("")

        ratingHtml = `
          <div class="anime-rating">
            ${starsHtml}
            <span class="rating-value">${anime.rating}/10</span>
          </div>
        `
      }

      // Insignia de estado
      const statusBadgeHtml = `
        <span class="status-badge ${anime.status === "watched" ? "status-badge-watched" : "status-badge-pending"}">
          ${anime.status === "watched" ? "Finalizado" : "Pendiente"}
        </span>
      `

      animeItem.innerHTML = `
        ${imageHtml}
        <div class="anime-list-content">
          <div class="anime-title">${anime.title}</div>
          <div class="anime-meta">
            <span class="anime-category">${anime.category}</span>
            ${statusBadgeHtml}
            <span class="anime-date">${anime.date}</span>
          </div>
          ${ratingHtml}
          ${anime.review && anime.status === "watched" ? `<p class="anime-review">${anime.review}</p>` : ""}
          <div class="anime-list-actions">
            <button class="btn btn-secondary btn-sm status-list-button" data-id="${anime.id}">
              ${anime.status === "watched" ? "Marcar Pendiente" : "Marcar Finalizado"}
            </button>
            <button class="btn btn-secondary btn-sm edit-list-button">Editar</button>
            <button class="btn btn-outline btn-sm delete-list-button">Eliminar</button>
          </div>
        </div>
      `

      // Agregar eventos a los botones
      animeItem.querySelector(".edit-list-button").addEventListener("click", () => editAnime(anime.id))
      animeItem.querySelector(".delete-list-button").addEventListener("click", () => deleteAnime(anime.id))
      animeItem.querySelector(".status-list-button").addEventListener("click", () => toggleAnimeStatus(anime.id))

      animeListContainer.appendChild(animeItem)
    })
  }
}

// Mostrar/ocultar campos según el estado
statusInput.addEventListener("change", function () {
  if (this.value === "watched") {
    watchedFields.style.display = "block"
  } else {
    watchedFields.style.display = "none"
  }
})

// Botón para añadir primer anime
emptyStateButton.addEventListener("click", () => {
  titleInput.focus()
})

// Actualizar visualización de calificación cuando cambia el deslizador
ratingInput.addEventListener("input", function () {
  const rating = Number.parseInt(this.value)
  ratingValue.textContent = rating
  renderRatingStars()
})

// NUEVO: Renderizar el filtro de categorías
function renderCategoryFilter() {
  if (!categoryFilterContainer) return

  // Crear el contenido del filtro de categorías
  categoryFilterContainer.innerHTML = `
    <div class="filter-dropdown">
      <button class="category-filter-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        Filtrar por Categoría
        <span class="filter-badge" style="display: none;">0</span>
      </button>
      <div class="filter-dropdown-content" style="display: none;">
        <div class="filter-dropdown-header">
          <h3>Filtrar por Categoría</h3>
          <button class="filter-close-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="filter-dropdown-content-inner">
          <div class="filter-categories"></div>
          <div class="filter-actions">
            <button class="btn btn-outline btn-sm clear-filters-button" disabled>Limpiar filtros</button>
            <button class="btn btn-primary btn-sm apply-filters-button">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
    <div class="selected-categories-container" style="display: none;"></div>
  `

  // Obtener elementos del DOM
  const filterButton = categoryFilterContainer.querySelector(".category-filter-button")
  const filterBadge = categoryFilterContainer.querySelector(".filter-badge")
  const dropdownContent = categoryFilterContainer.querySelector(".filter-dropdown-content")
  const closeButton = categoryFilterContainer.querySelector(".filter-close-button")
  const categoriesContainer = categoryFilterContainer.querySelector(".filter-categories")
  const clearFiltersButton = categoryFilterContainer.querySelector(".clear-filters-button")
  const applyFiltersButton = categoryFilterContainer.querySelector(".apply-filters-button")
  const selectedCategoriesContainer = categoryFilterContainer.querySelector(".selected-categories-container")

  // Obtener categorías únicas de la lista de anime
  const uniqueCategories = [...new Set(animeList.map((anime) => anime.category))].filter(Boolean).sort()

  // Renderizar checkboxes para cada categoría
  categoriesContainer.innerHTML = uniqueCategories
    .map(
      (category) => `
    <label class="filter-category-checkbox">
      <input type="checkbox" value="${category}" class="category-checkbox" ${selectedCategories.includes(category) ? "checked" : ""}>
      <span class="checkbox-custom"></span>
      <span class="checkbox-label">${category}</span>
    </label>
  `,
    )
    .join("")

  // Eventos
  filterButton.addEventListener("click", (e) => {
    e.stopPropagation()
    dropdownContent.style.display = dropdownContent.style.display === "none" ? "block" : "none"
  })

  closeButton.addEventListener("click", () => {
    dropdownContent.style.display = "none"
  })

  // Cerrar el dropdown al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!categoryFilterContainer.contains(e.target)) {
      dropdownContent.style.display = "none"
    }
  })

  // Limpiar filtros
  clearFiltersButton.addEventListener("click", () => {
    const checkboxes = categoriesContainer.querySelectorAll(".category-checkbox")
    checkboxes.forEach((checkbox) => (checkbox.checked = false))
    clearFiltersButton.disabled = true
  })

  // Aplicar filtros
  applyFiltersButton.addEventListener("click", () => {
    const checkboxes = categoriesContainer.querySelectorAll(".category-checkbox:checked")
    selectedCategories = Array.from(checkboxes).map((checkbox) => checkbox.value)

    updateCategoryFilterUI()
    filterAnimeList()
    dropdownContent.style.display = "none"
  })
}

// NUEVO: Actualizar la UI del filtro de categorías
function updateCategoryFilterUI() {
  if (!categoryFilterContainer) return

  const filterBadge = categoryFilterContainer.querySelector(".filter-badge")
  const clearFiltersButton = categoryFilterContainer.querySelector(".clear-filters-button")
  const selectedCategoriesContainer = categoryFilterContainer.querySelector(".selected-categories-container")

  // Actualizar el badge
  if (selectedCategories.length > 0) {
    filterBadge.textContent = selectedCategories.length
    filterBadge.style.display = "inline-flex"
    clearFiltersButton.disabled = false
  } else {
    filterBadge.style.display = "none"
    clearFiltersButton.disabled = true
  }

  // Actualizar el contenedor de categorías seleccionadas
  if (selectedCategories.length > 0) {
    selectedCategoriesContainer.style.display = "flex"
    selectedCategoriesContainer.innerHTML = `
      ${selectedCategories
        .map(
          (category) => `
        <div class="selected-category-badge">
          <span>${category}</span>
          <button class="badge-remove-button" data-category="${category}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `,
        )
        .join("")}
      <button class="btn btn-outline btn-sm clear-all-button">Limpiar todos</button>
    `

    // Agregar eventos a los botones de eliminar
    const removeButtons = selectedCategoriesContainer.querySelectorAll(".badge-remove-button")
    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const category = this.getAttribute("data-category")
        selectedCategories = selectedCategories.filter((cat) => cat !== category)
        updateCategoryFilterUI()
        filterAnimeList()
      })
    })

    // Agregar evento al botón de limpiar todos
    const clearAllButton = selectedCategoriesContainer.querySelector(".clear-all-button")
    clearAllButton.addEventListener("click", () => {
      selectedCategories = []
      updateCategoryFilterUI()
      filterAnimeList()
    })
  } else {
    selectedCategoriesContainer.style.display = "none"
  }
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar estrellas de calificación
  renderRatingStars()

  // Cargar anime guardado al cargar la página
  loadAnimeList()

  // Renderizar el filtro de categorías
  renderCategoryFilter()

  // Establecer pestaña activa inicial
  setActiveTab("watched")

  // Agregar efectos de desplazamiento SOLO a las tarjetas de anime y estadísticas, NO al formulario
  document.querySelectorAll(".stat-item, .anime-card").forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const angleX = (y - centerY) / 20
      const angleY = (centerX - x) / 20

      this.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = ""
    })
  })
})
