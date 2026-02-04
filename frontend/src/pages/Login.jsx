export default function Login() {
  return (
    <div style={{ padding: "40px" }}>
      <h2>SmartRent CRM</h2>
      <h4>Inicio de sesión</h4>

      <form>
        <input type="email" placeholder="Correo electrónico" />
        <br /><br />
        <input type="password" placeholder="Contraseña" />
        <br /><br />
        <button type="button">Iniciar sesión</button>
      </form>
    </div>
  );
}
