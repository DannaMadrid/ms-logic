# Back Project · Node + Prisma + PostgreSQL

API Express conectada a PostgreSQL mediante Prisma.  
Incluye endpoints de prueba: `GET /health` y `GET /db-ping`.

---

## Requisitos
- **Node 18+** (recomendado LTS)
- **PostgreSQL 14+** (local o Docker)
- **Docker Desktop** para levantar Postgres en contenedor

---

1. **Clonar el repositorio**
   ```
   git clone https://github.com/DannaMadrid/ms-logic.git
   cd back-project
   ```

2. **Instalar dependencias**
   ```
   npm install
   ```

3. **Configurar variables de entorno**
   ```
   cp .env.example .env
   ```
   Editar el archivo `.env` con tus credenciales.

4. **Generar cliente Prisma**
   ```
   npx prisma generate
   npx prisma migrate dev --name init_tables **Aplicar migraciones(Crear tablas)**
   ```

5. **Iniciar servidor**
   ```
   cd back-project
   npm run dev
   ```

El servidor estará disponible en `http://localhost:3002`

