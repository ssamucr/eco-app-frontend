// Los colores del selector del diseño. Cada categoría toma uno según su id (no se guarda: la base no tiene ese dato).
const PALETA = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948', '#c3c2b7']

export const colorCategoria = (idCategoria) => PALETA[(idCategoria - 1) % PALETA.length]
