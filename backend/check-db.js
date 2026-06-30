const { Client } = require('pg');

const passwords = ['postgres', 'root', '1234', '12345', 'password', 'admin', ''];

async function tryPasswords() {
  for (const pwd of passwords) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      password: pwd,
      port: 5432,
      database: 'postgres'
    });

    try {
      await client.connect();
      console.log(`¡ÉXITO! La contraseña es: '${pwd}'`);
      await client.end();
      return pwd;
    } catch (err) {
      // console.log(`Falló con: '${pwd}'`);
    }
  }
  console.log("Ninguna de las contraseñas comunes funcionó.");
  return null;
}

tryPasswords();
