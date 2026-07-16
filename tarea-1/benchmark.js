/**
 * benchmark.js
 *
 * Mide latencia de endpoints POST.
 *
 * Uso:
 * node benchmark.js <URL> [numero_de_peticiones]
 *
 * Ejemplos:
 * node benchmark.js http://localhost:3000/api/transacciones 200
 * node benchmark.js http://localhost:3000/api/usuarios/evento 200
 */

const url = process.argv[2];
const n = Number(process.argv[3]) || 200;

if (!url) {
  console.error(
    '❌ Falta la URL.\nUso: node benchmark.js <URL> [numero_de_peticiones]'
  );
  process.exit(1);
}


function percentil(valoresOrdenados, p) {
  const idx = Math.ceil((p / 100) * valoresOrdenados.length) - 1;
  return valoresOrdenados[Math.max(0, idx)];
}


function construirBody(url, i) {

  if (url.includes('transacciones')) {

    return {
      sourceAccountId: 'a7b8c9d0-1111-4444-8888-123456789abc',
      type: 'DEPOSITO',
      amount: 100,
      refCode: `BENCH-${i}`,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1'
    };

  }


  if (url.includes('usuarios/evento')) {

    return {
      type: 'create',
      name: `Sebastian-${i}`,
      identityId: `123456789${i}`,
      email: `bench${i}@test.com`,
      role: 'CLIENTE'
    };

  }


  return {};
}



(async () => {

  console.log(`\n▶️ Midiendo ${url}`);
  console.log(`▶️ Peticiones: ${n}\n`);


  const tiempos = [];
  let errores = 0;


  for (let i = 0; i < n; i++) {

    const inicio = Date.now();

    try {

      const body = construirBody(url, i);


      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });


      const respuesta = await res.text();


      if (!res.ok) {

        errores++;

        if (n <= 5) {
          console.log(
            `\n❌ Error HTTP ${res.status}: ${respuesta}`
          );
        }

      }


    } catch (error) {

      errores++;

      if (n <= 5) {
        console.log(
          `\n❌ Error conexión: ${error.message}`
        );
      }

    }


    tiempos.push(Date.now() - inicio);


    if ((i + 1) % 50 === 0) {
      process.stdout.write(`  ${i + 1}/${n}\r`);
    }

  }



  tiempos.sort((a,b) => a-b);


  const promedio =
    tiempos.reduce((a,b) => a+b,0) / tiempos.length;


  const p95 = percentil(tiempos,95);

  const max = tiempos[tiempos.length-1];


  console.log('\n\n──────────── RESULTADOS ────────────');

  console.log(`Endpoint          : ${url}`);
  console.log(`Peticiones        : ${n}`);
  console.log(`Latencia promedio : ${promedio.toFixed(2)} ms`);
  console.log(`Latencia p95      : ${p95.toFixed(2)} ms`);
  console.log(`Latencia máxima   : ${max.toFixed(2)} ms`);
  console.log(`Errores           : ${errores}`);

  console.log('────────────────────────────────────');


  console.log('\n📋 Fila para README:\n');

  console.log(
    `| ${url} | ${promedio.toFixed(2)} | ${p95.toFixed(2)} | ${max.toFixed(2)} |`
  );


})();