# 🏠 SmartRent CRM

<div align="center">

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=flat&logo=twilio&logoColor=white)

**CRM full stack para la gestión inteligente de propiedades en renta**

· [Reportar un bug](https://github.com/FJSaladin/smartrent-crm/issues) · [Solicitar función](https://github.com/FJSaladin/smartrent-crm/issues)

</div>

---

## 📋 Descripción

SmartRent CRM es una plataforma web completa que centraliza la gestión de propiedades en renta. Permite a los propietarios (*landlords*) administrar propiedades, unidades, inquilinos y contratos, mientras que los inquilinos (*tenants*) cuentan con su propio portal para consultar su contrato activo y reportar incidencias de mantenimiento — incluso por WhatsApp.

---

## ✨ Funcionalidades principales

### Para el propietario (Landlord)
| Módulo | Descripción |
|--------|-------------|
| 🏢 **Propiedades** | Alta, edición y eliminación de propiedades con dirección y notas |
| 🚪 **Unidades** | Gestión de unidades por propiedad: habitaciones, baños, renta y estado (vacante/ocupada) |
| 👥 **Inquilinos** | Registro de inquilinos con datos de contacto y vinculación a usuarios del sistema |
| 📄 **Contratos** | Contratos de arrendamiento con fechas, monto, depósito, día de pago y estado |
| 🔧 **Tickets** | Panel de mantenimiento con filtros por inquilino, propiedad y estado. Actualización de prioridad y estado en línea |
| 📧 **Comunicaciones** | Respuesta a tickets vía email (Nodemailer) y WhatsApp (Twilio), con historial por ticket |
| 📊 **Dashboard** | Estadísticas en tiempo real: ocupación, contratos activos, tickets urgentes pendientes |

### Para el inquilino (Tenant)
| Módulo | Descripción |
|--------|-------------|
| 🏠 **Mi portal** | Detalle de su contrato activo: propiedad, unidad, renta, fechas y alerta de vencimiento próximo |
| 🔧 **Mis tickets** | Historial de reportes de mantenimiento con estado y timeline de comunicaciones |
| ➕ **Reportar problema** | Formulario de nuevo ticket — la IA clasifica automáticamente la prioridad y categoría |
| 💬 **WhatsApp** | Los inquilinos pueden reportar problemas enviando un mensaje de WhatsApp |

### Inteligencia artificial integrada
- Análisis automático de la descripción del ticket con **Llama 3.2** (vía Ollama local)
- Asignación automática de título, categoría (`plomería`, `eléctrico`, `hvac`, `estructural`) y prioridad (`alta`, `media`, `baja`)
- Sugerencia interna para el propietario sobre cómo gestionar el problema

---

## 🛠 Stack tecnológico

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (autenticación) + bcryptjs (cifrado de contraseñas)
- Nodemailer (emails transaccionales)
- Twilio (WhatsApp: envío y recepción de mensajes)
- Ollama + Llama 3.2 (IA local para análisis de tickets)
- OpenAI SDK

**Frontend**
- React 19 + Vite 7
- React Router DOM 7
- CSS-in-JS con sistema de diseño propio (tema oscuro)
- Modo mock integrado para desarrollo sin backend

---

## 🚀 Instalación y ejecución local

### Prerrequisitos
- Node.js >= 20
- MongoDB (local o Atlas)
- Cuenta de Twilio (para WhatsApp)
- [Ollama](https://ollama.com/) instalado con el modelo `llama3.2`

### 1. Clonar el repositorio

```bash
git clone https://github.com/FJSaladin/smartrent-crm.git
cd smartrent-crm
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en `backend/` con las siguientes variables:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/smartrent
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=1d
APP_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.tuproveedor.com
SMTP_PORT=587
SMTP_USER=tu@email.com
SMTP_PASS=tu_contraseña

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+1415xxxxxxx
```

Ejecutar el servidor:

```bash
npm run dev
```

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

Crea un archivo `.env` en `frontend/`:

```env
VITE_API_URL=http://localhost:4000
```

> ⚠️ Si no defines `VITE_API_URL`, el frontend funciona en **modo mock** con datos de prueba — ideal para explorar la UI sin backend.

Ejecutar el cliente:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

